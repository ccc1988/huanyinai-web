import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
// The portable SDK is intentionally plain JavaScript for consumers without a TS build.
// @ts-ignore
import { SiteOperationsClient } from '../../sdk/site-operations.mjs';
const spec = JSON.parse(fs.readFileSync('docs/api/full-site-operations.openapi.json', 'utf8'));
const token = () => Response.json({access_token:'fixture-token',token_type:'Bearer',expires_in:1800});

test('OpenAPI selects concrete strict create/patch schemas for every resource', () => {
 for (const resource of ['blog-posts','cases','industries','company','customers','capabilities','stats','contacts','settings','pages']) {
  const create = spec.paths['/'+resource].post.requestBody.content['application/json'].schema;
  assert.equal(create.$ref, '#/components/schemas/'+resource);
  const patch = spec.components.schemas[resource+'Patch'];
  assert.equal(patch.additionalProperties, false);
  assert.deepEqual(patch.required ?? [], []);
  if(patch.properties.slug) assert.match(patch.properties.slug.description,/Immutable/);
  if(patch.properties.pageKey) assert.match(patch.properties.pageKey.description,/Immutable/);
  assert.equal(spec.paths['/'+resource+'/{id}'].patch.parameters.some((p:any)=>p.name==='If-Match'&&p.required),true);
 }
});
test('OpenAPI models actual directory and operation failures rather than placeholder JSON', () => {
 assert.ok(spec.components.schemas.Directory.required.includes('resources'));
 assert.ok(spec.components.schemas.Directory.properties.resources.items.properties.fields);
 const response=spec.paths['/blog-posts'].post.responses['503'].content['application/json'].schema;
 assert.ok(response.oneOf.some((s:any)=>s.$ref==='#/components/schemas/Operation'));
 assert.ok(spec.components.schemas['blog-posts'].properties.sections.items.required.includes('body'));
});
test('SDK preserves failed receipt, request ID and retry timing on HTTP error', async () => {
 const client=new SiteOperationsClient({baseUrl:'https://example.com/api/integrations/v1',clientId:'fixture',clientSecret:'fixture',fetchImpl:async (input:RequestInfo|URL)=>String(input).endsWith('/oauth/token')?token():Response.json({operationId:'op-test',status:'needs_recovery',errorCode:'projection_failed'},{status:503,headers:{'X-Request-Id':'req-test','Retry-After':'60'}})});
 await assert.rejects(()=>client.create('blog-posts',{},'fixture-key'),(e:any)=>e.status===503&&e.operationId==='op-test'&&e.operationStatus==='needs_recovery'&&e.requestId==='req-test'&&e.retryAfter==='60'&&e.code==='projection_failed');
});
test('SDK rejects normalized traversal before transmitting credentials', async () => {
 let calls=0;
 const client=new SiteOperationsClient({baseUrl:'https://example.com/api/integrations/v1',clientId:'fixture',clientSecret:'fixture',fetchImpl:async()=>{calls++;return token();}});
 for(const path of ['/../admin','/%2e%2e/admin','/blog-posts/../../admin','/blog-posts\\..\\admin','//example.org/x']) await assert.rejects(()=>client.request(path));
 assert.equal(calls,0);
});
test('SDK coalesces concurrent token acquisition and does not replay mutations', async () => {
 let grants=0,writes=0;
 const client=new SiteOperationsClient({baseUrl:'https://example.com/api/integrations/v1',clientId:'fixture',clientSecret:'fixture',fetchImpl:async (input:RequestInfo|URL,options:any)=>{const url=String(input);if(url.endsWith('/oauth/token')){grants++;await new Promise(resolve=>setTimeout(resolve,5));return token();}if(options.method==='POST'){writes++;return Response.json({error:'invalid_token',requestId:'req-auth'},{status:401});}return Response.json({items:[]});}});
 await Promise.all([client.list('blog-posts'),client.list('cases')]);
 assert.equal(grants,1);
 await assert.rejects(()=>client.create('blog-posts',{},'fixture-key'),(e:any)=>e.status===401);
 assert.equal(writes,1);
 await client.list('cases');assert.equal(grants,2);
});

test('media mutations declare the separate mandatory runtime idempotency rule', () => {
 for(const [path,method] of [['/media','post'],['/media/{id}','put'],['/media/{id}','patch'],['/media/{id}','delete'],['/media/{id}/restore','post']]) {
  const parameter=spec.paths[path][method].parameters.find((p:any)=>p.name==='Idempotency-Key');
  assert.equal(parameter.required,true);assert.equal(parameter.schema.minLength,1);assert.equal(parameter.schema.maxLength,200);
  assert.equal(new RegExp(parameter.schema.pattern).test('media-key-1'),true);
  assert.equal(new RegExp(parameter.schema.pattern).test('bad\nkey'),false);
 }
});
test('SDK preserves ordinary field and ETag error details', async () => {
 for(const [status,code,details] of [[400,'unknown_field',{resource:'blog-posts',fields:['typo']}],[412,'etag_mismatch',{etag:'current-etag'}]]) {
  const client=new SiteOperationsClient({baseUrl:'https://example.com/api/integrations/v1',clientId:'fixture',clientSecret:'fixture',fetchImpl:async (input:RequestInfo|URL)=>String(input).endsWith('/oauth/token')?token():Response.json({error:code,requestId:'req-detail',details},{status:status as number})});
  await assert.rejects(()=>client.patch('blog-posts','fixture',{title:'test'},'old-etag','fixture-key'),(e:any)=>{assert.deepEqual(e.details,details);return e.code===code&&e.status===status;});
 }
});
