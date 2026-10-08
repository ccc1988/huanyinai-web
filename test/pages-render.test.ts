import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { createHash } from "node:crypto";
import { createRequire } from "node:module";
const nativeRequire = createRequire(import.meta.url);
const ts = nativeRequire("typescript");
const React = nativeRequire("react");
const { renderToStaticMarkup } = nativeRequire("react-dom/server");
const root = process.cwd();
const compilationCache = new Map<string, { source: string; fn: any }>();
export function makeLoader(published?: unknown, options: { resources?: Record<string, unknown>; mobileOpen?: boolean; sources?: Record<string, string> } = {}) {
  const cache = new Map<string, any>();
  const reads: string[] = [];
  function load(input: string, parent = "") : any {
    if (input.startsWith("@/")) input = path.join(root, input.slice(2));
    else if (input.startsWith(".")) input = path.resolve(path.dirname(parent), input);
    if (input.includes("/lib/operations/")) {
      return { readPublic: (resource: string) => { if(resource !== "pages") return options.resources?.[resource] ?? JSON.parse(fs.readFileSync(path.join(root, "data", resource + ".json"), "utf8")); reads.push(resource); return published; }, getRecord: () => null, openOperationsDb: () => { throw Error("public_sqlite_access"); }, getDataDir: () => path.join(root,"data") };
    }
    if (input === "next/link") return { __esModule: true, default: ({ children, ...props }: any) => React.createElement("a", props, children) };
    if (input === "next/navigation") return { usePathname: () => "/", notFound: () => { throw Error("not_found"); } };
    if (input === "next/image") return { __esModule: true, default: ({ fill, priority, unoptimized, ...props }: any) => React.createElement("img", props) };
    if (input === "next/dynamic") return { __esModule: true, default: (loader: any, opts: any) => {
      if(opts?.ssr === false) return () => null;
      const spec=loader.toString().match(/(?:import|require)\(["']([^"']+)["']\)/)?.[1];
      if(!spec) throw Error("dynamic_fixture_missing:"+loader);
      return load(spec, parent).default;
    } };
    if (input.endsWith("/NeuralBackground") || input.endsWith("/NeuralBackground.tsx")) return { __esModule: true, default: () => null };
    if (input === "react" && options.mobileOpen && parent.endsWith("components/ui/Navbar.tsx")) {
      let calls=0;
      return {...React,useState:(initial:any)=>React.useState(++calls===2 ? true : initial)};
    }
    if (!input.startsWith(root)) return nativeRequire(input);
    let filename=input;
    if(!fs.existsSync(filename) || fs.statSync(filename).isDirectory()) filename=[".ts",".tsx","/index.ts","/index.tsx"].map(s=>input+s).find(f=>fs.existsSync(f)) || input;
    if(cache.has(filename))return cache.get(filename).exports;
    const module={exports:{}}; cache.set(filename,module);
    const source=options.sources?.[path.relative(root, filename)] ?? fs.readFileSync(filename,"utf8");
    let compiled=compilationCache.get(filename);
    if(!compiled || compiled.source !== source) {
      const js=ts.transpileModule(source, {compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX,esModuleInterop:true}}).outputText;
      compiled={source,fn:vm.runInThisContext('(function(require,module,exports,process){'+js+'\n})',{filename})};
      compilationCache.set(filename,compiled);
    }
    const fn=compiled.fn;
    fn((spec: string)=>load(spec,filename),module,module.exports,{...process,env:{...process.env,DATA_DIR:path.join(root,"data")}});
    return module.exports;
  }
  return {load,reads};
}
export async function renderFixture(filename: string, published?: unknown, options: { resources?: Record<string, unknown>; industrySlug?: string; blogSlug?: string; caseSlug?: string; mobileOpen?: boolean; sources?: Record<string, string> } = {}) {
  const {load,reads}=makeLoader(published,options);
  const data=load("@/lib/data");
  const industries=data.getIndustries();
  const cases=data.getPublicCases();
  const blogs=data.getPublicBlogPosts();
  const props:any={stats:data.getStats(),customers:data.getCustomers(),industries,cases,company:data.getCompany(),contacts:data.getContacts(),navItems:data.getNavItems(),content:data.getSettings().aiSearchGrowth};
  if(filename.includes("[industry]"))props.params=Promise.resolve({industry:options.industrySlug ?? industries.find((x:any)=>x.slug!=="ai-geo-aeo").slug});
  if(filename.includes("cases/[slug]"))props.params=Promise.resolve({slug:options.caseSlug ?? cases.find((x:any)=>x.hasDetailPage).slug});
  if(filename.includes("blog/[slug]"))props.params=Promise.resolve({slug:options.blogSlug ?? blogs[0].slug});
  const clientCopies:Record<string,string>={
    "components/home/IndustryTabs.tsx":"home-industries",
    "components/home/ClientLogos.tsx":"home-clients",
    "components/home/StatsWall.tsx":"home-stats-copy",
    "components/ui/Navbar.tsx":"site-navbar",
    "components/ui/Footer.tsx":"site-footer",
  };
  if(clientCopies[filename])props.copy=load("@/lib/content/pages").getPageFields(clientCopies[filename]);
  const mod=load(path.join(root,filename));
  const isAsync=mod.default.constructor.name === "AsyncFunction";
  const element=isAsync ? await mod.default(props) : React.createElement(mod.default,props);
  const html=renderToStaticMarkup(element);
  let metadata:any=null;
  if(mod.generateMetadata) metadata=await mod.generateMetadata(props);
  else if(mod.metadata)metadata=mod.metadata;
  return {html,metadata,reads};
}
const hash=(s:string)=>createHash("sha256").update(s).digest("hex");

