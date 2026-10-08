import { createHash, randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import type { AuthContext } from "./auth.ts";
import type { DatabaseSync } from "node:sqlite";
import sharp from "sharp";
import { MAX_MEDIA_BYTES } from "./config.ts";
import { jsonHash, nowIso } from "./db.ts";
import { OperationsError, inTransaction } from "./core.ts";
import { audit, beginOperation, completeOperation, failOperation, type OperationReceipt } from "./receipt.ts";

export const MAX_UPLOAD_BYTES = MAX_MEDIA_BYTES;
export const MAX_MEDIA_REQUEST_BYTES = MAX_UPLOAD_BYTES + 64 * 1024;
export const MAX_UPLOADS_PER_MINUTE = 20;
const MAX_DIMENSION = 8192;
const MAX_PIXELS = 40_000_000;
const FORMATS: Record<string, { format: "png" | "jpeg" | "webp"; ext: string; extensions: string[] }> = {
  "image/png": { format: "png", ext: "png", extensions: [".png"] },
  "image/jpeg": { format: "jpeg", ext: "jpg", extensions: [".jpg", ".jpeg"] },
  "image/webp": { format: "webp", ext: "webp", extensions: [".webp"] },
};
const ID = /^med_[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
type Row = Record<string, unknown>;
export interface MediaActor { actorId: string; actorType?: "client" | "admin"; }
export interface MediaMutation extends MediaActor { idempotencyKey?: string; }
export interface MediaInput extends MediaMutation { filename: string; mime: string; bytes: Buffer; alt?: string; description?: string; }
export interface MediaRecord {
  id: string; filename: string; mime: string; bytes: number; version: number; status: string; url: string;
  width: number; height: number; alt: string; description: string; sha256: string;
  createdAt: string; updatedAt: string; deletedAt: string | null; publicReferenceCount: number;
}
export interface MediaWriteResult extends MediaRecord { operationId: string; receipt: OperationReceipt; }
export interface MediaListOptions { status?: "active" | "deleted" | "all"; mime?: string; query?: string; limit?: number; offset?: number; ids?: string[]; }
function fail(status: number, code: string, details?: unknown): never { throw new OperationsError(status, code, code, details); }
function assertId(id: string): void { if (typeof id !== "string" || !ID.test(id)) fail(400, "invalid_media_id"); }

/** Additive migration, intentionally owned here rather than db.ts. */
export function ensureMediaSchema(db: DatabaseSync): void {
  inTransaction(db, () => {
    const names = new Set((db.prepare("PRAGMA table_info(media)").all() as Row[]).map(row => String(row.name)));
    for (const [name, definition] of [
      ["alt", "TEXT NOT NULL DEFAULT ''"], ["description", "TEXT NOT NULL DEFAULT ''"],
      ["width", "INTEGER NOT NULL DEFAULT 0"], ["height", "INTEGER NOT NULL DEFAULT 0"],
      ["sha256", "TEXT NOT NULL DEFAULT ''"], ["deleted_at", "TEXT"], ["updated_at", "TEXT"],
    ]) if (!names.has(name)) db.exec(`ALTER TABLE media ADD COLUMN ${name} ${definition}`);
    const operationColumns = new Set((db.prepare("PRAGMA table_info(operations)").all() as Row[]).map(row => String(row.name)));
    if (!operationColumns.has("error_status")) db.exec("ALTER TABLE operations ADD COLUMN error_status INTEGER");
    if (!operationColumns.has("result_json")) db.exec("ALTER TABLE operations ADD COLUMN result_json TEXT");
    db.exec(`CREATE TABLE IF NOT EXISTS media_versions (
      media_id TEXT NOT NULL REFERENCES media(id), version INTEGER NOT NULL, path TEXT NOT NULL UNIQUE,
      mime TEXT NOT NULL, bytes INTEGER NOT NULL, width INTEGER NOT NULL, height INTEGER NOT NULL,
      sha256 TEXT NOT NULL, created_at TEXT NOT NULL, PRIMARY KEY(media_id,version)
    );
    CREATE TABLE IF NOT EXISTS media_requests (
      actor_type TEXT NOT NULL, actor_id TEXT NOT NULL, idempotency_key TEXT NOT NULL, request_hash TEXT NOT NULL,
      operation_id TEXT NOT NULL REFERENCES operations(id), result_json TEXT, error_code TEXT, error_status INTEGER,
      created_at TEXT NOT NULL, PRIMARY KEY(actor_type,actor_id,idempotency_key)
    );
    CREATE TABLE IF NOT EXISTS media_upload_limits (
      actor_type TEXT NOT NULL, actor_id TEXT NOT NULL, window_start INTEGER NOT NULL, request_count INTEGER NOT NULL,
      PRIMARY KEY(actor_type,actor_id,window_start)
    );
    CREATE INDEX IF NOT EXISTS media_status_created ON media(status,created_at);
    UPDATE media SET updated_at=created_at WHERE updated_at IS NULL;
    INSERT OR IGNORE INTO media_versions(media_id,version,path,mime,bytes,width,height,sha256,created_at)
      SELECT id,version,path,mime,bytes,width,height,sha256,created_at FROM media WHERE width>0 AND height>0;`);
  });
}
function dataDir(db: DatabaseSync): string {
  const file = (db.prepare("PRAGMA database_list").all() as Row[]).find(row => row.name === "main")?.file;
  if (!file) fail(503, "media_storage_unconfigured");
  return path.dirname(path.resolve(String(file)));
}
function storeDir(db: DatabaseSync): string {
  const root = fs.realpathSync(dataDir(db));
  const release = fs.realpathSync(process.cwd());
  if (root === release || root.startsWith(release + path.sep)) fail(503, "media_storage_in_release");
  const dir = path.join(root, "media");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { mode: 0o700 });
  if (fs.lstatSync(dir).isSymbolicLink() || !fs.lstatSync(dir).isDirectory() || fs.realpathSync(dir) !== dir) fail(503, "unsafe_media_storage");
  return dir;
}
function text(value: unknown, max: number): string {
  if (typeof value !== "string" || value.length > max || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(value)) fail(400, "invalid_media_metadata");
  return value;
}
function mutationContext(input: MediaMutation) {
  if (!input.actorId || input.actorId.length > 200 || !["client", "admin"].includes(input.actorType || "client")) fail(400, "invalid_media_actor");
  if (!input.idempotencyKey) fail(400, "idempotency_key_required");
  if (!/^[\x21-\x7e]{1,200}$/.test(input.idempotencyKey)) fail(400, "invalid_idempotency_key");
  return { actorId: input.actorId, actorType: input.actorType || "client", key: input.idempotencyKey };
}
function replay(db: DatabaseSync, ctx: ReturnType<typeof mutationContext>, hash: string): MediaWriteResult | null {
  const row = db.prepare("SELECT * FROM media_requests WHERE actor_type=? AND actor_id=? AND idempotency_key=?").get(ctx.actorType, ctx.actorId, ctx.key) as Row | undefined;
  if (!row) return null;
  if (row.request_hash !== hash) fail(409, "idempotency_conflict");
  // Never trust a globally selected operation: snapshot key and persisted operation owner must agree.
  const op = db.prepare("SELECT actor_type,actor_id FROM operations WHERE id=?").get(String(row.operation_id)) as Row | undefined;
  if (!op || op.actor_type !== ctx.actorType || op.actor_id !== ctx.actorId) fail(403, "operation_owner_mismatch");
  if (row.error_code) fail(Number(row.error_status), String(row.error_code), row.result_json ? JSON.parse(String(row.result_json)).details : undefined);
  if (!row.result_json) fail(503, "media_operation_incomplete");
  return JSON.parse(String(row.result_json)) as MediaWriteResult;
}
function saveRequest(db: DatabaseSync, ctx: ReturnType<typeof mutationContext>, hash: string, op: string, result: MediaWriteResult | null, error?: OperationsError) {
  const resultJson = result ? JSON.stringify(result) : error ? JSON.stringify({ details: error.details }) : null;
  db.prepare("UPDATE operations SET error_status=?,result_json=? WHERE id=?").run(error?.status || null, resultJson, op);
  db.prepare("INSERT INTO media_requests VALUES(?,?,?,?,?,?,?,?,?)").run(ctx.actorType, ctx.actorId, ctx.key, hash, op, resultJson, error?.code || null, error?.status || null, nowIso());
}
function normalizedError(error: unknown): OperationsError { return error instanceof OperationsError ? error : new OperationsError(500, "media_write_failed", "media_write_failed"); }
function failedWrite(db: DatabaseSync, input: MediaMutation, hash: string, id: string, action: string, error: unknown): never {
  const ctx = mutationContext(input); const safe = normalizedError(error);
  inTransaction(db, () => {
    const existing = replay(db, ctx, hash); if (existing) return;
    const op = beginOperation(db, { resource: "media", resourceId: id, action, actorType: ctx.actorType, actorId: ctx.actorId, idempotencyKey: ctx.key, requestBody: { hash } });
    failOperation(db, op.operationId, safe.code, safe.code);
    audit(db, ctx.actorType, ctx.actorId, `media.${action}.failed`, "media", id, { operationId: op.operationId, errorCode: safe.code });
    saveRequest(db, ctx, hash, op.operationId, null, safe);
  });
  throw safe;
}
function write(db: DatabaseSync, input: MediaMutation, hash: string, id: string, action: string, work: () => { row: Row; beforeHash: string | null }): MediaWriteResult {
  const ctx = mutationContext(input);
  const existing = replay(db, ctx, hash); if (existing) return existing;
  try {
    return inTransaction(db, () => {
      const again = replay(db, ctx, hash); if (again) return again;
      const op = beginOperation(db, { resource: "media", resourceId: id, action, actorType: ctx.actorType, actorId: ctx.actorId, idempotencyKey: ctx.key, requestBody: { hash } });
      const { row, beforeHash } = work();
      const receipt = completeOperation(db, op.operationId, beforeHash, jsonHash(row));
      audit(db, ctx.actorType, ctx.actorId, `media.${action}`, "media", id, { operationId: receipt.operationId, version: row.version, beforeHash, afterHash: receipt.afterHash });
      const result = { ...record(db, row), operationId: receipt.operationId, receipt };
      saveRequest(db, ctx, hash, receipt.operationId, result);
      return result;
    });
  } catch (error) { return failedWrite(db, input, hash, id, action, error); }
}
function rowFor(db: DatabaseSync, id: string): Row {
  const row = db.prepare("SELECT * FROM media WHERE id=?").get(id) as Row | undefined;
  if (!row) fail(404, "not_found"); return row;
}
function record(db: DatabaseSync, row: Row): MediaRecord {
  const fmt = FORMATS[String(row.mime)];
  return { id: String(row.id), filename: String(row.filename), mime: String(row.mime), bytes: Number(row.bytes),
    version: Number(row.version), status: String(row.status), url: `/media/${row.id}/v${row.version}.${fmt?.ext || "invalid"}`,
    width: Number(row.width), height: Number(row.height), alt: String(row.alt || ""), description: String(row.description || ""), sha256: String(row.sha256 || ""),
    createdAt: String(row.created_at), updatedAt: String(row.updated_at || row.created_at), deletedAt: row.deleted_at ? String(row.deleted_at) : null,
    publicReferenceCount: publicReferences(db, String(row.id)).length };
}
function refers(value: unknown, id: string): boolean {
  if (typeof value === "string") {
    if (value === id) return true;
    let decoded = value; try { decoded = decodeURIComponent(value); } catch { /* inspect raw */ }
    // Covers exact URLs, absolute URLs, rich-text HTML and legacy flat URLs, across all versions.
    return new RegExp(`/media/${id}(?:/v[1-9][0-9]*\\.(?:png|jpg|webp)|\\.(?:png|jpg|jpeg|webp))(?![A-Za-z0-9_.%/-])`).test(decoded);
  }
  if (Array.isArray(value)) return value.some(item => refers(item, id));
  return !!value && typeof value === "object" && Object.values(value).some(item => refers(item, id));
}
/** Published revisions/projections are the authority; snapshots cover unseeded legacy resources. */
export function publicReferences(db: DatabaseSync, id: string): Array<{ resource: string; id: string }> {
  const found = new Map<string, { resource: string; id: string }>();
  const add = (resource: string, data: unknown, fallback: string) => {
    const items = Array.isArray(data) ? data : [data];
    for (const item of items) if (refers(item, id)) {
      const object = item && typeof item === "object" ? item as Row : {};
      const itemId = String(object.id || object.slug || object.pageKey || fallback);
      found.set(`${resource}:${itemId}`, { resource, id: itemId });
    }
  };
  try {
    const rows = db.prepare("SELECT resource,id,published_json AS json FROM records WHERE public_status='published' AND published_json IS NOT NULL AND deleted_at IS NULL").all() as Row[];
    for (const row of rows) add(String(row.resource), JSON.parse(String(row.json)), String(row.id));
    const projections = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='projections'").get();
    const projectedResources = new Set<string>();
    if (projections) for (const row of db.prepare("SELECT resource,data_json FROM projections").all() as Row[]) { projectedResources.add(String(row.resource)); add(String(row.resource), JSON.parse(String(row.data_json)), "singleton"); }
    for (const resource of ["blog-posts", "cases", "industries", "company", "customers", "capabilities", "stats", "contacts", "settings", "pages"]) {
      if (projectedResources.has(resource)) continue;
      const file = path.join(dataDir(db), `${resource}.json`);
      if (fs.existsSync(file)) {
        const fd = fs.openSync(file, fs.constants.O_RDONLY | fs.constants.O_NOFOLLOW);
        try { add(resource, JSON.parse(fs.readFileSync(fd, "utf8")), "singleton"); } finally { fs.closeSync(fd); }
      }
    }
  } catch { fail(503, "media_reference_check_failed"); }
  return [...found.values()];
}
export function getMedia(db: DatabaseSync, id: string): MediaRecord | null {
  assertId(id); ensureMediaSchema(db);
  const row = db.prepare("SELECT * FROM media WHERE id=?").get(id) as Row | undefined; return row ? record(db, row) : null;
}
export function listMedia(db: DatabaseSync, options: MediaListOptions = {}): MediaRecord[] {
  ensureMediaSchema(db);
  if (options.status && !["active", "deleted", "all"].includes(options.status)) fail(400, "invalid_media_filter");
  if (options.mime && !FORMATS[options.mime]) fail(400, "invalid_media_filter");
  const limit = options.limit ?? 50, offset = options.offset ?? 0;
  if (!Number.isInteger(limit) || limit < 1 || limit > 100 || !Number.isInteger(offset) || offset < 0 || offset > 100000 || (options.query && options.query.length > 200)) fail(400, "invalid_media_filter");
  const filters = [], args: (string | number)[] = [];
  if (options.ids) { if (!options.ids.length) return []; filters.push(`id IN (${options.ids.map(() => "?").join(",")})`); args.push(...options.ids); }
  if (options.status !== "all") { filters.push("status=?"); args.push(options.status || "active"); }
  if (options.mime) { filters.push("mime=?"); args.push(options.mime); }
  if (options.query) { filters.push("(instr(lower(filename),lower(?))>0 OR instr(lower(alt),lower(?))>0 OR instr(lower(description),lower(?))>0)"); args.push(options.query, options.query, options.query); }
  return (db.prepare(`SELECT * FROM media ${filters.length ? "WHERE " + filters.join(" AND ") : ""} ORDER BY created_at DESC,id LIMIT ? OFFSET ?`).all(...args, limit, offset) as Row[]).map(row => record(db, row));
}
export function mediaListOptions(url: string): MediaListOptions {
  const params = new URL(url).searchParams;
  return { status: (params.get("status") || undefined) as MediaListOptions["status"], mime: params.get("mime") || undefined,
    query: params.get("query") || undefined, limit: params.has("limit") ? Number(params.get("limit")) : undefined, offset: params.has("offset") ? Number(params.get("offset")) : undefined };
}
async function decode(input: MediaInput) {
  if (!Buffer.isBuffer(input.bytes) || !input.bytes.length) fail(400, "invalid_media_image");
  if (input.bytes.length > MAX_UPLOAD_BYTES) fail(413, "media_too_large");
  const fmt = FORMATS[input.mime]; if (!fmt) fail(415, "unsupported_media_type");
  if (typeof input.filename !== "string" || input.filename.length > 200 || !input.filename.length || /[/\\%\x00-\x1f\x7f]/.test(input.filename) || input.filename.includes("..") || !fmt.extensions.includes(path.extname(input.filename).toLowerCase())) fail(400, "invalid_media_filename");
  if (input.alt !== undefined) text(input.alt, 500); if (input.description !== undefined) text(input.description, 2000);
  try {
    const image = sharp(input.bytes, { failOn: "warning", limitInputPixels: MAX_PIXELS, animated: false });
    const meta = await image.metadata();
    if (meta.format !== fmt.format) fail(415, "media_mime_mismatch");
    if (!meta.width || !meta.height || meta.width > MAX_DIMENSION || meta.height > MAX_DIMENSION || meta.width * meta.height > MAX_PIXELS) fail(413, "media_dimensions_exceeded");
    if ((meta.pages || 1) !== 1) fail(415, "animated_media_not_supported");
    // Force full pixel decoding and re-encode to strip EXIF/scripts/trailing payloads. Metadata alone is not validation.
    const output = await image.rotate().toFormat(fmt.format).toBuffer({ resolveWithObject: true });
    if (output.data.length > MAX_UPLOAD_BYTES) fail(413, "media_too_large");
    return { bytes: output.data, width: output.info.width, height: output.info.height, sha256: createHash("sha256").update(output.data).digest("hex"), ext: fmt.ext };
  } catch (error) {
    if (error instanceof OperationsError) throw error;
    if (error instanceof Error && /pixel limit/i.test(error.message)) fail(413, "media_dimensions_exceeded");
    fail(400, "invalid_media_image");
  }
}
async function uploadVersion(db: DatabaseSync, input: MediaInput, replaceId?: string): Promise<MediaWriteResult> {
  ensureMediaSchema(db); const ctx = mutationContext(input);
  if (replaceId) assertId(replaceId);
  const action = replaceId ? "replaced" : "created";
  const hash = jsonHash({ action, id: replaceId || null, filename: input.filename, mime: input.mime,
    bytes: Buffer.isBuffer(input.bytes) ? createHash("sha256").update(input.bytes).digest("hex") : null, alt: input.alt ?? null, description: input.description ?? null });
  const existing = replay(db, ctx, hash); if (existing) return existing;
  const id = replaceId || `med_${randomUUID()}`;
  let decoded: Awaited<ReturnType<typeof decode>>;
  try { decoded = await decode(input); } catch (error) { return failedWrite(db, input, hash, id, action, error); }
  let createdFile: string | undefined;
  let dbCommitted = false;
  try {
    const result = write(db, input, hash, id, action, () => {
      const current = replaceId ? rowFor(db, id) : undefined;
      if (current && current.status !== "active") fail(409, "invalid_state");
      const version = current ? Number(current.version) + 1 : 1;
      const relative = `${id}.v${version}.${decoded.ext}`;
      createdFile = path.join(storeDir(db), relative);
      let fd: number;
      try { fd = fs.openSync(createdFile, "wx", 0o600); } catch { createdFile = undefined; fail(503, "media_file_conflict"); }
      try { fs.writeFileSync(fd!, decoded.bytes); fs.fsyncSync(fd!); } finally { fs.closeSync(fd!); }
      const dirFd = fs.openSync(path.dirname(createdFile), "r"); try { fs.fsyncSync(dirFd); } finally { fs.closeSync(dirFd); }
      const now = nowIso(), alt = input.alt ?? String(current?.alt || ""), description = input.description ?? String(current?.description || "");
      if (current) db.prepare("UPDATE media SET filename=?,mime=?,bytes=?,path=?,version=?,width=?,height=?,sha256=?,alt=?,description=?,updated_at=? WHERE id=?").run(input.filename, input.mime, decoded.bytes.length, relative, version, decoded.width, decoded.height, decoded.sha256, alt, description, now, id);
      else db.prepare("INSERT INTO media(id,filename,mime,bytes,path,version,status,created_at,updated_at,width,height,sha256,alt,description) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)").run(id, input.filename, input.mime, decoded.bytes.length, relative, version, "active", now, now, decoded.width, decoded.height, decoded.sha256, alt, description);
      db.prepare("INSERT INTO media_versions VALUES(?,?,?,?,?,?,?,?,?)").run(id, version, relative, input.mime, decoded.bytes.length, decoded.width, decoded.height, decoded.sha256, now);
      return { row: rowFor(db, id), beforeHash: current ? jsonHash(current) : null };
    });
    dbCommitted = true; return result;
  } finally {
    // A crash may leave an unreferenced immutable file; fail closed, never overwrite it on a retry.
    if (createdFile && !dbCommitted) { try { fs.unlinkSync(createdFile); } catch { /* not exposed without DB entry */ } }
  }
}
export function saveMedia(db: DatabaseSync, input: MediaInput): Promise<MediaWriteResult> { return uploadVersion(db, input); }
export function replaceMedia(db: DatabaseSync, id: string, input: MediaInput): Promise<MediaWriteResult> { return uploadVersion(db, input, id); }
export function updateMediaMetadata(db: DatabaseSync, id: string, patch: { alt?: string; description?: string }, input: MediaMutation): MediaWriteResult {
  assertId(id); ensureMediaSchema(db);
  const hash = jsonHash({ action: "metadata_updated", id, patch });
  return write(db, input, hash, id, "metadata_updated", () => {
    if (!patch || typeof patch !== "object" || Array.isArray(patch) || !Object.keys(patch).length || Object.keys(patch).some(key => !["alt", "description"].includes(key))) fail(400, "invalid_media_metadata");
    const row = rowFor(db, id); if (row.status !== "active") fail(409, "invalid_state");
    const alt = patch.alt === undefined ? String(row.alt) : text(patch.alt, 500);
    const description = patch.description === undefined ? String(row.description) : text(patch.description, 2000);
    db.prepare("UPDATE media SET alt=?,description=?,updated_at=? WHERE id=?").run(alt, description, nowIso(), id);
    return { row: rowFor(db, id), beforeHash: jsonHash(row) };
  });
}
function changeStatus(db: DatabaseSync, id: string, input: MediaMutation, restore: boolean): MediaWriteResult {
  assertId(id); ensureMediaSchema(db);
  const action = restore ? "restored" : "deleted", hash = jsonHash({ action, id });
  return write(db, input, hash, id, action, () => {
    const row = rowFor(db, id);
    if (row.status !== (restore ? "deleted" : "active")) fail(409, "invalid_state");
    if (!restore) { const references = publicReferences(db, id); if (references.length) fail(409, "media_in_use", { referenceCount: references.length, references }); }
    if (restore) {
      // Restoring exposes every old version URL, so validate all retained immutable versions.
      const versions = db.prepare("SELECT * FROM media_versions WHERE media_id=?").all(id) as Row[];
      if (!versions.length) fail(503, "media_integrity_failed");
      for (const version of versions) {
        const bytes = fileBytes(db, String(version.path));
        if (bytes.length !== Number(version.bytes) || createHash("sha256").update(bytes).digest("hex") !== version.sha256) fail(503, "media_integrity_failed");
      }
    }
    const now = nowIso(); db.prepare("UPDATE media SET status=?,deleted_at=?,updated_at=? WHERE id=?").run(restore ? "active" : "deleted", restore ? null : now, now, id);
    return { row: rowFor(db, id), beforeHash: jsonHash(row) };
  });
}
export function softDeleteMedia(db: DatabaseSync, id: string, input: MediaMutation): MediaWriteResult { return changeStatus(db, id, input, false); }
export function restoreMedia(db: DatabaseSync, id: string, input: MediaMutation): MediaWriteResult { return changeStatus(db, id, input, true); }
function fileBytes(db: DatabaseSync, relative: string): Buffer {
  if (!/^med_[0-9a-f-]+\.v[1-9][0-9]*\.(png|jpg|webp)$/.test(relative)) fail(400, "invalid_media_path");
  const file = path.join(storeDir(db), relative);
  let fd: number;
  try { fd = fs.openSync(file, fs.constants.O_RDONLY | fs.constants.O_NOFOLLOW); } catch { fail(404, "not_found"); }
  try {
    const stat = fs.fstatSync(fd!); if (!stat.isFile() || stat.size > MAX_UPLOAD_BYTES || !stat.size) fail(503, "media_integrity_failed");
    return fs.readFileSync(fd!);
  } finally { fs.closeSync(fd!); }
}
export function readMediaAsset(db: DatabaseSync, segments: string[]): { bytes: Buffer; mime: string; sha256: string } {
  if (!Array.isArray(segments) || segments.length !== 2 || !ID.test(segments[0]) || !/^v[1-9][0-9]{0,8}\.(png|jpg|webp)$/.test(segments[1])) fail(400, "invalid_media_path");
  ensureMediaSchema(db);
  const [id, file] = segments, version = Number(file.slice(1, file.indexOf(".")));
  const row = db.prepare("SELECT v.* FROM media_versions v JOIN media m ON m.id=v.media_id WHERE m.id=? AND m.status='active' AND v.version=?").get(id, version) as Row | undefined;
  if (!row || !FORMATS[String(row.mime)] || file !== `v${version}.${FORMATS[String(row.mime)].ext}` || !Number(row.width) || !Number(row.height)) fail(404, "not_found");
  const bytes = fileBytes(db, String(row.path));
  if (bytes.length !== Number(row.bytes) || createHash("sha256").update(bytes).digest("hex") !== row.sha256) fail(503, "media_integrity_failed");
  return { bytes, mime: String(row.mime), sha256: String(row.sha256) };
}
export function mediaAssetResponse(db: DatabaseSync, segments: string[], head = false): Response {
  try {
    const asset = readMediaAsset(db, segments);
    return new Response(head ? null : new Uint8Array(asset.bytes), { headers: { "Content-Type": asset.mime, "X-Content-Type-Options": "nosniff", "Cache-Control": "public, max-age=31536000, immutable", "Content-Length": String(asset.bytes.length), "ETag": `"${asset.sha256}"`, "Content-Disposition": "inline", "Content-Security-Policy": "default-src 'none'; sandbox" } });
  } catch (error) {
    const safe = normalizedError(error);
    return Response.json({ error: safe.code }, { status: safe.status, headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" } });
  }
}
export function checkMediaUploadRate(db: DatabaseSync, actor: MediaActor, window = Math.floor(Date.now() / 60000)): void {
  ensureMediaSchema(db);
  const type = actor.actorType || "client";
  const limited = inTransaction(db, () => {
    db.prepare("DELETE FROM media_upload_limits WHERE window_start<?").run(window - 2);
    const row = db.prepare("SELECT request_count FROM media_upload_limits WHERE actor_type=? AND actor_id=? AND window_start=?").get(type, actor.actorId, window) as Row | undefined;
    if (Number(row?.request_count || 0) >= MAX_UPLOADS_PER_MINUTE) return true;
    db.prepare("INSERT INTO media_upload_limits VALUES(?,?,?,1) ON CONFLICT(actor_type,actor_id,window_start) DO UPDATE SET request_count=request_count+1").run(type, actor.actorId, window); return false;
  });
  if (limited) fail(429, "rate_limited");
}
async function boundedBody(request: Request, max: number): Promise<Buffer> {
  const declared = request.headers.get("content-length");
  if (declared !== null && (!/^\d+$/.test(declared) || !Number.isSafeInteger(Number(declared)))) fail(400, "invalid_content_length");
  if (declared !== null && Number(declared) > max) fail(413, "media_too_large");
  if (!request.body) fail(400, "media_file_required");
  const reader = request.body.getReader(), chunks: Uint8Array[] = []; let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read(); if (done) break;
      size += value.byteLength; if (size > max) { await reader.cancel(); fail(413, "media_too_large"); } chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  if (declared !== null && Number(declared) !== size) fail(400, "invalid_content_length");
  return Buffer.concat(chunks, size);
}
export function mediaRequestMutation(request: Request, actor: MediaActor): MediaMutation {
  const input = { ...actor, idempotencyKey: request.headers.get("idempotency-key") || undefined }; mutationContext(input); return input;
}
export async function readMediaUpload(request: Request, db: DatabaseSync, actor: MediaActor): Promise<MediaInput> {
  const mutation = mediaRequestMutation(request, actor);
  const contentType = request.headers.get("content-type") || "";
  if (!/^multipart\/form-data\s*;.*boundary=/i.test(contentType)) fail(415, "multipart_required");
  // Length preflight and persisted rate gate both happen before consuming multipart input.
  const length = request.headers.get("content-length");
  if (length && /^\d+$/.test(length) && Number(length) > MAX_MEDIA_REQUEST_BYTES) fail(413, "media_too_large");
  checkMediaUploadRate(db, actor);
  const bytes = await boundedBody(request, MAX_MEDIA_REQUEST_BYTES);
  let form: FormData;
  try { form = await new Request(request.url, { method: "POST", headers: { "content-type": contentType }, body: new Uint8Array(bytes) }).formData(); } catch { fail(400, "invalid_media_form"); }
  if ([...form!.keys()].some(key => !["file", "alt", "description"].includes(key)) || [...new Set(form!.keys())].some(key => form!.getAll(key).length !== 1)) fail(400, "invalid_media_form");
  const file = form!.get("file"); if (!(file instanceof File)) fail(400, "media_file_required");
  if (file.size > MAX_UPLOAD_BYTES) fail(413, "media_too_large");
  const alt = form!.get("alt"), description = form!.get("description");
  return { ...mutation, filename: file.name, mime: file.type, bytes: Buffer.from(await file.arrayBuffer()),
    alt: alt === null ? undefined : text(alt, 500), description: description === null ? undefined : text(description, 2000) };
}
export async function readMediaJson(request: Request): Promise<Record<string, unknown>> {
  if (!/^application\/json(?:\s*;|$)/i.test(request.headers.get("content-type") || "")) fail(415, "json_required");
  const bytes = await boundedBody(request, 16 * 1024); let value: unknown;
  try { value = JSON.parse(bytes.toString("utf8")); } catch { fail(400, "invalid_media_metadata"); }
  if (!value || typeof value !== "object" || Array.isArray(value)) fail(400, "invalid_media_metadata");
  return value as Record<string, unknown>;
}

export function guardMediaGrant(context: AuthContext, id?: string, creating = false): void {
  if (!context.resources.includes("*") && !context.resources.includes("media")) fail(403, "insufficient_scope");
  const ids = context.resourceIds.media;
  if (ids && ((id !== undefined && !ids.includes(id)) || creating)) fail(403, "insufficient_scope");
}
export function listMediaForIntegration(db: DatabaseSync, context: AuthContext, options: MediaListOptions): MediaRecord[] {
  guardMediaGrant(context); return listMedia(db, { ...options, ids: context.resourceIds.media });
}
