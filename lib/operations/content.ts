import {DatabaseSync as ReadDatabaseSync} from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import type { DatabaseSync } from 'node:sqlite';
import { getDataDir, getOperationsDbPath } from './config.ts';
import { openOperationsDb, jsonHash, nowIso, newId, writeJsonFileAtomic } from './db.ts';
import { audit, beginOperation, completeOperation, getOperation, failOperation, recoverPendingOperations, setOperationHashes, type OperationReceipt } from './receipt.ts';
import { fail, inTransaction, record } from './core.ts';
import { RESOURCE_FILES, RESOURCES, singleton, validateResource, isProtected, publicationEvidence } from './schema.ts';
import { getClient } from './auth.ts';
import { DEFAULT_PAGES } from '../content/defaultPages.ts';
export { RESOURCE_FILES, RESOURCES };
export type LifecycleStatus = 'draft' | 'submitted' | 'approved' | 'published' | 'unpublished' | 'archived';
export interface Actor {
    type: 'admin' | 'client';
    id: string;
    scopes?: string[];
    recentlyVerified?: boolean; tokenId?: string;
}
export interface ResourceRecord {
    id: string;
    resource: string;
    status: LifecycleStatus;
    version: number;
    etag: string;
    data: Record<string, unknown>;
    updatedAt: string;
    publishedVersion: number | null;
    publicStatus: string;
    protected: boolean;
    position: number;
}
function assertResource(r: string) { if (!RESOURCES.includes(r))
    fail(404, 'unknown_resource'); }
function rawRecord(db: DatabaseSync, r: string, id: string) { return db.prepare('SELECT * FROM records WHERE resource=? AND id=?').get(r, id) as Record<string, any> | undefined; }
function asRecord(x: NonNullable<ReturnType<typeof rawRecord>>): ResourceRecord { const data = JSON.parse(String(x.data_json)); return { id: String(x.id), resource: String(x.resource), status: x.status as LifecycleStatus, version: Number(x.version), etag: String(x.etag), data, updatedAt: String(x.updated_at), publishedVersion: x.published_version ? Number(x.published_version) : null, publicStatus: String(x.public_status), protected: isProtected(String(x.resource), x.published_json ? JSON.parse(String(x.published_json)) : null, data), position: Number(x.position) }; }
export function initializeContent(db: DatabaseSync, dataDir = getDataDir()) { if (db.prepare("SELECT name FROM migrations WHERE name='full-content-v2'").get() as Record<string, any> | undefined)
    return; inTransaction(db, () => { const now = nowIso(); for (const r of RESOURCES) {
    const file = path.join(dataDir, RESOURCE_FILES[r]);
    if (!fs.existsSync(file) && r !== 'pages')
        fail(503, 'resource_data_missing', { resource: r });
    const source = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : DEFAULT_PAGES;
    const values = Array.isArray(source) ? source : [source];
    const publicSource = singleton.has(r) ? (values.find((x: any) => !(r === 'blog-posts' && x.reviewStatus === 'draft')) ?? values[0] ?? {}) : values.filter((x: any) => !(r === 'blog-posts' && x.reviewStatus === 'draft'));
    db.prepare('INSERT OR IGNORE INTO projections(resource,data_json,updated_at) VALUES(?,?,?)').run(r, JSON.stringify(publicSource), now);
    for (let i = 0; i < values.length; i++) {
        const d = values[i];
        const id = singleton.has(r) ? 'singleton' : String(d.slug ?? d.pageKey ?? `${r}-${i + 1}`), status = (r === 'blog-posts' && d.reviewStatus === 'draft') ? 'draft' : 'published', json = JSON.stringify(d);
        db.prepare('INSERT OR IGNORE INTO records(resource,id,status,version,data_json,etag,updated_at,published_json,published_version,public_status,position,approved_version) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)').run(r, id, status, 1, json, jsonHash(d), now, status === 'published' ? json : null, status === 'published' ? 1 : null, status === 'published' ? 'published' : 'unpublished', i, status === 'published' ? 1 : null);
        db.prepare('INSERT OR IGNORE INTO revisions VALUES(?,?,?,?,?,?,?,?)').run(r, id, 1, status, json, jsonHash(d), now, 'migration:legacy');
    }
} db.prepare('INSERT INTO migrations VALUES(?,?)').run('full-content-v2', now); audit(db, 'admin', 'migration', 'content.migrated', null, null, { resources: RESOURCES }); }); }
export function seedResource(db: DatabaseSync, r: string, dir = getDataDir()) { assertResource(r); initializeContent(db, dir); }
export function readPublic<T=unknown>(resource:string,dataDir=getDataDir()):T {
  assertResource(resource);
  const file=getOperationsDbPath(dataDir);
  if(fs.existsSync(file)){
    const db=new ReadDatabaseSync(file,{readOnly:true});
    try{
      const exists=db.prepare("SELECT 1 FROM sqlite_master WHERE type='table' AND name='projections'").get();
      if(exists){const row=db.prepare('SELECT data_json FROM projections WHERE resource=?').get(resource) as {data_json:string}|undefined;if(row)return JSON.parse(row.data_json) as T;}
    }finally{db.close();}
  }
  const json=path.join(dataDir,RESOURCE_FILES[resource]);
  if(resource==='pages'&&!fs.existsSync(json))return DEFAULT_PAGES as T;
  return JSON.parse(fs.readFileSync(json,'utf8')) as T;
}