export const BASELINE = {
  "app/page.tsx": {
    "html": "474a27c27f21c4dffc44970220969d6d95ad1d6132d51b68948026b10a01881a",
    "metadata": "74234e98afe7498fb5daf1f36ac2d78acc339464f950703b8c019892f982b90b"
  },
  "app/about/page.tsx": {
    "html": "da1e9f8dea94eb355f90dd921820284bac8bd47e13819c68133acec5ecf14bee",
    "metadata": "5506769d1197b4ff59824002caf9045503e2cb6c280343e6025cc8a40b327abd"
  },
  "app/contact/page.tsx": {
    "html": "6fa40429a2cc0f3d17153525d960bdfe02b9a9b044777bca543e3d365fc131c5",
    "metadata": "82fff435f4abc916eaadf35f3e502538a560ed7ea22ac936a311af47e3518aab"
  },
  "app/blog/page.tsx": {
    "html": "1e383740fcd1e613711d365d7c9732a17ad1fa9e3afd3c483063c8f024e3dfb9",
    "metadata": "726eb1be0db008237f096a85d14b6b4a6da08725c3a31495297bbc65b5d42aab"
  },
  "app/cases/page.tsx": {
    "html": "9da18bba6531c8b946bef841de760c3141c9f410cd9096ce35678686ab740e44",
    "metadata": "7611c084247e8a4314de15ed053c52fdff65970af6e4849aac7c7e223cd2d91f"
  },
  "app/solutions/page.tsx": {
    "html": "d8c98b35ac36b987d4efbeedce153399a8d0ef8db37e0209552d2d2190444b60",
    "metadata": "ba981e2df99bddc648d38565617cf3e6b9935029454b303ceaa2f55f68938ec4"
  },
  "app/solutions/ai-geo-aeo/page.tsx": {
    "html": "165d880582e3c7b34064e25167fc37a048db73b8cdaeae0697adc925debbbcfd",
    "metadata": "28ca3c79a24aad8b00569db1167976ef80f8d3a8494dda4e61eee3b8d787514d"
  },
  "app/solutions/[industry]/page.tsx": {
    "html": "9fe3c02470a148bcee6199efecf94c8497892f13d1a2e9eb357c55a03cf2153d",
    "metadata": "cd6f1f4a813c2dcd745c9f5972266ae73c67a59a7f25e5be6c53f114afce3e31"
  },
  "app/blog/[slug]/page.tsx": {
    "html": "0abe226c6f93eb2a64c30c6a021a55a587bad9144e2aee65353ed801fd706ed0",
    "metadata": "1c6066e2abdf5c2ad6a6a8fe94cb0b9b482ca4fd71ae0542cb41f6089f15f9e2"
  },
  "app/cases/[slug]/page.tsx": {
    "html": "2394bc421b38a7061edbf1a9d0b9f5c63d56ff925359ee6ae863a7f50cae124b",
    "metadata": "b0bc4bc400b91b0dbd22ddfb5f5cb0f75c78bb85198275940dd6daba04830772"
  },
  "components/home/Hero.tsx": {
    "html": "d75dcf5f5f4a43f151070144c648c183b93c7afc2ed4398d641a22c0006c6eab",
    "metadata": "74234e98afe7498fb5daf1f36ac2d78acc339464f950703b8c019892f982b90b"
  },
  "components/home/FinalCTA.tsx": {
    "html": "0ebd97765527bb57ec60daf53d02051a65995caa66307c4ad71b6081457e9b7a",
    "metadata": "74234e98afe7498fb5daf1f36ac2d78acc339464f950703b8c019892f982b90b"
  },
  "components/home/CapabilityMatrix.tsx": {
    "html": "a7a7f9e1992729f52fc36d5d1dcd96edbef5e16703bb44acc1334fc5ae2bbacc",
    "metadata": "74234e98afe7498fb5daf1f36ac2d78acc339464f950703b8c019892f982b90b"
  },
  "components/home/IndustryTabs.tsx": {
    "html": "48242a4d2d6ac1df917bb8d0b563e19b15303a6ff02f24893ea1a9075be9ceba",
    "metadata": "74234e98afe7498fb5daf1f36ac2d78acc339464f950703b8c019892f982b90b"
  },
  "components/home/CaseHighlights.tsx": {
    "html": "8f655582335dd392344e85bc8beb31ad799f95e5cbe310957105da59ba92b695",
    "metadata": "74234e98afe7498fb5daf1f36ac2d78acc339464f950703b8c019892f982b90b"
  },
  "components/home/ClientLogos.tsx": {
    "html": "3cc8cb053f650d09140ceaef663ce0d8022737684d5b68ffdad4e36e5bcf7b4b",
    "metadata": "74234e98afe7498fb5daf1f36ac2d78acc339464f950703b8c019892f982b90b"
  },
  "components/home/StatsWall.tsx": {
    "html": "7b8e470b946a69c14ed828af679a2bde8124aefe5c59deec84dfe297bade9cde",
    "metadata": "74234e98afe7498fb5daf1f36ac2d78acc339464f950703b8c019892f982b90b"
  },
  "components/home/AISearchGrowthBanner.tsx": {
    "html": "b2bc463fa9376af74eaa2da824962f5d85fa9a328e7b0d65c7ea6c116f8f97d8",
    "metadata": "74234e98afe7498fb5daf1f36ac2d78acc339464f950703b8c019892f982b90b"
  },
  "components/ui/Navbar.tsx": {
    "html": "ef9be14b9f06cfb2a8a010e3e5d0befc1f4954fca0f641b9685a6608bf60a14f",
    "metadata": "74234e98afe7498fb5daf1f36ac2d78acc339464f950703b8c019892f982b90b"
  },
  "components/ui/Footer.tsx": {
    "html": "53e5a0502aa8b28e356bd930cb5eb32ae3c240aa2be4a36576f309450d80b54b",
    "metadata": "74234e98afe7498fb5daf1f36ac2d78acc339464f950703b8c019892f982b90b"
  }
};

