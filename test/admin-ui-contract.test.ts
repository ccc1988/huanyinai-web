import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const source = (path: string) => fs.existsSync(path) ? fs.readFileSync(path, 'utf8') : '';
const shared = 'app/admin/_components/';
test('W4: all writes share CSRF and committed receipt enforcement', () => {
  const http = source(shared + 'admin-http.ts');
  assert.match(http, /X-CSRF-Token/);
  assert.match(http, /huanyin_admin_csrf/);
  assert.match(http, /status\s*!==\s*["']committed["']/);
  assert.match(http, /response\.status === 202/);
  assert.doesNotMatch(http, /localStorage|sessionStorage|console\.log/);
});
test('W4: editor defaults to labelled recursive fields, JSON is opt-in', () => {
  const editor = source(shared + 'resource-editor.tsx');
  assert.match(editor, /<label/); assert.match(editor, /<textarea/); assert.match(editor, /<input/);
  assert.match(editor, /Array\.isArray/); assert.match(editor, /Object\.entries/);
  assert.match(editor, /<details/); assert.match(editor, /高级 JSON/);
  assert.match(editor, /添加/); assert.match(editor, /移除/);
});
test('W4: content edit includes ETag, explicit workflow and revision selection', () => {
  const page = source('app/admin/content/page.tsx');
  for (const token of ['status=all', 'ResourceEditor', 'etag: selected.etag', '"patch"', '"submit"', '"approve"', '"publish"', '"unpublish"', '"archive"', '"restore"', '"rollback"', 'view=revisions', 'view=diff', 'publishedVersion', 'publicStatus', 'protected', 'password']) assert.ok(page.includes(token), token);
  assert.doesNotMatch(page, /revision:\s*1\b|隐式自批/);
  assert.match(page, /selected\.status === "approved"/);
});
test('W4: integrations edit full governance policy, secret/token revoke and one-time secret', () => {
  const page = source('app/admin/integrations/page.tsx');
  for (const token of ['expiresAt', 'scopes', 'resources', 'resourceIds', 'autoPublish', 'rateLimit', 'tokenMinutes', 'effectiveStatus', 'reminderDays', 'update', 'enable', 'disable', 'revoke', 'archive', 'rotate-secret', 'revoke-token', 'revoke-secret', 'password', 'setOneTimeSecret(null)', '续期合作']) assert.ok(page.includes(token), token);
  assert.doesNotMatch(page, /localStorage|sessionStorage/);
});
test('W4: media uses multipart upload, metadata and verified delete result', () => {
  const page = source('app/admin/media/page.tsx');
  for (const token of ['FormData', '"POST"', '"DELETE"', 'alt', 'description', 'adminJson', 'success', 'file']) assert.ok(page.includes(token), token);
  assert.doesNotMatch(page, /API 尚待接入/);
});
test('W4: recover requires password; audit never equates every action with success', () => {
  const page = source('app/admin/operations/page.tsx');
  assert.match(page, /action: "recover"/); assert.match(page, /password/);
  assert.match(page, /needs_recovery/);
  assert.doesNotMatch(source('app/admin/audit/page.tsx'), /includes\("failed"\) \? "failed" : "committed"/);
});
test('W4: layouts and common controls constrain intrinsic width, JSON wraps', () => {
  const component = source(shared + 'operations-admin.tsx');
  assert.match(component, /min-w-0/); assert.match(component, /w-full/); assert.match(component, /break-words/);
  assert.match(source(shared + 'resource-editor.tsx'), /min-w-0/);
  for (const page of ['integrations', 'content', 'media', 'audit', 'operations']) assert.doesNotMatch(source(`app/admin/${page}/page.tsx`), /minmax\((320|360)px| min-w-\[(220|320)px\]/);
});

test('W4: media contract uses per-asset delete/restore/metadata/replace and nested receipt', () => {
  const page = source('app/admin/media/page.tsx');
  for (const token of ['receipt', 'publicReferenceCount', '"PATCH"', '"PUT"', '/restore', '/api/admin/media/${encodeURIComponent(', 'status=all']) assert.ok(page.includes(token), token);
  assert.doesNotMatch(page, /jsonRequest\("DELETE"/);
});
