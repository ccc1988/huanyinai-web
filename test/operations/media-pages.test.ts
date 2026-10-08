import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { openOperationsDb, resetOperationsDb } from "../../lib/operations/db.ts";
import { saveMedia, listMedia } from "../../lib/operations/media.ts";
import sharp from "sharp";
import { listRecords, RESOURCE_FILES } from "../../lib/operations/content.ts";

test("rejects SVG and stores fully decoded PNG outside release data", async () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "hy-media-")); const db = openOperationsDb(dir);
  try {
    await assert.rejects(() => saveMedia(db, { filename: "x.svg", mime: "image/svg+xml", bytes: Buffer.from("<svg><script>alert(1)</script></svg>"), actorId: "cli", idempotencyKey: "svg-key" }), /unsupported_media_type/);
    const bytes = await sharp({ create: { width: 1, height: 1, channels: 3, background: "red" } }).png().toBuffer();
    const result = await saveMedia(db, { filename: "pixel.png", mime: "image/png", bytes, actorId: "cli", idempotencyKey: "png-key" });
    assert.equal(result.status, "active"); assert.equal(listMedia(db).length, 1); assert.ok(fs.existsSync(path.join(dir, "media", result.id + ".v1.png")));
  } finally { resetOperationsDb(dir); fs.rmSync(dir, { recursive: true, force: true }); }
});

test("seeds structured pages without changing the legacy JSON resources", () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "hy-pages-"));
  // Current content initialization imports the complete isolated legacy fixture, not production data.
  for (const [resource, filename] of Object.entries(RESOURCE_FILES)) if (resource !== "pages") fs.writeFileSync(path.join(dir, filename), ["company", "settings"].includes(resource) ? "{}" : "[]");
  const db = openOperationsDb(dir);
  try { const pages = listRecords(db, "pages", { includeDraft: false }, dir); assert.ok(pages.some((page) => page.id === "home")); assert.equal(fs.existsSync(path.join(dir, "pages.json")), false); } finally { resetOperationsDb(dir); fs.rmSync(dir, { recursive: true, force: true }); }
});