for(const [filename, expected] of Object.entries(BASELINE)) {
  test("default DOM and metadata remain byte-identical: " + filename, async () => {
    const rendered=await renderFixture(filename);
    assert.equal(hash(rendered.html),expected.html);
    assert.equal(hash(JSON.stringify(rendered.metadata)),expected.metadata);
  });
}
test("W3 public pages never seed or open SQLite", () => {
  const source=fs.readFileSync(path.join(root,"lib/content/pages.ts"),"utf8");
  assert.doesNotMatch(source,/openOperationsDb|getRecord|seedResource|node:sqlite/);
  assert.match(source,/readPublic/);
});
test("W3 exports strict collection and page validation", () => {
  const filename=path.join(root,"lib/content/pageSchema.ts");
  assert.ok(fs.existsSync(filename),"pageSchema.ts is required");
  const schema=makeLoader().load(filename);
  assert.equal(typeof schema.validatePagesData,"function");
  assert.equal(typeof schema.validatePage,"function");
});

test("marketing stats fixture is unchanged", () => assert.equal(hash(fs.readFileSync(path.join(root,"data/stats.json"),"utf8")),"cd650c09def5813fc7d943363b2f90c3cbc962ffea99b45d6550bff6a4426e15"));

test("page schema rejects unknown fields, keys, duplicates, unsafe markup and URLs", () => {
  const {load}=makeLoader();
  const {DEFAULT_PAGES}=load("@/lib/content/defaultPages");
  const {validatePage,validatePagesData}=load("@/lib/content/pageSchema");
  const copy=()=>JSON.parse(JSON.stringify(DEFAULT_PAGES[0]));
  assert.doesNotThrow(()=>validatePagesData(DEFAULT_PAGES));
  assert.throws(()=>validatePagesData({pages:DEFAULT_PAGES}));
  assert.throws(()=>validatePagesData([DEFAULT_PAGES[0],DEFAULT_PAGES[0]]));
  for(const mutate of [
    (p:any)=>p.pageKey="../../escape",
    (p:any)=>p.html="<script>bad()</script>",
    (p:any)=>p.seo.unknown=true,
    (p:any)=>p.blocks[0].type="code",
    (p:any)=>p.blocks[0].id="unknown-block",
    (p:any)=>p.blocks[0].order="10",
    (p:any)=>p.blocks[0].enabled="true",
    (p:any)=>p.blocks[0].props.className="anything",
    (p:any)=>p.blocks[0].props.titlePrimary="<img src=x onerror=alert(1)>",
    (p:any)=>p.blocks[0].props.primaryHref="javascript:alert(1)",
    (p:any)=>p.blocks[0].props.primaryHref="//evil.example/path",
    (p:any)=>p.blocks[0].props.primaryHref="/../admin",
    (p:any)=>p.blocks.push(p.blocks[0]),
  ]) {const page=copy(); mutate(page); assert.throws(()=>validatePage(page));}
  const page=copy(); page.blocks[0].props.titlePrimary="新的运营标题";
  assert.doesNotThrow(()=>validatePage(page));
});

test("getPage reads pages array without DB access; missing and malformed snapshots fall back", () => {
  const {DEFAULT_PAGES}=makeLoader().load("@/lib/content/defaultPages");
  for(const invalid of [undefined,null,{},"bad",[{pageKey:"home",blocks:[]}],DEFAULT_PAGES.map((p:any)=>({...p,html:"bad"}))]) {
    const {load,reads}=makeLoader(invalid);
    assert.deepEqual(JSON.parse(JSON.stringify(load("@/lib/content/pages").getPage("home"))),JSON.parse(JSON.stringify(DEFAULT_PAGES[0])));
    assert.deepEqual(reads,["pages"]);
  }
  const published=JSON.parse(JSON.stringify(DEFAULT_PAGES));
  published[0].blocks[0].props.titlePrimary="已发布首页标题";
  const {load}=makeLoader(published);
  assert.equal(load("@/lib/content/pages").getPage("home").blocks[0].props.titlePrimary,"已发布首页标题");
});