export function getRecord(db: DatabaseSync, r: string, id: string, dir = getDataDir()) { seedResource(db, r, dir); const x = rawRecord(db, r, id); return x ? asRecord(x) : null; }
export function listRecords(db: DatabaseSync, r: string, opts: {
    status?: LifecycleStatus | 'all';
    query?: string;
    limit?: number;
    includeDraft?: boolean;
    cursor?: string;
    sort?: string;
    actor?: Actor;
} = {}, dir = getDataDir()) { seedResource(db, r, dir); let items = (db.prepare('SELECT * FROM records WHERE resource=? ORDER BY position,id').all(r) as Record<string, any>[]).map(asRecord); if (opts.actor?.type === 'client')
    items = items.filter(x => canAccess(db, opts.actor!, r, x.id, 'read')); if (!opts.includeDraft) {
    items = items.filter(x => x.publicStatus === 'published' && (!opts.status || opts.status === 'all' || opts.status === 'published')).map(x => { const row = rawRecord(db, r, x.id)!; return { ...x, data: JSON.parse(String(row.published_json)), version: Number(row.published_version), etag: jsonHash(JSON.parse(String(row.published_json))), status: 'published' as const }; });
} else if (opts.status && opts.status !== 'all') {
    items = items.filter(x => x.status === opts.status);
} else {
    items = items.filter(x => x.status !== 'archived');
} if (opts.query)
    items = items.filter(x => JSON.stringify(x.data).toLowerCase().includes(opts.query!.toLowerCase())); if (opts.sort === 'updated-desc')
    items.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)); if (opts.cursor) {
    const i = items.findIndex(x => x.id === opts.cursor);
    if (i < 0)
        fail(400, 'invalid_cursor');
    items = items.slice(i + 1);
} return items.slice(0, Math.min(Math.max(opts.limit ?? 25, 1), 101)); }
export function canAccess(db: DatabaseSync, actor: Actor, r: string, id: string | undefined, action: 'read' | 'write' | 'publish') { if (actor.type === 'admin')
    return true;
    if(actor.tokenId){const tok=db.prepare('SELECT t.revoked_at,t.expires_at,s.status secret_status,s.expires_at secret_expiry FROM tokens t JOIN secrets s ON s.id=t.secret_id WHERE t.id=? AND t.client_id=?').get(actor.tokenId,actor.id) as Record<string,any>|undefined;if(!tok||tok.revoked_at||tok.secret_status!=='active'||Date.parse(tok.expires_at)<=Date.now()||Date.parse(tok.secret_expiry)<=Date.now())return false;}
    const c = getClient(db, actor.id); if (!c || c.status !== 'active' || Date.parse(c.expiresAt) <= Date.now())
    return false; const scopes = (actor.scopes ?? []).filter(s => c.scopes.includes(s)); if (!scopes.includes(`content:${action}`) || !c.resources.includes('*') && !c.resources.includes(r))
    return false; const ids = c.resourceIds[r]; return !ids || id !== undefined && ids.includes(id); }
