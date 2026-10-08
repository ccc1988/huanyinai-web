import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";
import * as moduleApi from "node:module";
import sharp from "sharp";
import { openOperationsDb, resetOperationsDb } from "../../lib/operations/db.ts";
import { createClient, issueToken } from "../../lib/operations/auth.ts";
import { MAX_MEDIA_REQUEST_BYTES } from "../../lib/operations/media.ts";

// Load real Next route handlers under node:test without changing package/tsconfig or building the site.
const root = path.resolve(fileURLToPath(new URL("../../", import.meta.url)));
(moduleApi as unknown as { registerHooks: (hooks: object) => void }).registerHooks({
  resolve(specifier: string, context: { parentURL?: string }, next: (specifier: string, context: object) => unknown) {
    if (specifier === "next/server") return next("next/server.js", context);
    let candidate: string | undefined;
    if (specifier.startsWith("@/")) candidate = path.join(root, specifier.slice(2));
    else if (specifier.startsWith(".") && context.parentURL?.startsWith(pathToFileURL(root + "/").href)) candidate = path.resolve(path.dirname(fileURLToPath(context.parentURL)), specifier);
    if (candidate && !path.extname(candidate)) for (const ext of [".ts", ".tsx"]) if (fs.existsSync(candidate + ext)) return next(pathToFileURL(candidate + ext).href, context);
    return next(specifier, context);
  },
});
process.env.ADMIN_SESSION_SECRET = "w3-test-session-secret-not-a-production-secret";
const { NextRequest } = await import("next/server.js");
const { createSession } = await import("../../lib/auth.ts");
const { csrfToken } = await import("../../lib/operations/admin.ts");
type Handler = (request: InstanceType<typeof NextRequest>, context?: { params: Promise<Record<string, string | string[]>> }) => Promise<Response>;
async function route(file: string): Promise<Record<string, Handler>> { return import(pathToFileURL(path.join(root, file)).href); }
async function fixture(fn: (db: ReturnType<typeof openOperationsDb>, headers: Record<string, string>) => Promise<void>) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "hy-w3-route-"));
  const previous = { DATA_DIR: process.env.DATA_DIR, MEDIA_DIR: process.env.MEDIA_DIR, OPERATIONS_API_ENABLED: process.env.OPERATIONS_API_ENABLED };
  process.env.DATA_DIR = dir; process.env.MEDIA_DIR = path.join(dir, "media"); process.env.OPERATIONS_API_ENABLED = "true";
  const db = openOperationsDb(dir); const cookie = `huanyin_admin_session=${createSession()}`;
  const headers = { cookie, "x-csrf-token": csrfToken(new NextRequest("http://localhost/api/admin/media", { headers: { cookie } })) };
  try { await fn(db, headers); } finally {
    resetOperationsDb(dir); fs.rmSync(dir, { recursive: true, force: true });
    for (const [key, value] of Object.entries(previous)) { if (value === undefined) delete process.env[key]; else process.env[key] = value; }
  }
}
async function form() { const data = new FormData(); data.set("file", new File([new Uint8Array(await sharp({ create: { width: 2, height: 2, channels: 3, background: "blue" } }).png().toBuffer())], "pixel.png", { type: "image/png" })); data.set("alt", "route alt"); return data; }
function bearer(db: ReturnType<typeof openOperationsDb>, scopes: string[], resources?: string[]) { const c = createClient(db, { name: "route test", scopes, resources }); return { authorization: `Bearer ${issueToken(db, { clientId: c.client.id, clientSecret: c.clientSecret }).accessToken}` }; }
const params = (id: string) => ({ params: Promise.resolve({ id }) });