test("every mapped copy field is read by its real page/component consumer", async () => {
  const {load}=makeLoader();
  const {PAGE_FIELDS}=load("@/lib/content/pageFields");
  const {DEFAULT_PAGES}=load("@/lib/content/defaultPages");
  const owners:Record<string,string>={
    "about-intro":"app/about/page.tsx", "contact-intro":"app/contact/page.tsx",
    "blog-list":"app/blog/page.tsx", "cases-list":"app/cases/page.tsx",
    "solutions-list":"app/solutions/page.tsx", "ai-geo-content":"app/solutions/ai-geo-aeo/page.tsx",
    "solution-detail-copy":"app/solutions/[industry]/page.tsx",
    "blog-detail-copy":"app/blog/[slug]/page.tsx", "case-detail-copy":"app/cases/[slug]/page.tsx",
    "home-capabilities":"components/home/CapabilityMatrix.tsx", "home-industries":"app/page.tsx",
    "home-cases":"components/home/CaseHighlights.tsx", "home-clients":"app/page.tsx",
    "home-stats-copy":"app/page.tsx", "home-ai-search-copy":"components/home/AISearchGrowthBanner.tsx",
    "site-navbar":"components/ui/Navbar.tsx", "site-footer":"components/ui/Footer.tsx",
    "home-hero":"app/page.tsx", "home-final-cta":"app/page.tsx",
  };
  let checked=0;
  for(const [blockId,definition] of Object.entries(PAGE_FIELDS) as [string,any][]) {
    const pages=JSON.parse(JSON.stringify(DEFAULT_PAGES));
    const block=pages.find((p:any)=>p.pageKey===definition.pageKey).blocks.find((b:any)=>b.id===blockId);
    const markers:string[]=[];
    function change(obj:any,at:string){
      for(const key of Object.keys(obj)) {
        if(typeof obj[key]==="string") {
          const marker="W3_FIELD_"+blockId.replaceAll("-","_")+"_"+at+key;
          obj[key]=/href\d*$/i.test(key)?"/"+marker:marker;
          markers.push(marker);
        }else if(obj[key]&&typeof obj[key]==="object") change(obj[key],at+key+"_");
      }
    }
    change(block.props,"");
    const options:any={};
    const variants:any[]=[options];
    if(blockId==="solution-detail-copy")variants.push({industrySlug:"ai-geo-aeo"});
    if(blockId==="contact-intro") {
      const contacts=JSON.parse(fs.readFileSync(path.join(root,"data/contacts.json"),"utf8"));
      variants.push({resources:{contacts:[{...contacts[0],name:"",role:"",qrCode:"",wechat:"w3-test"}]}});
      variants.push({resources:{contacts:[{...contacts[0],name:"",role:"",qrCode:"data:image/png;base64,aW1hZ2U=",wechat:"w3-test"}]}});
    }
    if(blockId==="blog-detail-copy") {
      const posts=JSON.parse(fs.readFileSync(path.join(root,"data/blog-posts.json"),"utf8"));
      const post={...posts.find((p:any)=>p.reviewStatus!=="draft"),reviewStatus:"pending",sources:[{title:"W3 source",url:"https://example.test/source",accessedAt:"2026-10-08"}]};
      variants.push({resources:{"blog-posts":[post,...posts.filter((p:any)=>p.slug!==post.slug)]}});
      variants.push({resources:{"blog-posts":[{...post,reviewStatus:"reviewed",reviewer:"W3 reviewer"},...posts.filter((p:any)=>p.slug!==post.slug)]}});
    }
    if(blockId==="site-navbar")variants.push({mobileOpen:true});
    const rendered=[];
    for(const variant of variants)rendered.push(await renderFixture(owners[blockId],pages,variant));
    const html=rendered.map(x=>x.html).join("\n");
    for(const marker of markers){assert.ok(html.includes(marker),"unconsumed "+marker+" in "+owners[blockId]);checked++;}
  }
  assert.ok(checked>=230,"field leaf coverage unexpectedly low: "+checked);
  console.log("W3_COPY_LEAVES_VERIFIED="+checked);
});

test("published SEO overrides are consumed by metadata generation", async () => {
  const {DEFAULT_PAGES}=makeLoader().load("@/lib/content/defaultPages");
  for(const [pageKey,filename] of Object.entries({about:"app/about/page.tsx",contact:"app/contact/page.tsx",blog:"app/blog/page.tsx",cases:"app/cases/page.tsx",solutions:"app/solutions/page.tsx","ai-geo-aeo":"app/solutions/ai-geo-aeo/page.tsx","solution-detail":"app/solutions/[industry]/page.tsx","blog-detail":"app/blog/[slug]/page.tsx","case-detail":"app/cases/[slug]/page.tsx"})) {
    const pages=JSON.parse(JSON.stringify(DEFAULT_PAGES));
    pages.find((p:any)=>p.pageKey===pageKey).seo={title:"W3 SEO title",description:"W3 SEO description"};
    const rendered=await renderFixture(filename,pages);
    assert.equal(rendered.metadata.title,"W3 SEO title");
    assert.equal(rendered.metadata.description,"W3 SEO description");
    assert.equal(rendered.metadata.openGraph.title,"W3 SEO title");
  }
});

test("disabled connected blocks disappear; partial props and intentional empty text do not break defaults", async () => {
  const {load}=makeLoader();
  const {DEFAULT_PAGES}=load("@/lib/content/defaultPages");
  const pages=JSON.parse(JSON.stringify(DEFAULT_PAGES));
  const hero=pages[0].blocks.find((b:any)=>b.id==="home-hero");
  hero.enabled=false;
  const rendered=await renderFixture("app/page.tsx",pages);
  assert.ok(!rendered.html.includes("AI 智能体与 AI 搜索获客"));
  hero.enabled=true;hero.props={titlePrimary:""};
  const api=makeLoader(pages).load("@/lib/content/pages");
  assert.equal(api.getPageFields("home-hero").titlePrimary,"");
  assert.equal(api.getPageFields("home-hero").titleSecondary,"重构业务流程，连接增长入口");
});