export function authorizeResource(db: DatabaseSync, actor: Actor, r: string, id: string | undefined, action: 'read' | 'write' | 'publish') { if (!canAccess(db, actor, r, id, action))
    fail(403, 'insufficient_scope'); }
function idOf(r: string, d: Record<string, unknown>) { return singleton.has(r) ? 'singleton' : String(d.slug ?? d.pageKey ?? newId(r.replace(/-/g, ''))); }
function replay(db: DatabaseSync, actor: Actor, key: string | undefined, request: unknown) { if (!key)
    return null; if (key.length < 8 || key.length > 128)
    fail(400, 'invalid_idempotency_key'); const x = db.prepare('SELECT * FROM idempotency WHERE client_id=? AND idempotency_key=?').get(actor.type + ':' + actor.id, key) as Record<string, any> | undefined; if (!x)
    return null; if (String(x.request_hash) !== jsonHash(request))
    fail(409, 'idempotency_conflict'); return getOperation(db, String(x.operation_id)); }
function operation(db: DatabaseSync, actor: Actor, r: string, id: string, action: string, key: string | undefined, request: unknown) { const op = beginOperation(db, { resource: r, resourceId: id, action, idempotencyKey: key, requestBody: request, actorType: actor.type, actorId: actor.id }); if (key)
    db.prepare('INSERT INTO idempotency VALUES(?,?,?,?,?)').run(actor.type + ':' + actor.id, key, jsonHash(request), op.operationId, nowIso()); return op; }
function revision(db: DatabaseSync, r: string, id: string, v: number, status: string, d: unknown, actor: Actor) { db.prepare('INSERT INTO revisions VALUES(?,?,?,?,?,?,?,?)').run(r, id, v, status, JSON.stringify(d), jsonHash(d), nowIso(), actor.type + ':' + actor.id); }
function projection(db: DatabaseSync, r: string) { const rows = (db.prepare("SELECT published_json FROM records WHERE resource=? AND public_status='published' AND published_json IS NOT NULL ORDER BY position,id").all(r) as Record<string, any>[]).map(x => JSON.parse(String(x.published_json))); return singleton.has(r) ? rows[0] ?? {} : rows; }
function queueProjection(db: DatabaseSync, r: string, op: OperationReceipt) { const next = projection(db, r); const old = db.prepare('SELECT generation FROM projections WHERE resource=?').get(r) as Record<string, any> | undefined; const gen = Number(old?.generation ?? 0) + 1; db.prepare('INSERT INTO projections VALUES(?,?,?,?) ON CONFLICT(resource) DO UPDATE SET data_json=excluded.data_json,generation=excluded.generation,updated_at=excluded.updated_at').run(r, JSON.stringify(next), gen, nowIso()); db.prepare('INSERT INTO outbox(operation_id,resource,data_json,generation) VALUES(?,?,?,?)').run(op.operationId, r, JSON.stringify(next), gen); }
function drain(db: DatabaseSync, dir: string, op: OperationReceipt) { recoverPendingOperations(db, dir); return getOperation(db, op.operationId)!; }
function mutate(db: DatabaseSync, dir: string, fn: () => OperationReceipt) { initializeContent(db, dir); recoverPendingOperations(db, dir); const op = inTransaction(db, fn); return drain(db, dir, op); }
export function createDraft(db: DatabaseSync, r: string, input: unknown, actor: Actor, key?: string, dir = getDataDir()) { assertResource(r); const d = validateResource(r, input); const request = { resource: r, action: 'create', data: d }; return mutate(db, dir, () => { const old = replay(db, actor, key, request); if (old)
    return old; const id = idOf(r, d); authorizeResource(db, actor, r, id, 'write'); if (rawRecord(db, r, id))
    fail(409, 'resource_exists'); const op = operation(db, actor, r, id, 'create', key, request); const position = Number((db.prepare('SELECT MAX(position) p FROM records WHERE resource=?').get(r) as Record<string, any> | undefined)?.p ?? -1) + 1; db.prepare('INSERT INTO records(resource,id,status,version,data_json,etag,updated_at,position) VALUES(?,?,?,?,?,?,?,?)').run(r, id, 'draft', 1, JSON.stringify(d), jsonHash(d), nowIso(), position); revision(db, r, id, 1, 'draft', d, actor); audit(db, actor.type, actor.id, 'resource.created', r, id, { version: 1 }); return completeOperation(db, op.operationId, null, jsonHash(d)); }); }
