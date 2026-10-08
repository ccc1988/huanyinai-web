import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

test("OpenAPI contract declares the full operations surface", () => {
  const root = process.cwd(); const spec = JSON.parse(fs.readFileSync(path.join(root, "docs/api/full-site-operations.openapi.json"), "utf8"));
  assert.equal(spec.openapi, "3.1.0");
  for (const route of ["/oauth/token", "/resources", "/{resource}", "/{resource}/{id}", "/{resource}/{id}/publish", "/operations/{operationId}", "/analytics/summary", "/audit"]) assert.ok(spec.paths[route], `missing ${route}`);
  assert.deepEqual(spec.components.securitySchemes.bearerAuth, { type: "http", scheme: "bearer", bearerFormat: "opaque" });
  assert.ok(spec.components.parameters.IdempotencyKey); assert.ok(spec.components.parameters.IfMatch);
});
