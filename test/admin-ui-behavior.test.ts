import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const root = '../app/admin/_components/';
test('transport bootstraps CSRF and rejects uncommitted 200/202 writes, invalid JSON and HTTP failures', async () => {
  assert.ok(fs.existsSync('app/admin/_components/admin-http.ts'), 'transport missing');
  const { adminJson } = await import(root + 'admin-http.ts');
  const original = globalThis.fetch; const calls: { url: string; init?: RequestInit }[] = [];
  let next = new Response(JSON.stringify({ operationId: 'op-test', status: 'committed' }), { status: 202 });
  globalThis.fetch = async (input, init) => { calls.push({ url: String(input), init }); return String(input).endsWith('/integrations') && (!init?.method || init.method === 'GET') ? new Response('{"clients":[]}', { headers: { 'X-CSRF-Token': 'test-csrf' } }) : next; };
  try {
    const receipt = await adminJson('/api/admin/content', { method: 'PUT', body: '{}' });
    assert.equal(receipt.status, 'committed'); assert.equal(calls[0].url, '/api/admin/integrations');
    assert.equal(new Headers(calls[1].init?.headers).get('X-CSRF-Token'), 'test-csrf'); assert.equal(calls[1].init?.credentials, 'same-origin');
    for (const status of ['failed', 'pending', 'needs_recovery']) for (const code of [200, 202]) { next = new Response(JSON.stringify({ status, operationId: 'op-test' }), { status: code }); await assert.rejects(() => adminJson('/api/admin/content', { method: 'PUT' }), /op-test/); }
    next = new Response('{}', { status: 202 }); await assert.rejects(() => adminJson('/api/admin/content', { method: 'POST' }), /未确认/);
    next = new Response('not json', { status: 200 }); await assert.rejects(() => adminJson('/api/admin/content', { method: 'POST' }), /无效 JSON/);
    next = new Response('{"error":"etag_mismatch"}', { status: 412 }); await assert.rejects(() => adminJson('/api/admin/content', { method: 'PUT' }), /未覆盖/);
    next = new Response('{"success":false}', { status: 200 }); await assert.rejects(() => adminJson('/api/admin/media', { method: 'DELETE' }));
    next = new Response('{"items":[{"status":"failed"}]}', { status: 200 }); assert.deepEqual(await adminJson('/api/admin/operations'), { items: [{ status: 'failed' }] });
    next = new Response('{"id":"client-test","name":"test","scopes":["content:read"],"status":"active"}', { status: 200 }); assert.deepEqual(await adminJson('/api/admin/integrations', { method: 'PUT' }), { id: 'client-test', name: 'test', scopes: ['content:read'], status: 'active' });
    for (const result of [
      { id: 'media-test', status: 'active', url: '/media/test.png' },
      { id: 'media-test', status: 'active', url: '/media/test.png', operationId: 'op-asset' },
      { id: 'media-test', status: 'active', url: '/media/test.png', operationId: 'op-asset', receipt: { operationId: 'op-asset', status: 'committed' } },
      { id: 'media-test', status: 'deleted', receipt: { operationId: 'op-delete', status: 'committed' } },
    ]) { next = new Response(JSON.stringify(result), { status: 201 }); assert.deepEqual(await adminJson('/api/admin/media', { method: 'POST' }), result); }
    for (const status of ['failed', 'pending', 'needs_recovery']) { next = new Response(JSON.stringify({ id: 'media-test', status: 'active', receipt: { operationId: 'op-nested', status } }), { status: 201 }); await assert.rejects(() => adminJson('/api/admin/media', { method: 'POST' }), /op-nested/); }
    for (const code of ['recent_auth_required', 'owner_review_required', 'approval_required']) { next = new Response(JSON.stringify({ error: code }), { status: 403 }); await assert.rejects(() => adminJson('/api/admin/content', { method: 'PUT' }), /近期复核|批准/); }
    next = new Response('{"success":true}', { status: 200 }); await adminJson('/api/admin/media', { method: 'DELETE' }); assert.equal(new Headers(calls.at(-1)?.init?.headers).get('X-CSRF-Token'), 'test-csrf');
  } finally { globalThis.fetch = original; }
});
test('resource defaults and nested list construction preserve types and no aliasing', async () => {
  assert.ok(fs.existsSync('app/admin/_components/resource-model.ts'), 'field model missing');
  const { newResourceData, emptyListItem, parseResourceJson } = await import(root + 'resource-model.ts');
  const first = newResourceData('blog-posts'), second = newResourceData('blog-posts');
  (first.sections as unknown[]).push({ heading: 'x', body: 'y' }); assert.deepEqual(second.sections, []);
  assert.deepEqual(emptyListItem('sections'), { heading: '', body: '' });
  assert.deepEqual(emptyListItem('blocks'), { id: '', type: 'richText', enabled: true, order: 10, props: { title: '', description: '' } });
  assert.deepEqual(emptyListItem('rows', { n: 2, ok: true, values: [1], child: { title: 'x' } }), { n: 0, ok: false, values: [], child: { title: '' } });
  assert.equal(typeof newResourceData('stats').value, 'number');
  for (const bad of ['[]', 'null', '"text"', '{']) assert.throws(() => parseResourceJson(bad));
});