export function patchDraft(db: DatabaseSync, r: string, id: string, input: unknown, actor: Actor, etag: string | undefined, key?: string, dir = getDataDir()) { assertResource(r); const patch = record(input), req = { resource: r, id, action: 'patch', data: patch, etag }; return mutate(db, dir, () => { const old = replay(db, actor, key, req); if (old)
    return old; authorizeResource(db, actor, r, id, 'write'); const row = rawRecord(db, r, id); if (!row)
    fail(404, 'not_found'); if (!etag)
    fail(428, 'if_match_required'); if (etag.replace(/^"|"$/g, '') !== String(row.etag))
    fail(412, 'etag_mismatch', { etag: row.etag }); if (row.status === 'archived')
    fail(409, 'invalid_state'); const d = validateResource(r, { ...JSON.parse(String(row.data_json)), ...patch }); if (d.slug !== undefined && d.slug !== JSON.parse(String(row.data_json)).slug || d.pageKey !== undefined && d.pageKey !== JSON.parse(String(row.data_json)).pageKey)
    fail(409, 'immutable_id'); const v = Number(row.version) + 1, op = operation(db, actor, r, id, 'patch', key, req); db.prepare("UPDATE records SET status='draft',version=?,data_json=?,etag=?,updated_at=?,approved_version=NULL WHERE resource=? AND id=?").run(v, JSON.stringify(d), jsonHash(d), nowIso(), r, id); revision(db, r, id, v, 'draft', d, actor); audit(db, actor.type, actor.id, 'resource.patched', r, id, { version: v }); return completeOperation(db, op.operationId, String(row.etag), jsonHash(d)); }); }