test("nested schema shapes and cross-page IDs cannot inject fields or break the fixed renderer",()=>{
  const {load}=makeLoader();
  const {DEFAULT_PAGES}=load("@/lib/content/defaultPages");
  const {validatePage}=load("@/lib/content/pageSchema");
  const geo=DEFAULT_PAGES.find((p:any)=>p.pageKey==="ai-geo-aeo");
  for(const mutate of [
    (p:any)=>p.blocks[0].props.servicePillars[0].icon="<script/>",
    (p:any)=>p.blocks[0].props.servicePillars.pop(),
    (p:any)=>p.blocks[0].props.deliveryRows[0].pop(),
    (p:any)=>p.blocks[0].props.customerQuestions="wrong",
    (p:any)=>p.blocks[0].props.journey[0][0]="<style>body{display:none}</style>",
    (p:any)=>p.blocks[0].props.journey[0].push("extra"),
    (p:any)=>p.blocks[0].id="home-hero",
  ]){const page=JSON.parse(JSON.stringify(geo));mutate(page);assert.throws(()=>validatePage(page));}
});

test("fixed template order rejects drag/reorder requests instead of silently ignoring them",()=>{
  const {load}=makeLoader();
  const {DEFAULT_PAGES}=load("@/lib/content/defaultPages");
  const {validatePage}=load("@/lib/content/pageSchema");
  const page=JSON.parse(JSON.stringify(DEFAULT_PAGES[0]));
  page.blocks[0].order=999;
  assert.throws(()=>validatePage(page),/fixed_template/);
  const reversed=JSON.parse(JSON.stringify(DEFAULT_PAGES[0]));
  reversed.blocks.reverse();
  assert.throws(()=>validatePage(reversed),/template_order/);
});

test("page links reject private paths, encoded traversal and hidden protocol separators",()=>{
  const {load}=makeLoader();
  const {DEFAULT_PAGES}=load("@/lib/content/defaultPages");
  const {validatePage}=load("@/lib/content/pageSchema");
  for(const link of ["/admin","/api/admin/content","/_next/test","/%2f%2fevil.test","/%5cevil.test","/%252e%252e/admin","/%00admin","/./contact","https://evil.test","data:text/html,bad"]) {
    const page=JSON.parse(JSON.stringify(DEFAULT_PAGES[0]));
    page.blocks[0].props.primaryHref=link;
    assert.throws(()=>validatePage(page),"unsafe href accepted: "+link);
  }
  for(const link of ["/contact","/contact?service=ai-geo-aeo","#deliverables","/cases/customs-document-ai"]) {
    const page=JSON.parse(JSON.stringify(DEFAULT_PAGES[0]));page.blocks[0].props.primaryHref=link;
    assert.doesNotThrow(()=>validatePage(page));
  }
});

test("Navbar/Footer enabled=false is consumed without conditional hooks",async()=>{
  for(const filename of ["components/ui/Navbar.tsx","components/ui/Footer.tsx"]){
    const {load}=makeLoader();
    const data=load("@/lib/data");
    const element=React.createElement(load(path.join(root,filename)).default,{enabled:false,navItems:data.getNavItems(),company:data.getCompany(),contacts:data.getContacts(),stats:data.getStats(),industries:data.getIndustries(),cases:data.getPublicCases()});
    assert.equal(renderToStaticMarkup(element),"");
  }
  const {load}=makeLoader();
  const {DEFAULT_PAGES}=load("@/lib/content/defaultPages");
  const pages=JSON.parse(JSON.stringify(DEFAULT_PAGES));
  pages.find((p:any)=>p.pageKey==="site-chrome").blocks.forEach((b:any)=>b.enabled=false);
  const chrome=makeLoader(pages).load("@/lib/content/pages").getPageChrome();
  assert.equal(chrome.navbarEnabled,false);
  assert.equal(chrome.footerEnabled,false);
});

