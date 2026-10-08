import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import sharp from "sharp";
import { DatabaseSync } from "node:sqlite";
import { openOperationsDb, resetOperationsDb, closeOperationsDb } from "../../lib/operations/db.ts";
import * as media from "../../lib/operations/media.ts";

async function fixture(fn: (db: DatabaseSync, dir: string) => Promise<void> | void) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "hy-w3-"));
  const previous = { DATA_DIR: process.env.DATA_DIR, MEDIA_DIR: process.env.MEDIA_DIR };
  process.env.DATA_DIR = dir; process.env.MEDIA_DIR = path.join(dir, "media");
  const db = openOperationsDb(dir);
  try { await fn(db, dir); } finally {
    resetOperationsDb(dir); fs.rmSync(dir, { recursive: true, force: true });
    for (const [key, value] of Object.entries(previous)) { if (value === undefined) delete process.env[key]; else process.env[key] = value; }
  }
}
type Row = Record<string, unknown>;
const actor = { actorId: "cli_test", actorType: "client" as const };
const pixel = (format: "png" | "jpeg" | "webp" = "png", width = 3, height = 2) => sharp({ create: { width, height, channels: 3, background: "#ff00aa" } }).toFormat(format).toBuffer();
async function upload(db: DatabaseSync, key = "upload-one") { return media.saveMedia(db, { ...actor, filename: "pixel.png", mime: "image/png", bytes: await pixel(), alt: "图片", description: "描述", idempotencyKey: key }); }