test("W3 real admin route upload returns a decoded asset and receipt", () => fixture(async (_db, headers) => {
  const admin = await route("app/api/admin/media/route.ts");
  const response = await admin.POST(new NextRequest("http://localhost/api/admin/media", { method: "POST", headers: { ...headers, "idempotency-key": "route-upload" }, body: await form() }));
  assert.equal(response.status, 201); const result = await response.json();
  assert.match(result.id, /^med_/); assert.equal(result.width, 2); assert.equal(result.alt, "route alt"); assert.equal(result.receipt.status, "committed");
}));
test("W3 admin requires session cookie, never accepts bearer-only, and checks CSRF before reading body", () => fixture(async (db, headers) => {
  const admin = await route("app/api/admin/media/route.ts");
  assert.equal((await admin.GET(new NextRequest("http://localhost/api/admin/media", { headers: bearer(db, ["media:read", "media:write"]) }))).status, 401);
  const denied = await admin.POST(new NextRequest("http://localhost/api/admin/media", { method: "POST", headers: { cookie: headers.cookie, "content-length": String(MAX_MEDIA_REQUEST_BYTES + 1) } }));
  assert.equal(denied.status, 403);
  const foreign = await admin.POST(new NextRequest("http://localhost/api/admin/media", { method: "POST", headers: { ...headers, origin: "http://evil.example" }, body: await form() })); assert.equal(foreign.status, 403);
}));
test("W3 integration upload checks media:write, integration GET checks media:read, cookies cannot substitute", () => fixture(async (db, headers) => {
  const external = await route("app/api/integrations/v1/media/route.ts");
  const read = bearer(db, ["media:read"]), write = bearer(db, ["media:write"]);
  assert.equal((await external.POST(new NextRequest("http://localhost/api/integrations/v1/media", { method: "POST", headers: { ...read, "idempotency-key": "scope-test" }, body: await form() }))).status, 403);
  assert.equal((await external.GET(new NextRequest("http://localhost/api/integrations/v1/media", { headers: write }))).status, 403);
  assert.equal((await external.GET(new NextRequest("http://localhost/api/integrations/v1/media", { headers }))).status, 401);
  const accepted = await external.POST(new NextRequest("http://localhost/api/integrations/v1/media", { method: "POST", headers: { ...write, "idempotency-key": "external-upload" }, body: await form() }));
  assert.equal(accepted.status, 201); assert.match((await accepted.json()).id, /^med_/);
  assert.equal((await external.GET(new NextRequest("http://localhost/api/integrations/v1/media", { headers: read }))).status, 200);
}));
test("W3 integration respects resource grants and rejects oversized upload with 413", () => fixture(async (db) => {
  const external = await route("app/api/integrations/v1/media/route.ts");
  assert.equal((await external.GET(new NextRequest("http://localhost/api/integrations/v1/media", { headers: bearer(db, ["media:read"], ["pages"]) }))).status, 403);
  const response = await external.POST(new NextRequest("http://localhost/api/integrations/v1/media", { method: "POST", headers: { ...bearer(db, ["media:write"]), "idempotency-key": "length-preflight", "content-type": "multipart/form-data; boundary=x", "content-length": String(MAX_MEDIA_REQUEST_BYTES + 1) } }));
  assert.equal(response.status, 413);
}));
test("W3 admin id routes metadata/replace/delete/restore enforce CSRF and expose immutable public versions", () => fixture(async (_db, headers) => {
  const admin = await route("app/api/admin/media/route.ts"), item = await route("app/api/admin/media/[id]/route.ts"), restore = await route("app/api/admin/media/[id]/restore/route.ts"), publicRoute = await route("app/media/[...path]/route.ts");
  const first = await (await admin.POST(new NextRequest("http://localhost/api/admin/media", { method: "POST", headers: { ...headers, "idempotency-key": "route-full" }, body: await form() }))).json();
  const url = `http://localhost/api/admin/media/${first.id}`;
  for (const method of ["PATCH", "PUT", "DELETE"]) assert.equal((await item[method](new NextRequest(url, { method, headers: { cookie: headers.cookie } }), params(first.id))).status, 403);
  const patched = await item.PATCH(new NextRequest(url, { method: "PATCH", headers: { ...headers, "idempotency-key": "route-patch", "content-type": "application/json" }, body: JSON.stringify({ description: "route changed" }) }), params(first.id));
  assert.equal(patched.status, 200); assert.equal((await patched.json()).description, "route changed");
  const replaced = await item.PUT(new NextRequest(url, { method: "PUT", headers: { ...headers, "idempotency-key": "route-replace" }, body: await form() }), params(first.id)); assert.equal((await replaced.json()).version, 2);
  const context = { params: Promise.resolve({ path: first.url.slice(7).split("/") }) };
  const publicResponse = await publicRoute.GET(new NextRequest(`http://localhost${first.url}`), context);
  assert.equal(publicResponse.status, 200); assert.equal(publicResponse.headers.get("content-type"), "image/png"); assert.equal(publicResponse.headers.get("x-content-type-options"), "nosniff");
  assert.equal((await item.DELETE(new NextRequest(url, { method: "DELETE", headers: { ...headers, "idempotency-key": "route-delete" } }), params(first.id))).status, 200);
  assert.equal((await publicRoute.GET(new NextRequest(`http://localhost${first.url}`), context)).status, 404);
  assert.equal((await restore.POST(new NextRequest(url + "/restore", { method: "POST", headers: { ...headers, "idempotency-key": "route-restore" } }), params(first.id))).status, 200);
  assert.equal((await publicRoute.GET(new NextRequest(`http://localhost${first.url}`), context)).status, 200);
}));
test("W3 integration id mutations check scopes and persist owner-bound receipts", () => fixture(async (db) => {
  const external = await route("app/api/integrations/v1/media/route.ts"), item = await route("app/api/integrations/v1/media/[id]/route.ts"), restore = await route("app/api/integrations/v1/media/[id]/restore/route.ts");
  const write = bearer(db, ["media:write"]), read = bearer(db, ["media:read"]);
  const created = await (await external.POST(new NextRequest("http://localhost/api/integrations/v1/media", { method: "POST", headers: { ...write, "idempotency-key": "item-create" }, body: await form() }))).json();
  const url = `http://localhost/api/integrations/v1/media/${created.id}`;
  assert.equal((await item.GET(new NextRequest(url, { headers: write }), params(created.id))).status, 403);
  assert.equal((await item.DELETE(new NextRequest(url, { method: "DELETE", headers: { ...read, "idempotency-key": "item-delete-read" } }), params(created.id))).status, 403);
  const deleted = await item.DELETE(new NextRequest(url, { method: "DELETE", headers: { ...write, "idempotency-key": "item-delete" } }), params(created.id)); assert.equal(deleted.status, 200);
  const recovered = await restore.POST(new NextRequest(url + "/restore", { method: "POST", headers: { ...write, "idempotency-key": "item-restore" } }), params(created.id)); assert.equal(recovered.status, 200);
  assert.ok((await recovered.json()).operationId);
}));