function references(db: DatabaseSync, r: string, d: Record<string, unknown>) { if (r === 'industries')
    for (const id of d.relatedCases as string[] ?? []) {
        if (!rawRecord(db, 'cases', id))
            fail(409, 'missing_reference', { resource: 'cases', id });
    } if (r === 'cases')
    for (const name of d.relatedCustomers as string[] ?? []) {
        const exists = db.prepare("SELECT 1 FROM records WHERE resource='customers' AND json_extract(data_json,'$.name')=?").get(name) as Record<string, any> | undefined;
        if (!exists)
            fail(409, 'missing_customer_reference');
    } for (const id of d.mediaIds as string[] ?? []) {
    if (!(db.prepare("SELECT id FROM media WHERE id=? AND status='active'").get(id) as Record<string, any> | undefined))
        fail(409, 'missing_media_reference');
} }
export function transition(db: DatabaseSync, r: string, id: string, action: 'submit' | 'approve' | 'publish' | 'unpublish' | 'archive' | 'restore' | 'rollback', actor: Actor, body: Record<string, unknown> = {}, key?: string, dir = getDataDir()) {
    assertResource(r);
    if (!['submit', 'approve', 'publish', 'unpublish', 'archive', 'restore', 'rollback'].includes(action))
        fail(400, 'unknown_action');
    const req = { resource: r, id, action, body };
    return mutate(db, dir, () => {
        const old = replay(db, actor, key, req);
        if (old)
            return old;
        const row = rawRecord(db, r, id);
        if (!row)
            fail(404, 'not_found');
        authorizeResource(db, actor, r, id, ['publish', 'unpublish', 'archive', 'rollback'].includes(action) ? 'publish' : 'write');
        let d = JSON.parse(String(row.data_json)) as Record<string, unknown>, status = String(row.status), v = Number(row.version);
        const original = d;
        if (action === 'rollback') {
            const n = Number(body.revision);
            if (!Number.isInteger(n) || n < 1)
                fail(400, 'invalid_revision');
            const prior = db.prepare('SELECT * FROM revisions WHERE resource=? AND id=? AND revision=?').get(r, id, n) as Record<string, any> | undefined;
            if (!prior)
                fail(404, 'revision_not_found');
            d = JSON.parse(String(prior.data_json));
            status = 'draft';
        }
        const protectedChange = isProtected(r, row.published_json ? JSON.parse(String(row.published_json)) : null, d);
        if (['approve', 'publish', 'unpublish', 'archive', 'rollback'].includes(action) && protectedChange && (actor.type !== 'admin' || !actor.recentlyVerified))
            fail(403, 'owner_review_required');
        if (action === 'approve' && actor.type !== 'admin')
            fail(403, 'reviewer_required');
        if (action === 'submit') {
            if (!['draft', 'unpublished'].includes(status))
                fail(409, 'invalid_state');
            status = 'submitted';
        }
        if (action === 'approve') {
            if (status !== 'submitted')
                fail(409, 'invalid_state');
            status = 'approved';
            db.prepare('UPDATE records SET approved_version=? WHERE resource=? AND id=?').run(v, r, id);
        }
        if (action === 'publish') {
            if (body.revision !== undefined && Number(body.revision) !== v)
                fail(409, 'revision_mismatch');
            const auto = actor.type === 'client' && getClient(db, actor.id)?.autoPublish === true && !protectedChange;
            if (status !== 'approved' && !auto)
                fail(409, 'approval_required');
            validateResource(r, d);
            const legacyRevision=db.prepare("SELECT 1 FROM revisions WHERE resource=? AND id=? AND created_by='migration:legacy' AND etag=? AND status='published'").get(r,id,jsonHash(d));
            if(!legacyRevision)publicationEvidence(r, d, protectedChange);
            references(db, r, d);
            status = 'published';
            db.prepare("UPDATE records SET published_json=?,published_version=?,public_status='published' WHERE resource=? AND id=?").run(JSON.stringify(d), v, r, id);
        }
        if (action === 'unpublish') {
            if (row.public_status !== 'published')
                fail(409, 'invalid_state');
            status = 'unpublished';
            db.prepare("UPDATE records SET public_status='unpublished' WHERE resource=? AND id=?").run(r, id);
        }
        if (action === 'archive') {
            status = 'archived';
            db.prepare("UPDATE records SET public_status='unpublished',deleted_at=? WHERE resource=? AND id=?").run(nowIso(), r, id);
        }
        if (action === 'restore') {
            if (row.status !== 'archived')
                fail(409, 'invalid_state');
            status = 'draft';
            db.prepare('UPDATE records SET deleted_at=NULL WHERE resource=? AND id=?').run(r, id);
        }
        if (action === 'rollback') {
            status = 'draft';
            db.prepare('UPDATE records SET approved_version=NULL WHERE resource=? AND id=?').run(r, id);
        }
        if (body.position !== undefined) {
            if (!Number.isInteger(body.position) || Number(body.position) < 0)
                fail(400, 'invalid_position');
            db.prepare('UPDATE records SET position=? WHERE resource=? AND id=?').run(Number(body.position), r, id);
        }
        const next = ++v;
        const op = operation(db, actor, r, id, action, key, req);
        db.prepare('UPDATE records SET status=?,version=?,data_json=?,etag=?,updated_at=? WHERE resource=? AND id=?').run(status, next, JSON.stringify(d), jsonHash(d), nowIso(), r, id);
        revision(db, r, id, next, status, d, actor);
        setOperationHashes(db, op.operationId, String(row.etag), jsonHash(d));
        audit(db, actor.type, actor.id, 'resource.' + action, r, id, { version: next, protected: protectedChange });
        if (['publish', 'unpublish', 'archive'].includes(action))
            queueProjection(db, r, op);
        else
            completeOperation(db, op.operationId, String(row.etag), jsonHash(d));
        return getOperation(db, op.operationId)!;
    });
}
export function getRevisions(db: DatabaseSync, r: string, id: string, dir = getDataDir()) { getRecord(db, r, id, dir); return (db.prepare('SELECT revision,status,etag,created_at createdAt,created_by createdBy,data_json FROM revisions WHERE resource=? AND id=? ORDER BY revision DESC').all(r, id) as Record<string, any>[]).map(x => ({ ...x, data: JSON.parse(String(x.data_json)), data_json: undefined })); }
export function getDiff(db: DatabaseSync, r: string, id: string, from?: number, to?: number) { const rec = getRecord(db, r, id); if (!rec)
    fail(404, 'not_found'); const a = db.prepare('SELECT data_json FROM revisions WHERE resource=? AND id=? AND revision=?').get(r, id, from ?? rec.publishedVersion ?? 1) as Record<string, any> | undefined, b = db.prepare('SELECT data_json FROM revisions WHERE resource=? AND id=? AND revision=?').get(r, id, to ?? rec.version) as Record<string, any> | undefined; if (!a || !b)
    fail(404, 'revision_not_found'); const before = JSON.parse(String(a.data_json)), after = JSON.parse(String(b.data_json)); return { from: from ?? rec.publishedVersion ?? 1, to: to ?? rec.version, changes: [...new Set([...Object.keys(before), ...Object.keys(after)])].filter(k => jsonHash(before[k] ?? null) !== jsonHash(after[k] ?? null)).map(k => ({ path: k, before: before[k], after: after[k] })) }; }
