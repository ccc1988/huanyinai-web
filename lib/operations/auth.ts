import { createHash, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import type { DatabaseSync } from 'node:sqlite';
import { DEFAULT_ACCESS_TOKEN_MINUTES, DEFAULT_SECRET_DAYS, SCOPES, assertScopes, parseScopes, type Scope } from './config.ts';
import { newId, nowIso } from './db.ts';
import { audit } from './receipt.ts';
import { fail, inTransaction, utcDate } from './core.ts';
export interface ClientRecord {
    id: string;
    name: string;
    scopes: string[];
    status: string;
    createdAt: string;
    updatedAt: string;
    lastUsedAt: string | null;
    expiresAt: string;
    resources: string[];
    resourceIds: Record<string, string[]>;
    autoPublish: boolean;
    rateLimit: number;
    tokenMinutes: number;
}
export interface AuthContext {
    clientId: string;
    tokenId: string;
    scopes: string[];
    requestId: string;
    resources: string[];
    resourceIds: Record<string, string[]>;
    autoPublish: boolean;
    rateLimit: number;
    remaining: number;
    resetAt: number;
}
export interface IssuedToken {
    accessToken: string;
    tokenType: 'Bearer';
    expiresIn: number;
    scope: string;
}
const hash = (s: string) => createHash('sha256').update(s).digest('hex');
const secretHash = (s: string) => { const salt = randomBytes(16).toString('hex'); return salt + ':' + scryptSync(s, salt, 32).toString('hex'); };
function matches(secret: string, stored: string) { if (!stored.includes(':'))
    return timingSafeEqual(Buffer.from(hash(secret)), Buffer.from(stored)); const [salt, h] = stored.split(':'); const a = scryptSync(secret, salt, 32), b = Buffer.from(h, 'hex'); return a.length === b.length && timingSafeEqual(a, b); }
const allowedResources = ['blog-posts', 'cases', 'industries', 'company', 'customers', 'capabilities', 'stats', 'contacts', 'settings', 'pages', 'media', 'analytics', 'submissions'];
function grant(resources: string[] | undefined) { const r = resources ?? ['*']; if (!Array.isArray(r) || r.some(x => x !== '*' && !allowedResources.includes(x)))
    fail(400, 'invalid_resources'); return r; }
function resourceIds(value: unknown) { const data = value ?? {}; if (!data || typeof data !== 'object' || Array.isArray(data))
    fail(400, 'invalid_resource_ids'); for (const [k, v] of Object.entries(data))
    if (!allowedResources.includes(k) || !Array.isArray(v) || v.some(x => typeof x !== 'string'))
        fail(400, 'invalid_resource_ids'); return data as Record<string, string[]>; }
function positive(value: number, min: number, max: number) { if (!Number.isInteger(value) || value < min || value > max)
    fail(400, 'invalid_limit'); return value; }
function ttl(value: number) { if (![15, 30, 60].includes(value))
    fail(400, 'invalid_token_duration'); return value; }
export function createClient(db: DatabaseSync, input: {
    name: string;
    scopes: string[];
    secretDays?: number;
    expiresAt?: string;
    resources?: string[];
    resourceIds?: Record<string, string[]>;
    autoPublish?: boolean;
    rateLimit?: number;
    tokenMinutes?: number;
}) {
    assertScopes(input.scopes);
    if (typeof input.name !== 'string' || !input.name.trim() || input.name.length > 120)
        fail(400, 'invalid_client_name');
    const expires = utcDate(input.expiresAt);
    if (Date.parse(expires) <= Date.now())
        fail(400, 'invalid_expiry');
    const days = positive(input.secretDays ?? DEFAULT_SECRET_DAYS, 1, 90), resources = grant(input.resources), ids = resourceIds(input.resourceIds), limit = positive(input.rateLimit ?? 120, 1, 1000), minutes = ttl(input.tokenMinutes ?? 30);
    const id = newId('cli'), sid = newId('sec'), raw = 'hysec_' + randomBytes(32).toString('base64url'), now = nowIso();
    inTransaction(db, () => { db.prepare('INSERT INTO clients(id,name,scopes,status,created_at,updated_at,expires_at,resources,resource_ids,auto_publish,rate_limit,token_minutes) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)').run(id, input.name.trim(), [...new Set(input.scopes)].join(' '), 'active', now, now, expires, resources.join(' '), JSON.stringify(ids), input.autoPublish ? 1 : 0, limit, minutes); db.prepare('INSERT INTO secrets VALUES(?,?,?,?,?,?,?,?)').run(sid, id, secretHash(raw), hash(raw).slice(0, 16), new Date(Math.min(Date.parse(expires), Date.now() + days * 86400000)).toISOString(), 'active', now, null); audit(db, 'admin', 'session', 'client.created', 'client', id, { scopes: input.scopes, expiresAt: expires }); });
    return { client: getClient(db, id)!, clientSecret: raw };
}
export function getClient(db: DatabaseSync, id: string): ClientRecord | null { const r = db.prepare('SELECT * FROM clients WHERE id=?').get(id) as Record<string, any> | undefined; return r ? { id: String(r.id), name: String(r.name), scopes: parseScopes(String(r.scopes)), status: String(r.status), createdAt: String(r.created_at), updatedAt: String(r.updated_at), lastUsedAt: r.last_used_at ? String(r.last_used_at) : null, expiresAt: r.expires_at ? String(r.expires_at) : String(r.created_at), resources: parseScopes(String(r.resources)), resourceIds: JSON.parse(String(r.resource_ids)), autoPublish: r.auto_publish === 1, rateLimit: Number(r.rate_limit), tokenMinutes: Number(r.token_minutes) } : null; }
export function updateClient(db: DatabaseSync, id: string, input: {
    scopes?: string[];
    expiresAt?: string;
    status?: string;
    resources?: string[];
    resourceIds?: Record<string, string[]>;
    autoPublish?: boolean;
    rateLimit?: number;
    tokenMinutes?: number;
}) { const c = getClient(db, id); if (!c)
    fail(404, 'not_found'); if (c.status === 'archived' || c.status === 'revoked')
    fail(409, 'client_revoked'); const scopes = input.scopes ?? c.scopes; assertScopes(scopes); const resources = grant(input.resources ?? c.resources), ids = resourceIds(input.resourceIds ?? c.resourceIds), expires = utcDate(input.expiresAt ?? c.expiresAt), limit = positive(input.rateLimit ?? c.rateLimit, 1, 1000), minutes = ttl(input.tokenMinutes ?? c.tokenMinutes), status = input.status ?? c.status; if (!['active', 'disabled'].includes(status))
    fail(400, 'invalid_status'); db.prepare('UPDATE clients SET scopes=?,expires_at=?,status=?,resources=?,resource_ids=?,auto_publish=?,rate_limit=?,token_minutes=?,updated_at=? WHERE id=?').run(scopes.join(' '), expires, status, resources.join(' '), JSON.stringify(ids), (input.autoPublish ?? c.autoPublish) ? 1 : 0, limit, minutes, nowIso(), id); audit(db, 'admin', 'session', 'client.updated', 'client', id, { scopes, expiresAt: expires, status }); return getClient(db, id)!; }
export function rotateSecret(db: DatabaseSync, id: string, days = 90) { const c = getClient(db, id); if (!c || c.status !== 'active' || Date.parse(c.expiresAt) <= Date.now())
    fail(409, 'client_not_active'); positive(days, 1, 90); const sid = newId('sec'), raw = 'hysec_' + randomBytes(32).toString('base64url'), now = nowIso(), expiry = new Date(Math.min(Date.parse(c.expiresAt), Date.now() + days * 86400000)).toISOString(); inTransaction(db, () => { db.prepare("UPDATE secrets SET status='revoked',revoked_at=? WHERE client_id=? AND status='active'").run(now, id); db.prepare('UPDATE tokens SET revoked_at=? WHERE client_id=? AND revoked_at IS NULL').run(now, id); db.prepare('INSERT INTO secrets VALUES(?,?,?,?,?,?,?,?)').run(sid, id, secretHash(raw), hash(raw).slice(0, 16), expiry, 'active', now, null); audit(db, 'admin', 'session', 'secret.rotated', 'client', id, { secretId: sid, expiresAt: expiry }); }); return { secretId: sid, clientSecret: raw, expiresAt: expiry, fingerprint: hash(raw).slice(0, 16) }; }
export function disableClient(db: DatabaseSync, id: string, action: 'disabled' | 'archived' | 'revoked' = 'disabled') { if (!getClient(db, id))
    fail(404, 'not_found'); inTransaction(db, () => { db.prepare('UPDATE clients SET status=?,updated_at=? WHERE id=?').run(action, nowIso(), id); if (action !== 'disabled') {
    db.prepare("UPDATE secrets SET status='revoked',revoked_at=? WHERE client_id=?").run(nowIso(), id);
    db.prepare('UPDATE tokens SET revoked_at=? WHERE client_id=?').run(nowIso(), id);
} audit(db, 'admin', 'session', 'client.' + action, 'client', id, {}); }); }
export function revokeToken(db: DatabaseSync, id: string) { db.prepare('UPDATE tokens SET revoked_at=? WHERE id=?').run(nowIso(), id); audit(db, 'admin', 'session', 'token.revoked', 'token', id, {}); }
export function revokeSecret(db: DatabaseSync, id: string) { inTransaction(db, () => { db.prepare("UPDATE secrets SET status='revoked',revoked_at=? WHERE id=?").run(nowIso(), id); db.prepare('UPDATE tokens SET revoked_at=? WHERE secret_id=?').run(nowIso(), id); audit(db, 'admin', 'session', 'secret.revoked', 'secret', id, {}); }); }
export function consumeRate(db: DatabaseSync, key: string, limit: number) { return inTransaction(db, () => { const window = Math.floor(Date.now() / 60000), old = db.prepare('SELECT request_count FROM rate_limits WHERE client_id=? AND window_start=?').get(key, window) as Record<string, any> | undefined, used = Number(old?.request_count ?? 0); if (used >= limit)
    fail(429, 'rate_limited', { retryAfter: 60 }); db.prepare('INSERT INTO rate_limits VALUES(?,?,1) ON CONFLICT(client_id,window_start) DO UPDATE SET request_count=request_count+1').run(key, window); db.prepare('DELETE FROM rate_limits WHERE window_start<?').run(window - 60); return { remaining: limit - used - 1, resetAt: (window + 1) * 60 }; }); }
export function authorizationTime(db:DatabaseSync){const now=Date.now();const old=db.prepare("SELECT value FROM policy WHERE key='clock_highwater'").get() as {value:string}|undefined;const effective=Math.max(now,Number(old?.value??0));db.prepare("INSERT INTO policy VALUES('clock_highwater',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value").run(String(effective));return effective;}
export function issueToken(db: DatabaseSync, input: {
    clientId: string;
    clientSecret: string;
    requestedScopes?: string[];
    minutes?: number;
}): IssuedToken { consumeRate(db, 'oauth-client:' + hash(input.clientId), 20); const c = getClient(db, input.clientId), s = db.prepare("SELECT * FROM secrets WHERE client_id=? AND status='active' ORDER BY created_at DESC LIMIT 1").get(input.clientId) as Record<string, any> | undefined; if (!c || c.status !== 'active' || Date.parse(c.expiresAt) <= authorizationTime(db) || !s || Date.parse(String(s.expires_at)) <= authorizationTime(db) || typeof input.clientSecret !== 'string' || input.clientSecret.length > 512 || !matches(input.clientSecret, String(s.secret_hash)))
    fail(401, 'invalid_client'); const scopes = input.requestedScopes ?? c.scopes; assertScopes(scopes); if (scopes.some(x => !c.scopes.includes(x)))
    fail(400, 'invalid_scope'); const minutes = ttl(input.minutes ?? c.tokenMinutes); if (minutes > c.tokenMinutes)
    fail(400, 'invalid_token_duration'); const expiry = Math.min(authorizationTime(db) + minutes * 60000, Date.parse(c.expiresAt), Date.parse(String(s.expires_at))), raw = 'hytok_' + randomBytes(32).toString('base64url'), now = nowIso(); inTransaction(db, () => { db.prepare('INSERT INTO tokens VALUES(?,?,?,?,?,?,?,?,?)').run(newId('tok'), c.id, String(s.id), hash(raw), hash(raw).slice(0, 16), scopes.join(' '), now, new Date(expiry).toISOString(), null); audit(db, 'client', c.id, 'token.issued', 'client', c.id, { scopes, expiresAt: new Date(expiry).toISOString() }); }); return { accessToken: raw, tokenType: 'Bearer', expiresIn: Math.max(0, Math.floor((expiry - authorizationTime(db)) / 1000)), scope: scopes.join(' ') }; }
export function authenticateBearer(db: DatabaseSync, raw: string | undefined, requestId: string): AuthContext { if (!raw || raw.length > 512)
    fail(401, 'invalid_token'); const t = db.prepare('SELECT t.*,s.status secret_status,s.expires_at secret_expiry FROM tokens t JOIN secrets s ON s.id=t.secret_id WHERE token_hash=?').get(hash(raw)) as Record<string, any> | undefined; if (!t || t.revoked_at || Date.parse(String(t.expires_at)) <= authorizationTime(db) || t.secret_status !== 'active' || Date.parse(String(t.secret_expiry)) <= authorizationTime(db))
    fail(401, 'invalid_token'); const c = getClient(db, String(t.client_id)); if (!c || c.status !== 'active' || Date.parse(c.expiresAt) <= authorizationTime(db))
    fail(401, 'invalid_token'); const rate = consumeRate(db, c.id, c.rateLimit); db.prepare('UPDATE clients SET last_used_at=? WHERE id=?').run(nowIso(), c.id); return { clientId: c.id, tokenId: String(t.id), scopes: parseScopes(String(t.scopes)).filter(x => c.scopes.includes(x)), requestId, resources: c.resources, resourceIds: c.resourceIds, autoPublish: c.autoPublish, rateLimit: c.rateLimit, ...rate }; }
export function requireScope(c: {
    scopes: string[];
}, s: Scope) { if (!c.scopes.includes(s))
    fail(403, 'insufficient_scope'); }
export function validScope(s: string): s is Scope { return (SCOPES as readonly string[]).includes(s); }
export function listClients(db: DatabaseSync) { return (db.prepare('SELECT id FROM clients ORDER BY created_at DESC').all() as Record<string, any>[]).map(r => { const c = getClient(db, String(r.id))!; return { ...c, effectiveStatus: c.status === 'active' && Date.parse(c.expiresAt) <= Date.now() ? 'expired' : c.status, reminderDays: Math.ceil((Date.parse(c.expiresAt) - Date.now()) / 86400000), secrets: db.prepare('SELECT id,fingerprint,expires_at expiresAt,status FROM secrets WHERE client_id=? ORDER BY created_at DESC').all(c.id) as Record<string, any>[], tokens: db.prepare('SELECT id,fingerprint,expires_at expiresAt,revoked_at revokedAt,scopes,issued_at issuedAt FROM tokens WHERE client_id=? ORDER BY issued_at DESC LIMIT 100').all(c.id) as Record<string, any>[] }; }); }
