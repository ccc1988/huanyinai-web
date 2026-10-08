import type { DatabaseSync } from 'node:sqlite';
import { jsonHash, newId, nowIso, writeJsonFileAtomic } from './db.ts';
import { getDataDir } from './config.ts';
import { inTransaction } from './core.ts';
export type OperationStatus = 'pending' | 'committed' | 'failed' | 'needs_recovery';
export interface OperationReceipt {
    operationId: string;
    resource: string;
    resourceId: string;
    action: string;
    status: OperationStatus;
    beforeHash: string | null;
    afterHash: string | null;
    errorCode: string | null;
    createdAt: string;
    completedAt: string | null;
    actorId?: string;
}
export function beginOperation(db: DatabaseSync, input: {
    resource: string;
    resourceId: string;
    action: string;
    idempotencyKey?: string;
    requestBody?: unknown;
    actorType?: string;
    actorId?: string;
}) { const id = newId('op'); db.prepare('INSERT INTO operations(id,resource,resource_id,action,status,idempotency_key,request_hash,created_at,actor_type,actor_id) VALUES(?,?,?,?,?,?,?,?,?,?)').run(id, input.resource, input.resourceId, input.action, 'pending', input.idempotencyKey || null, input.requestBody === undefined ? null : jsonHash(input.requestBody), nowIso(), input.actorType || 'admin', input.actorId || 'session'); return getOperation(db, id)!; }
export function setOperationHashes(db: DatabaseSync, id: string, before: string | null, after: string | null) { db.prepare('UPDATE operations SET before_hash=?,after_hash=? WHERE id=?').run(before, after, id); }
export function completeOperation(db: DatabaseSync, id: string, before: string | null, after: string | null) { db.prepare("UPDATE operations SET status='committed',before_hash=?,after_hash=?,completed_at=?,error_code=NULL,error_message=NULL WHERE id=?").run(before, after, nowIso(), id); return getOperation(db, id)!; }
export function failOperation(db: DatabaseSync, id: string, code: string, message: string, status: OperationStatus = 'failed') { db.prepare('UPDATE operations SET status=?,error_code=?,error_message=?,completed_at=? WHERE id=?').run(status, code, message.slice(0, 200), nowIso(), id); return getOperation(db, id)!; }
export function getOperation(db: DatabaseSync, id: string): OperationReceipt | null { const x = db.prepare('SELECT * FROM operations WHERE id=?').get(id) as Record<string, any> | undefined; return x ? { operationId: String(x.id), resource: String(x.resource), resourceId: String(x.resource_id), action: String(x.action), status: x.status as OperationStatus, beforeHash: x.before_hash ? String(x.before_hash) : null, afterHash: x.after_hash ? String(x.after_hash) : null, errorCode: x.error_code ? String(x.error_code) : null, createdAt: String(x.created_at), completedAt: x.completed_at ? String(x.completed_at) : null, actorId: String(x.actor_id) } : null; }
export function audit(db: DatabaseSync, type: string, actor: string, action: string, resource: string | null, id: string | null, metadata: unknown) { db.prepare('INSERT INTO audit VALUES(?,?,?,?,?,?,?,?)').run(newId('audit'), type, actor, action, resource, id, JSON.stringify(metadata ?? {}), nowIso()); }
export function recoverPendingOperations(db: DatabaseSync, dataDir = getDataDir()) { return inTransaction(db, () => { const items = db.prepare("SELECT o.*,r.before_hash,r.after_hash FROM outbox o JOIN operations r ON r.id=o.operation_id WHERE o.status='pending' ORDER BY r.created_at").all() as Record<string, any>[]; for (const item of items) {
    const current = db.prepare('SELECT generation,data_json FROM projections WHERE resource=?').get(String(item.resource)) as Record<string, any> | undefined;
    if (!current)
        continue;
    try {
        const projectedHash = jsonHash(JSON.parse(String(current.data_json)));
        const isCurrent = projectedHash === String(item.after_hash);
        writeJsonFileAtomic(dataDir, String(item.resource) + '.json', JSON.parse(String(current.data_json)));
        db.prepare("UPDATE outbox SET status=? WHERE operation_id=?").run(isCurrent ? 'committed' : 'superseded', String(item.operation_id));
        if (isCurrent) completeOperation(db, String(item.operation_id), item.before_hash ? String(item.before_hash) : null, item.after_hash ? String(item.after_hash) : null);
        else failOperation(db, String(item.operation_id), 'superseded_projection', 'A newer public projection superseded this receipt', 'needs_recovery');
    }
    catch {
        failOperation(db, String(item.operation_id), 'projection_pending', 'Published snapshot is durable; compatibility projection awaits retry', 'needs_recovery');
    }
} return items.length; }); }
