/** Creates only a draft. Run on an authorized server with secrets injected by its secret manager. */
import {SiteOperationsClient} from './site-operations.mjs';
const required = name => { const value = process.env[name]; if (!value) throw new Error('missing_'+name); return value; };
const baseUrl = required('SITE_API_BASE_URL');
const client = new SiteOperationsClient({baseUrl,clientId:required('SITE_API_CLIENT_ID'),clientSecret:required('SITE_API_CLIENT_SECRET'),allowLocalhost:process.env.SITE_API_LOCAL_TEST==='true'});
try {
 const slug=required('SITE_API_DRAFT_SLUG'),key=required('SITE_API_IDEMPOTENCY_KEY');
 const directory=await client.request('/resources');
 if(!directory.resources.some(resource=>resource.name==='blog-posts'&&resource.write))throw new Error('blog_write_grant_required');
 const receipt=await client.create('blog-posts',{slug,title:'第三方接入草稿',excerpt:'仅用于已授权的草稿流程验证',category:'接入验证',tags:[],date:process.env.SITE_API_DRAFT_DATE||new Date().toISOString().slice(0,10),author:'代运营接入方',sections:[{heading:'草稿说明',body:'本例仅创建草稿，审核和发布由官网治理流程处理。'}],reviewStatus:'draft'},key);
 console.log(JSON.stringify({operationId:receipt.operationId,status:receipt.status,resourceId:receipt.resourceId}));
} catch(error) {
 console.error(JSON.stringify({code:error.code||error.message,status:error.status,requestId:error.requestId,operationId:error.operationId}));process.exitCode=1;
}