test("W3 media ID grants filter lists and forbid ungranted assets and asset creation", () => fixture(async db => {
  const external = await route("app/api/integrations/v1/media/route.ts"), item = await route("app/api/integrations/v1/media/[id]/route.ts");
  const writer = bearer(db, ["media:write"]);
  const first = await (await external.POST(new NextRequest("http://localhost/api/integrations/v1/media", { method: "POST", headers: { ...writer, "idempotency-key": "grant-create-1" }, body: await form() }))).json();
  const second = await (await external.POST(new NextRequest("http://localhost/api/integrations/v1/media", { method: "POST", headers: { ...writer, "idempotency-key": "grant-create-2" }, body: await form() }))).json();
  const c = createClient(db, { name: "one asset", scopes: ["media:read", "media:write"], resources: ["media"], resourceIds: { media: [first.id] } });
  const headers = { authorization: `Bearer ${issueToken(db, { clientId: c.client.id, clientSecret: c.clientSecret }).accessToken}` };
  const listed = await (await external.GET(new NextRequest("http://localhost/api/integrations/v1/media", { headers }))).json(); assert.deepEqual(listed.items.map((x: { id: string }) => x.id), [first.id]);
  assert.equal((await item.GET(new NextRequest(`http://localhost/api/integrations/v1/media/${second.id}`, { headers }), params(second.id))).status, 403);
  assert.equal((await external.POST(new NextRequest("http://localhost/api/integrations/v1/media", { method: "POST", headers: { ...headers, "idempotency-key": "grant-create-deny" }, body: await form() }))).status, 403);
}));
test("W3 admin GET issues signed CSRF cookie on path / and malformed uploads never produce success", () => fixture(async (_db, headers) => {
  const admin = await route("app/api/admin/media/route.ts");
  const response = await admin.GET(new NextRequest("http://localhost/api/admin/media", { headers }));
  assert.match(response.headers.get("set-cookie") || "", /huanyin_admin_csrf=/); assert.match(response.headers.get("set-cookie") || "", /Path=\//);
  for (const [type, name, expected] of [["image/svg+xml", "bad.svg", 415], ["image/png", "bad.png", 400]] as const) {
    const data = new FormData(); data.set("file", new File(["<svg><script>evil()</script></svg>"], name, { type }));
    const result = await admin.POST(new NextRequest("http://localhost/api/admin/media", { method: "POST", headers: { ...headers, "idempotency-key": `reject-${name}` }, body: data })); assert.equal(result.status, expected);
  }
}));
