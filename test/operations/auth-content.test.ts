import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { createClient, issueToken, authenticateBearer, requireScope, disableClient, rotateSecret } from "../../lib/operations/auth.ts";
import { openOperationsDb, resetOperationsDb } from "../../lib/operations/db.ts";
import { createDraft, getRecord, listRecords, patchDraft, transition } from "../../lib/operations/content.ts";

test("issues opaque token with requested scope subset and rejects expansion", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "hy-auth-")); const db = openOperationsDb(dir);
  try {
    const created = createClient(db, { name: "test-operator", scopes: ["content:read", "content:write"] });
    assert.match(created.clientSecret, /^hysec_/);
    const issued = issueToken(db, { clientId: created.client.id, clientSecret: created.clientSecret, requestedScopes: ["content:read"], minutes: 15 });
    assert.match(issued.accessToken, /^hytok_/); assert.ok(issued.expiresIn <= 900 && issued.expiresIn >= 898); assert.equal(issued.scope, "content:read");
    const context = authenticateBearer(db, issued.accessToken, "req-test"); assert.deepEqual(context.scopes, ["content:read"]); assert.throws(() => requireScope(context, "content:write"), /insufficient_scope/);
    assert.throws(() => issueToken(db, { clientId: created.client.id, clientSecret: created.clientSecret, requestedScopes: ["admin:protected"] }), /invalid_scope/);
  } finally { resetOperationsDb(dir); fs.rmSync(dir, { recursive: true, force: true }); }
});

test("revocation and rotation invalidate old credentials", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "hy-auth-")); const db = openOperationsDb(dir);
  try {
    const created = createClient(db, { name: "rotate-me", scopes: ["content:read"] });
    const first = issueToken(db, { clientId: created.client.id, clientSecret: created.clientSecret });
    const rotated = rotateSecret(db, created.client.id, 1); assert.match(rotated.clientSecret, /^hysec_/);
    assert.throws(() => issueToken(db, { clientId: created.client.id, clientSecret: created.clientSecret }), /invalid_client/);
    const second = issueToken(db, { clientId: created.client.id, clientSecret: rotated.clientSecret }); assert.ok(second.accessToken);
    disableClient(db, created.client.id); assert.throws(() => authenticateBearer(db, first.accessToken, "req"), /invalid_token/); assert.throws(() => authenticateBearer(db, second.accessToken, "req"), /invalid_token/);
  } finally { resetOperationsDb(dir); fs.rmSync(dir, { recursive: true, force: true }); }
});

test("draft editing is isolated from published JSON until publish", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "hy-content-")); fs.cpSync(path.join(process.cwd(), "data"), dir, { recursive: true }); fs.writeFileSync(path.join(dir, "blog-posts.json"), "[]\n"); const db = openOperationsDb(dir); const actor = { type: "admin" as const, id: "session" };
  try {
    const draft = createDraft(db, "blog-posts", { slug: "draft-post", title: "Draft", excerpt: "E", category: "C", date: "2026-10-08", author: "A", tags: [], sections: [], reviewStatus: "reviewed", sources: [{title: "Fixture source", url: "https://example.com/", accessedAt: "2026-10-08"}], reviewer: "fixture", reviewedAt: "2026-10-08" }, actor, "idem-0001", dir);
    assert.equal(draft.status, "committed"); assert.equal(listRecords(db, "blog-posts", { includeDraft: false }, dir).length, 0); assert.equal(listRecords(db, "blog-posts", { includeDraft: true }, dir)[0].status, "draft");
    const record = getRecord(db, "blog-posts", "draft-post", dir)!; const patched = patchDraft(db, "blog-posts", "draft-post", { title: "Changed" }, actor, record.etag, "idem-0002", dir); assert.equal(patched.status, "committed");
    assert.throws(() => patchDraft(db, "blog-posts", "draft-post", { title: "Conflict" }, actor, record.etag, "idem-0003", dir), /etag_mismatch/);
    transition(db, "blog-posts", "draft-post", "submit", actor, {}, "idem-0004", dir); transition(db, "blog-posts", "draft-post", "approve", actor, {}, "idem-0005", dir); const published = transition(db, "blog-posts", "draft-post", "publish", actor, {}, "idem-0006", dir); assert.equal(published.status, "committed");
    const file = JSON.parse(fs.readFileSync(path.join(dir, "blog-posts.json"), "utf8")); assert.equal(file[0].title, "Changed"); assert.equal(listRecords(db, "blog-posts", { includeDraft: false }, dir)[0].status, "published");
  } finally { resetOperationsDb(dir); fs.rmSync(dir, { recursive: true, force: true }); }
});