export function listOperations(db: DatabaseSync, limit = 50, actor?: Actor) { const rows = actor?.type === 'client' ? db.prepare("SELECT id FROM operations WHERE actor_type='client' AND actor_id=? ORDER BY created_at DESC LIMIT ?").all(actor.id, Math.min(limit, 100)) as Record<string, any>[] : db.prepare('SELECT id FROM operations ORDER BY created_at DESC LIMIT ?').all(Math.min(limit, 100)) as Record<string, any>[]; return rows.map(x => getOperation(db, String(x.id))!); }
export function listAudit(db: DatabaseSync, limit = 50, cursor?: string) { return (db.prepare('SELECT id,actor_type actorType,actor_id actorId,action,resource,resource_id resourceId,metadata_json,created_at createdAt FROM audit ORDER BY created_at DESC LIMIT ?').all(Math.min(limit, 100)) as Record<string, any>[]).map(x => ({ ...x, metadata: JSON.parse(String(x.metadata_json)), metadata_json: undefined })); }
export function legacySave(db: DatabaseSync, r: string, input: unknown, actor: Actor, dir = getDataDir()) { initializeContent(db, dir); if (Array.isArray(input)) {
    const current = listRecords(db, r, { status: 'all', includeDraft: true, limit: 101 }, dir);
    if (input.length !== current.length)
        fail(409, 'collection_lifecycle_required');
    for (let i = 0; i < input.length; i++)
        legacySaveOne(db, r, current[i].id, input[i], actor, dir);
    return;
} const d = record(input); const id = singleton.has(r) ? 'singleton' : String(d.slug ?? d.pageKey ?? ''); legacySaveOne(db, r, id, d, actor, dir); }
function legacySaveOne(db: DatabaseSync, r: string, id: string, d: unknown, actor: Actor, dir: string) { const cur = getRecord(db, r, id, dir); if (cur && jsonHash(cur.data) === jsonHash(d))
    return; if (cur)
    patchDraft(db, r, id, d, actor, cur.etag, undefined, dir);
else
    createDraft(db, r, d, actor, undefined, dir); const protect = isProtected(r, cur?.publicStatus === 'published' ? cur.data : null, record(d)); if (protect && !actor.recentlyVerified)
    fail(403, 'owner_review_required'); transition(db, r, id, 'submit', actor, {}, undefined, dir); transition(db, r, id, 'approve', actor, {}, undefined, dir); transition(db, r, id, 'publish', actor, {}, undefined, dir); }