const DETAIL_BASELINES = [
  {
    "filename": "app/solutions/[industry]/page.tsx",
    "options": {
      "industrySlug": "customs"
    },
    "html": "9fe3c02470a148bcee6199efecf94c8497892f13d1a2e9eb357c55a03cf2153d",
    "metadata": "cd6f1f4a813c2dcd745c9f5972266ae73c67a59a7f25e5be6c53f114afce3e31"
  },
  {
    "filename": "app/solutions/[industry]/page.tsx",
    "options": {
      "industrySlug": "cross-border-logistics"
    },
    "html": "e5c8996ef711ac7d0d35944188581ecaaab3600ae5faa3043a35501baf0af641",
    "metadata": "7f7129cca4fd7106fca5b163d5fb20effe698bd3d8773f9330b589bcfc0cf434"
  },
  {
    "filename": "app/solutions/[industry]/page.tsx",
    "options": {
      "industrySlug": "cross-border-ecommerce"
    },
    "html": "e4fe6d0fcfafc8efa8de1a4033cd63f4b4ebe8f72591050c854d319ea2ad3422",
    "metadata": "5f610ce0ce7ec3479a8bd41b4158ebd26ee03e474de4f7e2bc640cbba0ee5956"
  },
  {
    "filename": "app/solutions/[industry]/page.tsx",
    "options": {
      "industrySlug": "manufacturing"
    },
    "html": "796dbe8786c07278304f153d0286ab22fc75b7e60cc9a462f84e84f6724377ac",
    "metadata": "aff7bd9af55ea568050df9bc5123dcff57e67112b5480aac47a3374b285739c8"
  },
  {
    "filename": "app/solutions/[industry]/page.tsx",
    "options": {
      "industrySlug": "supply-chain"
    },
    "html": "05e9e4e08102551ee5e15d9086549c3f77c3df68eb6de1184e63c4ba9ade3e69",
    "metadata": "b1ceedb4f289df52aa59da39036883029aca35bec969ca3c8e5dc02005017dfd"
  },
  {
    "filename": "app/solutions/[industry]/page.tsx",
    "options": {
      "industrySlug": "ecommerce-service"
    },
    "html": "3f209362ce7e4adff04d979a80f1cb8107fe4c8eaafad695dcee306dbe1c1b1e",
    "metadata": "0383c68bf3b12ce931c2bb05876b1e706eb84a1a041dfcb835a88f20270fcd04"
  },
  {
    "filename": "app/solutions/[industry]/page.tsx",
    "options": {
      "industrySlug": "enterprise-ai-rpa-automation"
    },
    "html": "636923edfce91f83ff03db63619d3bff3dd65f434448c6ee6c79c6c33d3bc6de",
    "metadata": "8dbc2e93b141c267c161b58bca95ca49ca2537a68594d7330d14c69dcb681cb9"
  },
  {
    "filename": "app/solutions/[industry]/page.tsx",
    "options": {
      "industrySlug": "ai-foreign-trade-growth"
    },
    "html": "0231ee26729755e57d33eb017df46ca1900e14685ad6f078316164751ab6e9bf",
    "metadata": "33dc7d71cbf88d4a682f60007ad50dd4227731fc4d134cee818269aa22b4b6fe"
  },
  {
    "filename": "app/solutions/[industry]/page.tsx",
    "options": {
      "industrySlug": "ai-geo-aeo"
    },
    "html": "626bb95142696f2745c31f9d9f85a30db601f55580a522a277a73e21c2d3825a",
    "metadata": "28ca3c79a24aad8b00569db1167976ef80f8d3a8494dda4e61eee3b8d787514d"
  },
  {
    "filename": "app/blog/[slug]/page.tsx",
    "options": {
      "blogSlug": "customs-50w-tickets"
    },
    "html": "0abe226c6f93eb2a64c30c6a021a55a587bad9144e2aee65353ed801fd706ed0",
    "metadata": "1c6066e2abdf5c2ad6a6a8fe94cb0b9b482ca4fd71ae0542cb41f6089f15f9e2"
  },
  {
    "filename": "app/blog/[slug]/page.tsx",
    "options": {
      "blogSlug": "logistics-auto-tracking"
    },
    "html": "4abe456b41a06500bdb68191434eb8bf187ac16e955ee74d5cbe00ede6e6ed06",
    "metadata": "5f462f2d7cd97feb8b2864a90f076bc43a75ffb671319bb4eecb98687c6fdd78"
  },
  {
    "filename": "app/blog/[slug]/page.tsx",
    "options": {
      "blogSlug": "wecom-ai-customer-service"
    },
    "html": "606819668bfa884bb55d6e430653e9170e43a5da8bac609d0c86c04ce37097a6",
    "metadata": "73b85bb3a1943a58adf6514eae8496802ca830337df9a376500a20e2254f6958"
  },
  {
    "filename": "app/blog/[slug]/page.tsx",
    "options": {
      "blogSlug": "cross-border-ecommerce-ai-production"
    },
    "html": "ed3e3201d65fe24446026874ce6a1aeb34cfdb232b037fa12888518217ad61de",
    "metadata": "e1d30df02ce148a1254534e27b6639ce4f54f7b05c8537ed97fcb55d4429fe37"
  },
  {
    "filename": "app/blog/[slug]/page.tsx",
    "options": {
      "blogSlug": "logistics-multi-carrier-tracking"
    },
    "html": "c38ee013da14d1662db55b8cb2b2b3381a3d5e59b27c1b67b913e7247df71d65",
    "metadata": "c441929af7e53880363037ee7cf8645aff81b7201a00c8a1c1a004f1c54e3079"
  },
  {
    "filename": "app/blog/[slug]/page.tsx",
    "options": {
      "blogSlug": "wecom-logistics-ai-service"
    },
    "html": "57a91dd3f37318987f86d5c54c82877d87a3e5b31cc05e52990aa9db8b7b96bb",
    "metadata": "35e343db40d79abf86c5e64a099a9d22ab568ce6eeefdf87e8dc8b7e915b1b3e"
  },
  {
    "filename": "app/blog/[slug]/page.tsx",
    "options": {
      "blogSlug": "customs-document-automation"
    },
    "html": "8b42d1aa1eb439ecd95f1b1f7b834874c104b7f69d82832445c278ea1a95d834",
    "metadata": "ec291491800735d1aa8499b29b28c360d145a8fae7405e8e5d6b7ba0371ed696"
  },
  {
    "filename": "app/blog/[slug]/page.tsx",
    "options": {
      "blogSlug": "rpa-data-entry-erp-wms"
    },
    "html": "32d725644128c151671b0ca54aab85f6a585b8c0dfc156abad793fef79435352",
    "metadata": "344518c9738a1220707167b58aff13ebdb4b4bd65460111f7654ff342cc7dc53"
  },
  {
    "filename": "app/blog/[slug]/page.tsx",
    "options": {
      "blogSlug": "customs-estamp-workflow"
    },
    "html": "6e68f8a3252fb9d94ba35b085e3f63f7eb41554ab9b8923891f430c77ade166f",
    "metadata": "daf441860162885c7a05d991fcc5f71794c2a813c91c10a8697a560f02d3a79e"
  },
  {
    "filename": "app/blog/[slug]/page.tsx",
    "options": {
      "blogSlug": "supply-chain-quote-agent"
    },
    "html": "6be62c8a1c2ba2069411414a029f3dcf2afd7b9290c1b4f901fbb605ca386e05",
    "metadata": "e87d6c85c174e51bab63d9e8d5d6cd3701633265d672a0f8e80fdf8736ddcc03"
  },
  {
    "filename": "app/blog/[slug]/page.tsx",
    "options": {
      "blogSlug": "ai-agent-vs-traditional-software"
    },
    "html": "48b86f742afaf251f504c312e8487c2c8f6a9f15418562261c18696bdde87263",
    "metadata": "056e63a1a1a8866e9088356bed1c69d55e0833dd8d77b87779aa33c96f07ef36"
  },
  {
    "filename": "app/blog/[slug]/page.tsx",
    "options": {
      "blogSlug": "cross-border-logistics-ai-acceptance"
    },
    "html": "05e7354117047c9778a4ea048923074be22dd66481ec7bb7bc8f64d28695eddb",
    "metadata": "81d5d9268e08c046d0e625862852513ed31de176b9451418eb44fe52b134a783"
  },
  {
    "filename": "app/blog/[slug]/page.tsx",
    "options": {
      "blogSlug": "shenzhen-enterprise-ai-custom-development"
    },
    "html": "234eef65c1bd8d447ba62c98912f80afff68eb9bf96cdd82ce2a3b18358c0ca7",
    "metadata": "2a218dd416024cb4c1c0671430b4cf02a5143da0e86b79d338fb3da5118ad4ce"
  },
  {
    "filename": "app/blog/[slug]/page.tsx",
    "options": {
      "blogSlug": "enterprise-ai-custom-development-private-deployment"
    },
    "html": "a651096a0636bff2f553e0bd1297787b26a962245f3bb93da7240ffb393afd32",
    "metadata": "57073b2a7992884ab649ad53f715684978bf82e2b94725a14048933415b25efb"
  },
  {
    "filename": "app/blog/[slug]/page.tsx",
    "options": {
      "blogSlug": "consumer-product-recommendation-agent-poc"
    },
    "html": "9d98794d1354a386060a64d9157fb239b1046d7954bceb0144f06e9718bf41e3",
    "metadata": "32ccb9f50a7a05ea14d4201dc8866687e40d2ff2f2b53b038d1e75658a1799ca"
  },
  {
    "filename": "app/blog/[slug]/page.tsx",
    "options": {
      "blogSlug": "ai-foreign-trade-customer-development-closed-loop"
    },
    "html": "ad51d2841abbed2b01880fb7736fa4d7265b3deca1336583a6a15ed6646e97e6",
    "metadata": "aeec6a89b03cd97d9aeb2967275781eab57634998a66a2c7496f4b73edf9798c"
  },
  {
    "filename": "app/blog/[slug]/page.tsx",
    "options": {
      "blogSlug": "ai-foreign-trade-system-selection-checklist"
    },
    "html": "3a0cbe4758df49a95b0925826786c081a37655e5d169b624c72480b777672d7e",
    "metadata": "5b0e98569ea8e832c1c5e8286a9892e40b4c0d96f3b7e9171ac5c7a534dec7c9"
  },
  {
    "filename": "app/blog/[slug]/page.tsx",
    "options": {
      "blogSlug": "freight-forwarder-ai-customer-service-quote-order-tracking"
    },
    "html": "4e4943e89f703b498fbacaffa8beb891df84e01aacdbaf44665f3dc63b3ee726",
    "metadata": "f5c03b04ce8e9d0a1071c6ae13b29dbaea586b578a5e65dda8091c30ce61d1b8"
  },
  {
    "filename": "app/cases/[slug]/page.tsx",
    "options": {
      "caseSlug": "customs-document-ai"
    },
    "html": "2394bc421b38a7061edbf1a9d0b9f5c63d56ff925359ee6ae863a7f50cae124b",
    "metadata": "b0bc4bc400b91b0dbd22ddfb5f5cb0f75c78bb85198275940dd6daba04830772"
  },
  {
    "filename": "app/cases/[slug]/page.tsx",
    "options": {
      "caseSlug": "ecommerce-ai-production"
    },
    "html": "635b207e1c2f8a1aada00fa933cf9b3d56c0e8a4b03eadac5fdb4cd6a30e7904",
    "metadata": "9a75b9ff2ceef4b5cd4cad62a8fd1f697e9d8852d156bd254c59becb314b3a73"
  },
  {
    "filename": "app/cases/[slug]/page.tsx",
    "options": {
      "caseSlug": "logistics-tracking-ai"
    },
    "html": "912344daea268df2c1a4a8b5a43bb70cc9ab281087b7eb612cdd0081768bfeb8",
    "metadata": "c8d4d6cd1b323ed318e65f134516fd50840d8d5ce975afdd7149a836b4307d15"
  },
  {
    "filename": "app/cases/[slug]/page.tsx",
    "options": {
      "caseSlug": "south-china-customs-document-ledger"
    },
    "html": "1c4cf253e68f9ce889c9cfe754a646f54b31dddf1de5c9f888f73a49d647261a",
    "metadata": "1e5a720a750392bb9c566b591957504121e7754c8c597d3a4a79d860410a00d0"
  },
  {
    "filename": "app/cases/[slug]/page.tsx",
    "options": {
      "caseSlug": "south-china-logistics-clearance-standardization"
    },
    "html": "c54ae74b34d8450a4acc6fbcbfab202ef766fcf8757efe9639f9d42b7bb72c8a",
    "metadata": "6f08e5d51192671d06d4162347693ff3a9bcdbd1fe235d1427327c9e0f9312fd"
  },
  {
    "filename": "app/cases/[slug]/page.tsx",
    "options": {
      "caseSlug": "global-logistics-multi-carrier-tracking"
    },
    "html": "3afc5db45dc722d311adb17981244f208a57c44ca820d847010cd487d8f709c7",
    "metadata": "b8521ccd5785f9feead773ea30941bccdbcade31b151e42612c6c0f984ab414a"
  },
  {
    "filename": "app/cases/[slug]/page.tsx",
    "options": {
      "caseSlug": "cross-border-ecommerce-template-listing"
    },
    "html": "33daefc79837f568d0d9444c9905f68a8b9c57268460abc1959a179e1d5c1a41",
    "metadata": "c6c2e01d7cd439a9464f7524dc2b259ad88333c92fccca10c060067e05b59e2e"
  },
  {
    "filename": "app/cases/[slug]/page.tsx",
    "options": {
      "caseSlug": "wecom-logistics-quote-service"
    },
    "html": "f62c0df646901bf6839bf5281e131bf9ea6c89ba4e5ae335a316a7433c9d5e4f",
    "metadata": "48666a90a2fec7b6cce01793b16c83be7b399c1d573c72e29cc3e0d8bb9c918c"
  },
  {
    "filename": "app/cases/[slug]/page.tsx",
    "options": {
      "caseSlug": "cross-border-template-engine-offline"
    },
    "html": "fe993a06c0c6bd50b547024d92301a27d589885f208a92da6b1370d13a459445",
    "metadata": "aa3bc37aefef9c7709fdf16e8fe03280bab8e523acc99f8a577edf78d47cfc3d"
  },
  {
    "filename": "app/cases/[slug]/page.tsx",
    "options": {
      "caseSlug": "supply-chain-ai-service-production"
    },
    "html": "647d2f4c7753a3a48340521849295d8295ff3855d687b3736eb6e2291bab762b",
    "metadata": "5b08fc0cb05938f88a518784ca77b0bdb6e265d91c7fe809b5e4aab49d85a61b"
  },
  {
    "filename": "app/cases/[slug]/page.tsx",
    "options": {
      "caseSlug": "huanyin-ai-search-visibility-baseline"
    },
    "html": "5b29f8eb6e813c98ddfb97fba558eadb80e33fac075efe8a13095c4a014ae45a",
    "metadata": "ca6d5dcfcc099a595f303ae00f6cdb638c5338a0e59db5056d47b1097370620f"
  }
];

