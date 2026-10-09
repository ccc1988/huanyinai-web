import {RESOURCE_SCHEMAS} from '../lib/operations/schema.ts';
import fs from 'node:fs';
import {PAGE_FIELDS,PAGE_TEMPLATE_ORDER} from '../lib/content/pageFields.ts';
const resources=['blog-posts','cases','industries','company','customers','capabilities','stats','contacts','settings','pages'];
const schema=(ref)=>({$ref:'#/components/schemas/'+ref});
const response=(ref,description=ref)=>({description,content:{'application/json':{schema:schema(ref)}}});
const responses=(success='Record',code='200')=>({[code]:response(success),'400':response('Error'),'401':response('Error'),'403':response('Error'),'404':response('Error'),'409':response('Error'),'412':response('Error'),'428':response('Error'),'429':response('Error'),'503':response('Error')});
const params=[{name:'resource',in:'path',required:true,schema:{type:'string',enum:resources}},{name:'id',in:'path',required:true,schema:{type:'string'}}];
const idem={name:'Idempotency-Key',in:'header',schema:{type:'string',minLength:8,maxLength:128}},etag={name:'If-Match',in:'header',required:true,schema:{type:'string'}};
const body=(ref)=>({required:true,content:{'application/json':{schema:schema(ref)}}});
const token={post:{security:[],summary:'OAuth client credentials (HTTP Basic preferred; form credentials supported)',requestBody:{required:true,content:{'application/x-www-form-urlencoded':{schema:{type:'object',required:['grant_type'],properties:{grant_type:{const:'client_credentials'},scope:{type:'string'},client_id:{type:'string'},client_secret:{type:'string',writeOnly:true}}}}}},responses:responses('Token')}};
const spec={openapi:'3.1.0',info:{title:'Huanyin governed full-site operations',version:'1.8.0',description:'Public snapshots and working revisions are separate. All content domains share lifecycle/receipts. Credentials never grant admin or protected-field approval. Ordinary automatic publishing requires an explicit admin autoPublish grant. First-party metrics do not prove indexing or AI citations.'},servers:[{url:'https://huanyinai.com/api/integrations/v1'}],security:[{bearerAuth:[]}],paths:{'/oauth/token':token,'/resources':{get:{responses:responses('Directory')}},'/{resource}':{get:{parameters:[params[0],...['status','q','sort','cursor'].map(name=>({name,in:'query',schema:{type:'string'}})),{name:'limit',in:'query',schema:{type:'integer',minimum:1,maximum:100}}],responses:responses('List')},post:{parameters:[params[0],idem],requestBody:body('ResourceData'),responses:responses('Operation','202')}},'/{resource}/{id}':{get:{parameters:params,responses:responses()},patch:{parameters:[...params,etag,idem],requestBody:body('ResourcePatch'),responses:responses('Operation','202')}},'/operations/{operationId}':{get:{summary:'Own durable receipt only',parameters:[{name:'operationId',in:'path',required:true,schema:{type:'string'}}],responses:responses('Operation')}},'/analytics/summary':{get:{summary:'First-party aggregate metrics and own operations; scope analytics:read',parameters:['from','to'].map(name=>({name,in:'query',schema:{type:'string',format:'date'}})),responses:responses('Analytics')}},'/submissions':{get:{summary:'Sensitive lead access: disabled by default; separate scope submissions:read and resource grant',responses:responses('Leads')}},'/audit':{get:{summary:'Administrator-only; external bearer tokens always rejected',responses:{'403':response('Error')}}},'/media':{get:{responses:responses('MediaList')},post:{parameters:[idem],requestBody:{required:true,content:{'multipart/form-data':{schema:{type:'object',required:['file'],properties:{file:{type:'string',format:'binary'},alt:{type:'string'},description:{type:'string'}}}}}},responses:responses('Media','201')}}},components:{securitySchemes:{bearerAuth:{type:'http',scheme:'bearer',bearerFormat:'opaque'}},schemas:{}}};
const sc=spec.components.schemas;
sc.Token={type:'object',required:['access_token','token_type','expires_in','scope'],properties:{access_token:{type:'string',writeOnly:true},token_type:{const:'Bearer'},expires_in:{type:'integer',minimum:0},scope:{type:'string'}}};
sc.ResourceData={type:'object',description:'Strict resource-specific schema; unknown fields rejected. See GET resources and docs/operations-api.md field table.',additionalProperties:true};sc.ResourcePatch={...sc.ResourceData,description:'Partial data fields for chosen resource. Immutable slug/pageKey rejected; required If-Match and per-resource scope.'};
sc.Record={type:'object',required:['id','resource','status','version','etag','data','publicStatus'],properties:{id:{type:'string'},resource:{enum:resources},status:{enum:['draft','submitted','approved','published','unpublished','archived']},publicStatus:{enum:['published','unpublished']},version:{type:'integer'},publishedVersion:{type:['integer','null']},etag:{type:'string'},data:schema('ResourceData'),protected:{type:'boolean'},updatedAt:{type:'string',format:'date-time'}}};
sc.List={type:'object',required:['items','hasMore','nextCursor'],properties:{items:{type:'array',items:schema('Record')},hasMore:{type:'boolean'},nextCursor:{type:['string','null']}}};
sc.Operation={type:'object',required:['operationId','resource','resourceId','action','status','createdAt'],properties:{operationId:{type:'string'},resource:{type:'string'},resourceId:{type:'string'},action:{type:'string'},status:{enum:['pending','committed','failed','needs_recovery']},beforeHash:{type:['string','null']},afterHash:{type:['string','null']},errorCode:{type:['string','null']},createdAt:{type:'string',format:'date-time'},completedAt:{type:['string','null']}}};
sc.Error={type:'object',required:['error','message','requestId'],properties:{error:{type:'string'},message:{type:'string'},requestId:{type:'string'},details:{}}};
for(const n of ['Directory','Analytics','Leads','RevisionList','Diff','Media','MediaList'])sc[n]={type:'object',description:n+' governed JSON response'};
for(const action of ['submit','approve','publish','unpublish','archive','restore','rollback'])spec.paths['/{resource}/{id}/'+action]={post:{summary:action==='approve'?'Administrator reviewer required; bearer tokens denied':action==='publish'?'Publish approved revision or explicit ordinary autoPublish grant; protected data always requires owner':action,parameters:[...params,idem],requestBody:body('ActionBody'),responses:responses('Operation','202')}};
sc.ActionBody={type:'object',additionalProperties:false,properties:{revision:{type:'integer',minimum:1},position:{type:'integer',minimum:0},reason:{type:'string',maxLength:500}}};
for(const view of ['revisions','diff'])spec.paths['/{resource}/{id}/'+view]={get:{parameters:[...params,...(view==='diff'?['from','to'].map(name=>({name,in:'query',schema:{type:'integer',minimum:1}})):[])],responses:responses(view==='diff'?'Diff':'RevisionList')}};
for(const action of ['replace','metadata','delete','restore'])spec.paths['/media/{id}/'+action]={post:{parameters:[params[1],idem],responses:responses('Media')}};
// Retain explicit parameter component names for client contract tooling.
spec.components.parameters={IdempotencyKey:idem,IfMatch:etag};
for(const [r,fields] of Object.entries(RESOURCE_SCHEMAS)){const properties={},required=[];for(const [key,rule] of Object.entries(fields)){const t=rule[0];properties[key]=t==='s'?{type:'string'}:t==='n'?{type:'number'}:t==='b'?{type:'boolean'}:t==='r'?{type:'object'}:{type:'array',items:t==='a'?{type:'string'}:{type:'object'}};if(!rule.endsWith('?'))required.push(key);}sc[r]={type:'object',additionalProperties:false,required,properties};}sc.ResourceData={oneOf:Object.keys(RESOURCE_SCHEMAS).map(schema),description:'Exact resource schema selected by resource path'};
// Actual media route contract: PUT replace, PATCH metadata, DELETE soft delete, POST restore.
delete spec.paths['/media/{id}/replace'];delete spec.paths['/media/{id}/metadata'];delete spec.paths['/media/{id}/delete'];
spec.paths['/media/{id}']={get:{parameters:[params[1]],responses:responses('Media')},put:{parameters:[params[1],idem],requestBody:spec.paths['/media'].post.requestBody,responses:responses('Media')},patch:{parameters:[params[1],idem],requestBody:{required:true,content:{'application/json':{schema:{type:'object',additionalProperties:false,properties:{alt:{type:'string',maxLength:500},description:{type:'string',maxLength:2000}}}}}},responses:responses('Media')},delete:{parameters:[params[1],idem],responses:responses('Media')}};
// Provider contract: concrete resource paths let clients choose the exact data schema.
// A generic oneOf alone is ambiguous when PATCH contains just one shared field.
const copy = value => structuredClone(value);
const object = properties => ({type:'object',additionalProperties:false,required:Object.keys(properties),properties});
sc.Directory = object({resources:{type:'array',items:object({name:{enum:resources},read:{type:'boolean'},write:{type:'boolean'},publish:{type:'boolean'},autoPublish:{type:'boolean'},protected:{type:'boolean'},fields:{type:'object',additionalProperties:{type:'string',pattern:'^[snbaro]\\??$'}}})},media:object({read:{type:'boolean'},write:{type:'boolean'}}),analytics:{type:'boolean'},submissions:{type:'boolean'}});
sc['blog-posts'].properties.slug.pattern = '^[a-z0-9]+(?:-[a-z0-9]+)*$';
for (const r of ['cases','industries']) sc[r].properties.slug.pattern = sc['blog-posts'].properties.slug.pattern;
sc['blog-posts'].properties.sections.items = object({heading:{type:'string'},body:{type:'string'}});
sc['blog-posts'].properties.sources.items = object({title:{type:'string'},url:{type:'string',format:'uri'},accessedAt:{type:'string',description:'Date.parse-compatible date or timestamp'}});
sc['blog-posts'].properties.reviewStatus.enum = ['draft','reviewed'];
sc.industries.properties.faq.items = object({q:{type:'string'},a:{type:'string'}});
sc.ResourcePatch = {type:'object',description:'Use the concrete resource endpoint for its exact patch schema. The server merges partial fields then validates the full document; slug/pageKey are immutable.'};
sc.Record.properties.position = {type:'integer'};
for (const r of resources) {
 sc[r+'Patch'] = copy(sc[r]); delete sc[r+'Patch'].required;
 delete sc[r+'Patch'].properties.slug; delete sc[r+'Patch'].properties.pageKey;
 sc[r+'Patch'].description = 'Partial top-level update. Nested arrays/objects replace that field, not a deep merge. Unknown and immutable fields are rejected; full merged record must satisfy runtime validation.';
 for (const [template, destination] of [['/{resource}','/'+r],['/{resource}/{id}','/'+r+'/{id}']]) {
  const item = copy(spec.paths[template]);
  for (const op of Object.values(item)) op.parameters = op.parameters.filter(p => p.name !== 'resource');
  if (item.post) item.post.requestBody = body(r);
  if (item.patch) item.patch.requestBody = body(r+'Patch');
  spec.paths[destination] = item;
 }
 for (const action of ['submit','publish','unpublish','archive','restore','rollback','revisions','diff']) {
  const item = copy(spec.paths['/{resource}/{id}/'+action]);
  for (const op of Object.values(item)) op.parameters = op.parameters.filter(p => p.name !== 'resource');
  spec.paths['/'+r+'/{id}/'+action] = item;
 }
}
// Failed writes return a durable receipt (not just the ordinary error envelope).
for (const item of Object.values(spec.paths)) for (const [method,op] of Object.entries(item)) {
 if (['post','patch'].includes(method) && op.responses?.['202']) op.responses['503'] = {description:'Service unavailable, or mutation receipt with failed/needs_recovery. Preserve operationId and query its receipt before retrying.',content:{'application/json':{schema:{oneOf:[schema('Error'),schema('Operation')]}}}};
 for (const code of Object.keys(op.responses ?? {})) {
  op.responses[code].headers = {'X-Request-Id':{schema:{type:'string'},description:'Correlation ID when supplied by this endpoint'}};
  if (code === '429') op.responses[code].headers['Retry-After'] = {schema:{type:'string'},description:'Seconds until retry; do not retry a mutation with a new idempotency key'};
 }
 if (op.requestBody?.content?.['application/json']?.schema?.$ref === '#/components/schemas/ActionBody') op.requestBody.required = false;
}
sc.Operation.description = 'Only committed is completed. pending requires polling; failed/needs_recovery require receipt inspection and administrator recovery. A receipt is not search indexing or AI visibility evidence.';
sc.ActionBody.description = 'rollback requires revision. Protected lifecycle actions remain subject to administrator verification.';
spec.paths['/{resource}/{id}/approve'].post.description = 'Documented denial boundary, not an integration capability. Third-party bearer credentials always receive 403.';
spec.info.version = '1.8.1';
spec.info.description += ' Concrete resource paths define strict create and partial PATCH contracts. Nested safety/template validation also applies; GET resources advertises top-level field rules.';
// Typed responses for all separate integration endpoints.
const str = {type:'string'}, integer = {type:'integer'};
sc.Media = object({id:str,filename:str,mime:{enum:['image/png','image/jpeg','image/webp']},bytes:integer,version:integer,status:str,url:str,width:integer,height:integer,alt:str,description:str,sha256:str,createdAt:str,updatedAt:str,deletedAt:{type:['string','null']},publicReferenceCount:integer});
sc.Media.properties.operationId = str; sc.Media.properties.receipt = schema('Operation');
sc.MediaList = object({items:{type:'array',items:schema('Media')}});
sc.Analytics = object({generatedAt:{type:'string',format:'date-time'},pages:{type:'array',items:object({path:str,contentType:str,visits:integer,engagedViews:integer,ctaClicks:integer,inquiries:integer,source:str})},operations:{type:'array',items:schema('Operation')},evidenceBoundary:str});
sc.Leads = object({items:{type:'array',items:{type:'object',additionalProperties:false,properties:Object.fromEntries(['id','name','company','phone','email','message','createdAt','status'].map(key=>[key,str]))}},hasMore:{type:'boolean'}});
sc.RevisionList = object({items:{type:'array',items:{type:'object',description:'Revision metadata and complete validated content snapshot; requires content:write.',additionalProperties:true}}});
sc.Diff = {type:'object',description:'Diff between working revisions, not proof of public publication. Requires content:write.',additionalProperties:true};
sc.settings.properties.navItems.items = object({label:str,href:str});
sc.settings.properties.aiSearchGrowth = object(Object.fromEntries(['eyebrow','title','description','flow','primaryCtaLabel','primaryCtaHref','secondaryCtaLabel','secondaryCtaHref'].map(key=>[key,key==='flow'?{type:'array',items:str,maxItems:5}:str])));
sc.industries.properties.servicePackages.items = {type:'object',required:['title','description','deliverables'],properties:{title:str,description:str,deliverables:{type:'array',items:str}}};
// Generate page/block allowlists from the same renderer field definitions used by runtime validation.
const sampleSchema = (sample, partial=false) => {
 if (typeof sample === 'string') return {type:'string',maxLength:12000};
 if (Array.isArray(sample)) return {type:'array',maxItems:100,items:sample.length?sampleSchema(sample[0]):{}};
 const properties=Object.fromEntries(Object.entries(sample).map(([key,value])=>[key,sampleSchema(value)]));
 return {type:'object',additionalProperties:false,properties,...(partial?{}:{required:Object.keys(properties)})};
};
const pageKeys=[...new Set(Object.values(PAGE_FIELDS).map(field=>field.pageKey))];
sc.pages.properties.pageKey.enum=pageKeys;
sc.pages.properties.seo={type:'object',additionalProperties:false,properties:{title:{type:'string',maxLength:300},description:{type:'string',maxLength:3000}},description:'home and site-chrome must use empty seo; their SEO is owned by settings.'};
sc.pages.properties.blocks={type:'array',maxItems:50,items:{oneOf:Object.entries(PAGE_FIELDS).map(([id,field])=>object({id:{const:id},type:{const:field.type},enabled:{type:'boolean'},order:{const:PAGE_TEMPLATE_ORDER[id]},props:sampleSchema(field.props,true)}))},description:'Blocks must belong to pageKey, have unique IDs, and stay in increasing fixed template order. Internal hrefs only; runtime also checks fixed row/service slot counts.'};
for(const r of resources){const existing=sc[r+'Patch'];sc[r+'Patch']={...copy(sc[r]),description:existing.description};delete sc[r+'Patch'].required;for(const name of ['slug','pageKey'])if(sc[r+'Patch'].properties[name])sc[r+'Patch'].properties[name].description='Immutable: omit this field, or send the unchanged value. Changing it returns 409 immutable_id.';}
// Avoid ambiguous generic endpoint schemas: finite resource paths are authoritative.
// Keep generic paths for v1 backward compatibility; concrete resource paths above provide strict schemas.
for(const item of Object.values(spec.paths))for(const op of Object.values(item))for(const code of ['413','415','500'])if(!op.responses[code])op.responses[code]=response('Error');
spec.components.securitySchemes.clientBasic={type:'http',scheme:'basic',description:'OAuth client ID and secret, individually form-URL-encoded before joining with colon.'};
// Form credentials remain supported without HTTP Basic; never send both forms of credentials.
spec.paths['/oauth/token'].post.security=[{clientBasic:[]},{}];

