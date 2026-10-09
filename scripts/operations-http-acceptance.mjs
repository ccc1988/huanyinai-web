import fs from 'node:fs';import path from 'node:path';import os from 'node:os';import {spawn,spawnSync} from 'node:child_process';import assert from 'node:assert/strict';import {createHash} from 'node:crypto';
import {SiteOperationsClient} from '../sdk/site-operations.mjs';
const root=process.cwd(),dataDir=fs.mkdtempSync(path.join(os.tmpdir(),'hy-http-'));fs.cpSync(path.join(root,'data'),dataDir,{recursive:true});
const log=fs.openSync('/tmp/hy-http-server.log','w'),child=spawn(process.execPath,['.next/standalone/server.js'],{cwd:root,env:{...process.env,HOSTNAME:'127.0.0.1',PORT:'18501',DATA_DIR:dataDir,MEDIA_DIR:path.join(dataDir,'media'),OPERATIONS_API_ENABLED:'true',ADMIN_SESSION_SECRET:'fixture-only-session-verification-20261008',ADMIN_PASSWORD:'fixture-only-admin-20261008'},stdio:['ignore',log,log],detached:true});child.unref();
const base='http://127.0.0.1:18501',headers={};let cookie='',csrf='';const evidence=[];
async function req(url,{method='GET',body,extra={},expected=200}={}){const r=await fetch(base+url,{method,headers:{...headers,...(cookie?{cookie}:{}),...(method!=='GET'?{'X-CSRF-Token':csrf}:{}),...(body!==undefined?{'Content-Type':'application/json'}:{}),...extra},body:body===undefined?undefined:JSON.stringify(body)}),d=await r.json();if(r.headers.get('set-cookie'))cookie=(cookie?cookie+'; ':'')+r.headers.getSetCookie().map(x=>x.split(';')[0]).join('; ');if(r.headers.get('X-CSRF-Token'))csrf=r.headers.get('X-CSRF-Token');assert.equal(r.status,expected,JSON.stringify({url,status:r.status,data:d}));return {r,d};}
try{
 for(let i=0;i<60;i++){try{const r=await fetch(base+'/health');if(r.ok)break;}catch{}await new Promise(r=>setTimeout(r,250));}
 const initial=fs.readFileSync(path.join(dataDir,'stats.json'),'utf8');
 await req('/api/admin/integrations',{expected:401});await req('/api/auth/login',{method:'POST',body:{password:'fixture-only-admin-20261008'}});await req('/api/admin/integrations');
 await req('/api/admin/integrations',{method:'POST',body:{name:'blocked',scopes:['content:read']},extra:{'X-CSRF-Token':'wrong'},expected:403});
 const {d:created}=await req('/api/admin/integrations',{method:'POST',expected:201,body:{name:'HTTP fixture operator',password:'fixture-only-admin-20261008',scopes:['content:read','content:write','content:publish','media:read','media:write','analytics:read'],autoPublish:true}});
 const client=new SiteOperationsClient({baseUrl:base+'/api/integrations/v1',clientId:created.client.id,clientSecret:created.clientSecret,allowLocalhost:true});
 const directory=await client.request('/resources');assert.equal(directory.resources.length,10);for(const r of directory.resources){const result=await client.list(r.name,{limit:'2'});assert.ok(Array.isArray(result.items));evidence.push('list:'+r.name);}
 // Run the actual third-party handover example against the isolated HTTP server.
 const sample=spawnSync(process.execPath,['sdk/example-draft.mjs'],{cwd:root,env:{...process.env,SITE_API_BASE_URL:base+'/api/integrations/v1',SITE_API_CLIENT_ID:created.client.id,SITE_API_CLIENT_SECRET:created.clientSecret,SITE_API_LOCAL_TEST:'true',SITE_API_DRAFT_SLUG:'provider-example-draft',SITE_API_IDEMPOTENCY_KEY:'provider-example-key-001'},encoding:'utf8',timeout:15000});
 assert.equal(sample.status,0,'provider draft example failed');const sampleReceipt=JSON.parse(sample.stdout.trim());assert.equal(sampleReceipt.status,'committed');assert.equal((await client.receipt(sampleReceipt.operationId)).status,'committed');
 const sampleRecord=await client.get('blog-posts',sampleReceipt.resourceId);assert.equal(sampleRecord.status,'draft');assert.equal((await fetch(base+'/blog/'+sampleReceipt.resourceId)).status,404);evidence.push('provider-example:real-sdk-draft-receipt-public-isolation');
 await client.action('blog-posts',sampleReceipt.resourceId,'submit',{},'provider-example-submit-001');await assert.rejects(()=>client.action('blog-posts',sampleReceipt.resourceId,'approve'),e=>e.status===403);evidence.push('provider-example:third-party-approve-denied');
 await client.action('blog-posts',sampleReceipt.resourceId,'archive',{},'provider-example-archive-001');
 const post={slug:'http-governance-fixture',title:'HTTP receipt test',excerpt:'Fixture',category:'Fixture',date:'2026-10-08',author:'Fixture',tags:[],sections:[{heading:'Fixture',body:'Test acceptance only'}],reviewStatus:'reviewed',sources:[{title:'Fixture',url:'https://example.com/',accessedAt:'2026-10-08'}],reviewer:'Fixture',reviewedAt:'2026-10-08'};
 const create=await client.create('blog-posts',post,'http-create-fixture-001');assert.equal(create.status,'committed');assert.equal((await client.create('blog-posts',post,'http-create-fixture-001')).operationId,create.operationId);
 const rec=await client.get('blog-posts',post.slug);await assert.rejects(()=>client.patch('blog-posts',post.slug,{title:'No etag'},undefined,'http-patch-fixture-noetag'),e=>e.status===428);
 await client.patch('blog-posts',post.slug,{title:'Changed by API'},rec.etag,'http-patch-fixture-001');await assert.rejects(()=>client.patch('blog-posts',post.slug,{title:'Stale'},rec.etag,'http-patch-fixture-002'),e=>e.status===412);
 const pub=await client.action('blog-posts',post.slug,'publish',{},'http-publish-fixture-001');assert.equal(pub.status,'committed');const page=await fetch(base+'/blog/'+post.slug);assert.equal(page.status,200);assert.ok((await page.text()).includes('Changed by API'));evidence.push('blog:real-publish-page-receipt');
 await client.action('blog-posts',post.slug,'unpublish');assert.equal((await fetch(base+'/blog/'+post.slug)).status,404);evidence.push('blog:real-unpublish');
 await assert.rejects(()=>client.request('/audit'),e=>e.status===403);await assert.rejects(()=>client.request('/submissions'),e=>e.status===403);evidence.push('sensitive-scopes-denied');
 // Full resource lifecycle through the same admin service: draft isolation, review, publish, restore original.
 for(const resource of ['blog-posts','cases','industries','company','customers','capabilities','stats','contacts','settings','pages']){
  const listed=await req('/api/admin/content?resource='+resource+'&status=all'),row=listed.d.items.find(x=>x.publicStatus==='published');assert.ok(row,resource);
  const original=structuredClone(row.data),changed=structuredClone(original);
  const field={ 'blog-posts':'title',cases:'title',industries:'subtitle',company:'description',customers:'name',capabilities:'scenarios',stats:'label',contacts:'role',settings:'seoDescription'}[resource];
  if(resource==='pages')changed.blocks.find(x=>x.id==='home-hero').props.titlePrimary+=' [fixture]';else changed[field]+=' [fixture]';
  if(resource==='blog-posts'){changed.reviewStatus='reviewed';changed.sources=[{title:'Fixture source',url:'https://example.com/',accessedAt:'2026-10-08'}];changed.reviewer='Fixture';changed.reviewedAt='2026-10-08';}
  const filename=path.join(dataDir,resource+'.json'); if(!fs.existsSync(filename))fs.writeFileSync(filename,JSON.stringify((await client.list(resource,{limit:'100'})).items.map(x=>x.data))); const before=JSON.parse(fs.readFileSync(filename,'utf8'));
  await req('/api/admin/content',{method:'PUT',expected:202,body:{resource,id:row.id,action:'patch',data:changed,etag:row.etag,password:'fixture-only-admin-20261008'}});
  assert.deepEqual(JSON.parse(fs.readFileSync(path.join(dataDir,resource+'.json'),'utf8')),before,'draft changed public '+resource);
  for(const action of ['submit','approve','publish'])await req('/api/admin/content',{method:'PUT',expected:202,body:{resource,id:row.id,action,password:'fixture-only-admin-20261008'}});
  await req('/api/admin/content',{method:'PUT',expected:202,body:{resource,id:row.id,action:'rollback',body:{revision:1},password:'fixture-only-admin-20261008'}});
  for(const action of ['submit','approve','publish'])await req('/api/admin/content',{method:'PUT',expected:202,body:{resource,id:row.id,action,password:'fixture-only-admin-20261008'}});
  assert.deepEqual(JSON.parse(fs.readFileSync(path.join(dataDir,resource+'.json'),'utf8')),before,'restore mismatch '+resource);evidence.push('lifecycle:'+resource);
 }
 await req('/api/admin/integrations',{method:'PUT',body:{action:'update',clientId:created.client.id,scopes:['content:read'],password:'fixture-only-admin-20261008'}});await assert.rejects(()=>client.create('blog-posts',{...post,slug:'scope-shrink'},'http-scope-shrink'),e=>e.status===403);evidence.push('scope-shrink:issued-token-rejected');
 await req('/api/admin/integrations',{method:'PUT',body:{action:'disable',clientId:created.client.id}});await assert.rejects(()=>client.request('/resources'),e=>e.status===401);evidence.push('disable:issued-token-rejected');
 assert.deepEqual(JSON.parse(fs.readFileSync(path.join(dataDir,'stats.json'),'utf8')),JSON.parse(initial));evidence.push('stats:semantic-identical-after-restore');
 for(const page of ['/', '/about','/contact','/blog','/cases','/solutions','/solutions/ai-geo-aeo','/sitemap.xml','/llms.txt','/robots.txt'])assert.equal((await fetch(base+page)).status,200,page);evidence.push('public-pages:10-http-200');
 for(const p of ['integrations','content','media','audit','operations'])assert.equal((await fetch(base+'/admin/'+p,{headers:{cookie}})).status,200,p);evidence.push('admin-pages:5-http-200');
 console.log(JSON.stringify({status:'passed',checks:evidence.length,evidence,statsUnchanged:true}));
 if(process.env.KEEP_HTTP_SERVER==='true'){fs.writeFileSync('/tmp/hy-api-acceptance-state.json',JSON.stringify({pid:child.pid,dataDir,port:18501}),{mode:0o600});}else{process.kill(child.pid);fs.rmSync(dataDir,{recursive:true,force:true});}
}catch(e){try{process.kill(child.pid);}catch{}fs.rmSync(dataDir,{recursive:true,force:true});throw e;}