test("all public detail routes keep cloud HEAD baseline DOM and metadata exactly",async()=>{
  for(const expected of DETAIL_BASELINES){
    const rendered=await renderFixture(expected.filename,undefined,expected.options);
    assert.equal(hash(rendered.html),expected.html,expected.filename+" "+JSON.stringify(expected.options));
    assert.equal(hash(JSON.stringify(rendered.metadata)),expected.metadata,expected.filename+" metadata "+JSON.stringify(expected.options));
  }
  console.log("W3_DEFAULT_DETAIL_ROUTES_VERIFIED="+DETAIL_BASELINES.length);
});

test("home/site chrome cannot accept dead SEO fields owned by settings/layout",()=>{
  const {load}=makeLoader();const {DEFAULT_PAGES}=load("@/lib/content/defaultPages");
  const {validatePage}=load("@/lib/content/pageSchema");
  for(const key of ["home","site-chrome"]){const page=JSON.parse(JSON.stringify(DEFAULT_PAGES.find((p:any)=>p.pageKey===key)));page.seo.title="unconsumed override";assert.throws(()=>validatePage(page),/seo_owned_by_settings/);}
});

test("server chrome snapshot is forwarded by real AppShell (copy and enabled)",()=>{
  const {load}=makeLoader();const {DEFAULT_PAGES}=load("@/lib/content/defaultPages");
  const pages=JSON.parse(JSON.stringify(DEFAULT_PAGES));
  const block=pages.find((p:any)=>p.pageKey==="site-chrome").blocks.find((b:any)=>b.id==="site-navbar");
  block.props.desktopCtaLabel="W3_APP_SHELL_PUBLISHED_CHROME";
  const fixtures=makeLoader(pages);const data=fixtures.load("@/lib/data");
  const render=(chrome:any)=>renderToStaticMarkup(React.createElement(fixtures.load("@/components/ui/AppShell").default,{chrome,navItems:data.getNavItems(),company:data.getCompany(),contacts:data.getContacts(),stats:data.getStats(),industries:data.getIndustries(),cases:data.getPublicCases(),children:"W3_CONTENT_CHILDREN"}));
  const chrome=fixtures.load("@/lib/content/pages").getPageChrome();
  assert.ok(render(chrome).includes("W3_APP_SHELL_PUBLISHED_CHROME"));
  const hidden=render({...chrome,navbarEnabled:false,footerEnabled:false});
  assert.ok(!hidden.includes("<nav"));assert.ok(!hidden.includes("<footer"));
  assert.ok(hidden.includes("W3_CONTENT_CHILDREN"));
});