// RED evidence: the original six-byte implementation accepted this exact buffer.
test("W3 rejects PNG magic without actual image decoding", () => fixture(async db => {
  await assert.rejects(async () => media.saveMedia(db, { ...actor, filename: "fake.png", mime: "image/png", bytes: Buffer.from([0x89,0x50,0x4e,0x47,0x0d,0x0a]), idempotencyKey: "fake-one" }), /invalid_media_image/);
}));
for (const format of ["png", "jpeg", "webp"] as const) test(`W3 fully decodes real ${format} and stores dimensions, metadata, receipt`, () => fixture(async (db, dir) => {
  const result = await media.saveMedia(db, { ...actor, filename: `image.${format}`, mime: `image/${format}`, bytes: await pixel(format), alt: "a", description: "d", idempotencyKey: `real-${format}` });
  assert.equal(result.width, 3); assert.equal(result.height, 2); assert.equal(result.alt, "a"); assert.equal(result.description, "d");
  assert.match(result.url, new RegExp(`/media/${result.id}/v1\\.`)); assert.equal(result.receipt.status, "committed");
  const file = media.readMediaAsset(db, result.url.slice("/media/".length).split("/"));
  assert.equal(file.mime, `image/${format}`); assert.equal((await sharp(file.bytes).metadata()).width, 3);
  assert.equal(fs.readdirSync(path.join(dir, "media")).length, 1);
  assert.equal((db.prepare("SELECT count(*) AS n FROM audit WHERE resource='media'").get() as Row).n, 1);
  assert.equal((db.prepare("SELECT actor_id FROM operations WHERE id=?").get(result.operationId) as Row).actor_id, actor.actorId);
}));
test("W3 rejects clean SVG, disguised SVG, MIME mismatch, and extension mismatch", () => fixture(async db => {
  for (const [filename, mime, bytes, code] of [
    ["x.svg", "image/svg+xml", Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"/>'), "unsupported_media_type"],
    ["x.png", "image/png", Buffer.from('<svg><script>alert(1)</script></svg>'), "invalid_media_image"],
    ["x.png", "image/png", await pixel("jpeg"), "media_mime_mismatch"],
    ["x.jpg", "image/png", await pixel(), "invalid_media_filename"],
    ["x.js", "image/png", await pixel(), "invalid_media_filename"],
  ] as const) await assert.rejects(async () => media.saveMedia(db, { ...actor, filename, mime, bytes, idempotencyKey: `bad-${filename}-${mime}-${code}` }), new RegExp(code));
  assert.equal(media.listMedia(db).length, 0);
}));
test("W3 rejects truncated real PNG and JPEG", () => fixture(async db => {
  for (const format of ["png", "jpeg"] as const) {
    const bytes = await pixel(format, 64, 64);
    await assert.rejects(async () => media.saveMedia(db, { ...actor, filename: `x.${format}`, mime: `image/${format}`, bytes: bytes.subarray(0, Math.floor(bytes.length / 2)), idempotencyKey: `truncated-${format}` }), /invalid_media_image/);
  }
}));
test("W3 rejects byte overflow and oversized dimensions", () => fixture(async db => {
  await assert.rejects(async () => media.saveMedia(db, { ...actor, filename: "big.png", mime: "image/png", bytes: Buffer.alloc(media.MAX_UPLOAD_BYTES + 1), idempotencyKey: "too-big" }), /media_too_large/);
  await assert.rejects(async () => media.saveMedia(db, { ...actor, filename: "wide.png", mime: "image/png", bytes: await pixel("png", 8193, 1), idempotencyKey: "too-wide" }), /media_dimensions_exceeded/);
}));
test("W3 refuses traversing filename, asset id and URL path", () => fixture(async db => {
  for (const filename of ["../x.png", "..\\x.png", "%2e%2e.png", "x\0.png"]) await assert.rejects(async () => media.saveMedia(db, { ...actor, filename, mime: "image/png", bytes: await pixel(), idempotencyKey: `path-${Buffer.from(filename).toString("hex")}` }), /invalid_media_filename/);
  assert.throws(() => media.getMedia(db, "../etc/passwd"), /invalid_media_id/);
  for (const segments of [["..", "passwd"], ["%2e%2e", "v1.png"], ["med_bad", "../v1.png"], ["med_bad", "v1.png", "x"]]) assert.throws(() => media.readMediaAsset(db, segments), /invalid_media_path/);
}));
test("W3 replaces bytes with immutable version URL and keeps old bytes readable", () => fixture(async db => {
  const first = await upload(db);
  const second = await media.replaceMedia(db, first.id, { ...actor, filename: "next.webp", mime: "image/webp", bytes: await pixel("webp", 5, 4), idempotencyKey: "replace-one" });
  assert.equal(second.id, first.id); assert.equal(second.version, 2); assert.notEqual(second.url, first.url); assert.equal(second.alt, first.alt);
  assert.equal(media.readMediaAsset(db, first.url.slice(7).split("/")).mime, "image/png");
  assert.equal(media.readMediaAsset(db, second.url.slice(7).split("/")).mime, "image/webp");
  assert.throws(() => media.readMediaAsset(db, [first.id, "v1.webp"]), /not_found/);
}));
test("W3 metadata editing and filtering", () => fixture(async db => {
  const first = await upload(db);
  const updated = media.updateMediaMetadata(db, first.id, { alt: "新文本", description: "changed" }, { ...actor, idempotencyKey: "metadata-one" });
  assert.equal(updated.alt, "新文本"); assert.equal(updated.version, 1);
  assert.equal(media.listMedia(db, { query: "changed", mime: "image/png" }).length, 1);
  assert.equal(media.listMedia(db, { mime: "image/webp" }).length, 0);
  assert.equal(media.listMedia(db, { query: "%" }).length, 0);
  assert.throws(() => media.updateMediaMetadata(db, first.id, { alt: "x".repeat(501) }, { ...actor, idempotencyKey: "long-alt" }), /invalid_media_metadata/);
}));
test("W3 committed receipts replay exact response after process DB reopen", () => fixture(async (db, dir) => {
  const first = await upload(db);
  closeOperationsDb(dir); const reopened = openOperationsDb(dir);
  const replayed = await upload(reopened);
  assert.deepEqual(replayed, first);
  assert.equal((reopened.prepare("SELECT count(*) AS n FROM media").get() as Row).n, 1);
  assert.equal((reopened.prepare("SELECT count(*) AS n FROM operations WHERE resource='media'").get() as Row).n, 1);
  await assert.rejects(async () => media.saveMedia(reopened, { ...actor, filename: "pixel.png", mime: "image/png", bytes: await pixel(), alt: "different", idempotencyKey: "upload-one" }), /idempotency_conflict/);
  const other = await media.saveMedia(reopened, { actorId: "other", filename: "pixel.png", mime: "image/png", bytes: await pixel(), idempotencyKey: "upload-one" });
  assert.notEqual(other.id, first.id);
}));
test("W3 rejects absent idempotency key", () => fixture(async db => {
  await assert.rejects(async () => media.saveMedia(db, { ...actor, filename: "x.png", mime: "image/png", bytes: await pixel() }), /idempotency_key_required/);
}));
test("W3 published content blocks deletion even when latest working record is draft", () => fixture(async db => {
  const first = await upload(db);
  db.prepare("INSERT INTO records(resource,id,status,version,data_json,etag,updated_at,public_status,published_json) VALUES(?,?,?,?,?,?,?,?,?)").run("pages", "home", "draft", 2, "{}", "x", new Date().toISOString(), "published", JSON.stringify({ blocks: [{ image: `https://example.com${first.url}` }] }));
  assert.equal(media.getMedia(db, first.id)!.publicReferenceCount, 1);
  assert.throws(() => media.softDeleteMedia(db, first.id, { ...actor, idempotencyKey: "delete-referenced" }), /media_in_use/);
  assert.equal(media.getMedia(db, first.id)!.status, "active");
}));
test("W3 projected public content and legacy snapshots block deletion; drafts do not", () => fixture(async (db, dir) => {
  const first = await upload(db);
  db.prepare("INSERT INTO projections(resource,data_json,generation,updated_at) VALUES(?,?,?,?)").run("pages", JSON.stringify([{ id: "home", blocks: [{ mediaId: first.id }] }]), 1, new Date().toISOString());
  assert.throws(() => media.softDeleteMedia(db, first.id, { ...actor, idempotencyKey: "projection-ref" }), /media_in_use/);
  db.exec("DELETE FROM projections");
  fs.writeFileSync(path.join(dir, "cases.json"), JSON.stringify([{ slug: "case", image: first.url }]));
  assert.throws(() => media.softDeleteMedia(db, first.id, { ...actor, idempotencyKey: "legacy-ref" }), /media_in_use/);
  fs.writeFileSync(path.join(dir, "cases.json"), "[]");
  db.prepare("INSERT INTO records(resource,id,status,version,data_json,etag,updated_at) VALUES(?,?,?,?,?,?,?)").run("pages", "draft-only", "draft", 1, JSON.stringify({ mediaId: first.id }), "x", new Date().toISOString());
  assert.equal(media.softDeleteMedia(db, first.id, { ...actor, idempotencyKey: "draft-not-ref" }).status, "deleted");
}));
test("W3 soft deletion hides all version URLs; restore restores them; retries are audited once", () => fixture(async db => {
  const first = await upload(db);
  const deleted = media.softDeleteMedia(db, first.id, { ...actor, idempotencyKey: "delete-one" });
  assert.equal(media.listMedia(db).length, 0); assert.equal(media.listMedia(db, { status: "deleted" }).length, 1);
  assert.throws(() => media.readMediaAsset(db, first.url.slice(7).split("/")), /not_found/);
  assert.throws(() => media.restoreMedia(db, "med_00000000-0000-4000-8000-000000000000", { ...actor, idempotencyKey: "restore-missing" }), /not_found/);
  const restored = media.restoreMedia(db, first.id, { ...actor, idempotencyKey: "restore-one" });
  assert.equal(restored.url, first.url); assert.equal(restored.status, "active");
  assert.deepEqual(media.softDeleteMedia(db, first.id, { ...actor, idempotencyKey: "delete-one" }), deleted);
  assert.equal(media.getMedia(db, first.id)!.status, "active");
  assert.equal(media.readMediaAsset(db, first.url.slice(7).split("/")).mime, "image/png");
  assert.equal((db.prepare("SELECT count(*) AS n FROM audit WHERE resource='media' AND action='media.deleted'").get() as Row).n, 1);
}));
test("W3 additive media migration preserves legacy columns and runs repeatedly", () => fixture(db => {
  db.prepare("INSERT INTO media(id,filename,mime,bytes,path,version,status,created_at) VALUES(?,?,?,?,?,?,?,?)").run("legacy", "old.png", "image/png", 6, "legacy.png", 1, "active", "2026-01-01");
  media.ensureMediaSchema(db); media.ensureMediaSchema(db);
  assert.equal((db.prepare("SELECT filename FROM media WHERE id='legacy'").get() as Row).filename, "old.png");
  const columns = (db.prepare("PRAGMA table_info(media)").all() as Row[]).map(x => x.name);
  for (const name of ["alt", "description", "width", "height", "sha256", "deleted_at", "updated_at"]) assert.ok(columns.includes(name));
}));
test("W3 rejects symlinked media storage outside DATA_DIR", () => fixture(async (db, dir) => {
  fs.rmSync(path.join(dir, "media"), { recursive: true, force: true }); fs.symlinkSync(os.tmpdir(), path.join(dir, "media"));
  await assert.rejects(() => upload(db), /unsafe_media_storage/);
}));
test("W3 front-loaded body bound rejects declared overflow before reading", () => fixture(async db => {
  let read = false;
  const request = new Request("http://localhost/upload", { method: "POST", headers: { "content-length": String(media.MAX_MEDIA_REQUEST_BYTES + 1), "content-type": "multipart/form-data; boundary=x", "idempotency-key": "body-large" } });
  Object.defineProperty(request, "body", { get() { read = true; return null; } });
  await assert.rejects(() => media.readMediaUpload(request, db, actor), /media_too_large/); assert.equal(read, false);
}));
test("W3 streaming body bound cancels overflow without Content-Length", () => fixture(async db => {
  let cancelled = false;
  const stream = new ReadableStream({ pull(c) { c.enqueue(new Uint8Array(1024 * 1024)); }, cancel() { cancelled = true; } });
  const request = new Request("http://localhost/upload", { method: "POST", headers: { "content-type": "multipart/form-data; boundary=x", "idempotency-key": "stream-large" }, body: stream, duplex: "half" } as RequestInit);
  await assert.rejects(() => media.readMediaUpload(request, db, actor), /media_too_large/); assert.ok(cancelled);
}));
test("W3 upload throttling persists and stops request before body read", () => fixture(async db => {
  for (let i = 0; i < media.MAX_UPLOADS_PER_MINUTE; i++) media.checkMediaUploadRate(db, actor, 100);
  assert.throws(() => media.checkMediaUploadRate(db, actor, 100), /rate_limited/);
  media.checkMediaUploadRate(db, { actorId: "other" }, 100);
  media.checkMediaUploadRate(db, actor, 101);
}));
test("W3 public responses use immutable cache, exact MIME, nosniff and deleted assets are no-store", () => fixture(async db => {
  const first = await upload(db);
  const response = media.mediaAssetResponse(db, first.url.slice(7).split("/"));
  assert.equal(response.headers.get("Content-Type"), "image/png"); assert.equal(response.headers.get("X-Content-Type-Options"), "nosniff");
  assert.equal(response.headers.get("Cache-Control"), "public, max-age=31536000, immutable");
  assert.equal(response.headers.get("ETag"), `"${first.sha256}"`);
  media.softDeleteMedia(db, first.id, { ...actor, idempotencyKey: "cache-delete" });
  const missing = media.mediaAssetResponse(db, first.url.slice(7).split("/")); assert.equal(missing.status, 404); assert.equal(missing.headers.get("Cache-Control"), "no-store");
}));

test("W3 failed writes persist audit/receipt and replay identical error details", () => fixture(async db => {
  const first = await upload(db);
  db.prepare("INSERT INTO records(resource,id,status,version,data_json,etag,updated_at,public_status,published_json) VALUES(?,?,?,?,?,?,?,?,?)").run("pages", "ref", "draft", 1, "{}", "x", new Date().toISOString(), "published", JSON.stringify({ id: "ref", mediaId: first.id }));
  let initial: unknown;
  try { media.softDeleteMedia(db, first.id, { ...actor, idempotencyKey: "persistent-failure" }); } catch (error) { initial = error; }
  assert.ok(initial);
  let repeated: unknown;
  try { media.softDeleteMedia(db, first.id, { ...actor, idempotencyKey: "persistent-failure" }); } catch (error) { repeated = error; }
  assert.deepEqual((repeated as { details: unknown }).details, (initial as { details: unknown }).details);
  assert.equal((db.prepare("SELECT count(*) AS n FROM operations WHERE resource='media' AND status='failed'").get() as Row).n, 1);
  assert.equal((db.prepare("SELECT count(*) AS n FROM audit WHERE action='media.deleted.failed'").get() as Row).n, 1);
}));
test("W3 restore rejects a missing older immutable version, not just missing current bytes", () => fixture(async (db, dir) => {
  const first = await upload(db);
  await media.replaceMedia(db, first.id, { ...actor, filename: "new.png", mime: "image/png", bytes: await pixel("png", 4, 4), idempotencyKey: "missing-old-replace" });
  media.softDeleteMedia(db, first.id, { ...actor, idempotencyKey: "missing-old-delete" });
  fs.unlinkSync(path.join(dir, "media", `${first.id}.v1.png`));
  assert.throws(() => media.restoreMedia(db, first.id, { ...actor, idempotencyKey: "missing-old-restore" }), /not_found|media_integrity_failed/);
  assert.equal(media.getMedia(db, first.id)!.status, "deleted");
}));
test("W3 public working-data edits do not become published references", () => fixture(async db => {
  const first = await upload(db);
  db.prepare("INSERT INTO records(resource,id,status,version,data_json,etag,updated_at,public_status,published_json) VALUES(?,?,?,?,?,?,?,?,?)").run("pages", "live-working", "published", 2, JSON.stringify({ mediaId: first.id }), "x", new Date().toISOString(), "published", JSON.stringify({ title: "public without image" }));
  assert.equal(media.softDeleteMedia(db, first.id, { ...actor, idempotencyKey: "working-not-live" }).status, "deleted");
}));
test("W3 re-encoding strips appended script payload and injected image metadata", () => fixture(async db => {
  const bytes = await sharp(await pixel()).withMetadata({ exif: { IFD0: { ImageDescription: "<script>evil()</script>" } } }).png().toBuffer();
  const created = await media.saveMedia(db, { ...actor, filename: "polyglot.png", mime: "image/png", bytes: Buffer.concat([bytes, Buffer.from('<svg onload="evil()"/>')]), idempotencyKey: "polyglot-test" });
  const served = media.readMediaAsset(db, created.url.slice(7).split("/"));
  assert.equal(served.bytes.includes(Buffer.from("<svg")), false); assert.equal((await sharp(served.bytes).metadata()).exif, undefined);
}));
test("W3 concurrent same-key requests produce one asset/one audit/one receipt", () => fixture(async (db, dir) => {
  const [first, second] = await Promise.all([upload(db), upload(db)]);
  assert.deepEqual(first, second); assert.equal(fs.readdirSync(path.join(dir, "media")).length, 1);
  assert.equal((db.prepare("SELECT count(*) AS n FROM audit WHERE resource='media'").get() as Row).n, 1);
}));
test("W3 serves no tampered bytes and refuses restore with corrupt bytes", () => fixture(async (db, dir) => {
  const first = await upload(db), file = path.join(dir, "media", `${first.id}.v1.png`);
  fs.writeFileSync(file, await pixel("png", 4, 4));
  assert.equal(media.mediaAssetResponse(db, first.url.slice(7).split("/")).status, 503);
  media.softDeleteMedia(db, first.id, { ...actor, idempotencyKey: "corrupt-delete" });
  assert.throws(() => media.restoreMedia(db, first.id, { ...actor, idempotencyKey: "corrupt-restore" }), /media_integrity_failed/);
}));