sc.RevisionList = object({items:{type:'array',items:object({revision:{type:'integer'},status:{enum:['draft','submitted','approved','published','unpublished','archived']},etag:{type:'string'},createdAt:{type:'string'},createdBy:{type:'string'},data:schema('ResourceData')})}});
sc.Diff = object({from:{type:'integer'},to:{type:'integer'},changes:{type:'array',items:{type:'object',additionalProperties:false,required:['path'],properties:{path:{type:'string'},before:{},after:{}}}}});
for(const item of Object.values(spec.paths))for(const op of Object.values(item)) {
 for(const parameter of op.parameters ?? [])if(parameter.name==='sort')parameter.description='updated-desc sorts by updatedAt descending; other values retain template position/id order.';
 if(op.responses?.['200']?.content?.['application/json']?.schema?.$ref==='#/components/schemas/Record')op.responses['200'].headers={...(op.responses['200'].headers??{}),ETag:{schema:{type:'string'},description:'Record hash for If-Match on a subsequent PATCH'}};
}

const mediaIdempotency={name:'Idempotency-Key',in:'header',required:true,schema:{type:'string',minLength:1,maxLength:200,pattern:'^[\\x21-\\x7e]+$'},description:'Mandatory for media writes; printable ASCII excluding space. Content writes use their separate 8–128-character rule.'};
for(const [path,method] of [['/media','post'],['/media/{id}','put'],['/media/{id}','patch'],['/media/{id}','delete'],['/media/{id}/restore','post']])spec.paths[path][method].parameters=spec.paths[path][method].parameters.map(parameter=>parameter.name==='Idempotency-Key'?mediaIdempotency:parameter);
spec.components.parameters.MediaIdempotencyKey=mediaIdempotency;
fs.writeFileSync('docs/api/full-site-operations.openapi.json',JSON.stringify(spec,null,2)+'\n');
