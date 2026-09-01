const siteUrl = (process.env.SITE_URL || "https://huanyinai.com").replace(/\/$/, "");
const checks = [];

function check(condition, message) {
  checks.push({ condition, message });
}

async function fetchPage(pathname) {
  const response = await fetch(`${siteUrl}${pathname}`, {
    headers: { "user-agent": "huanyin-seo-smoke-test/1.0" },
  });
  const body = await response.text();
  return { response, body };
}

function hasJsonLd(body, type) {
  return body.includes(`"@type":"${type}"`) || body.includes(`"@type": "${type}"`);
}

const expectedPages = [
  {
    path: "/cases/cross-border-template-engine-offline",
    title: "某跨境物流团队：企业模板标准化引擎与离线交付项目",
    jsonLd: "CaseStudy",
  },
  {
    path: "/cases/supply-chain-ai-service-production",
    title: "达九州供应链：AI 客服知识库与总控平台生产化项目",
    jsonLd: "CaseStudy",
  },
  {
    path: "/solutions/enterprise-ai-rpa-automation",
    title: "企业 AI 智能体与 RPA 业务自动化解决方案",
    jsonLd: "Service",
  },
  {
    path: "/blog/cross-border-logistics-ai-acceptance",
    title: "跨境物流 AI 项目如何验收？从能聊天到可追溯的 5 个生产指标",
    jsonLd: "BlogPosting",
  },
];

try {
  const robots = await fetchPage("/robots.txt");
  check(robots.response.status === 200, `/robots.txt status=${robots.response.status}`);
  check(robots.body.includes("sitemap.xml"), "/robots.txt points to sitemap.xml");

  const sitemap = await fetchPage("/sitemap.xml");
  const contentType = sitemap.response.headers.get("content-type") || "";
  const sitemapUrls = [...sitemap.body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
  check(sitemap.response.status === 200, `/sitemap.xml status=${sitemap.response.status}`);
  check(contentType.includes("xml"), `/sitemap.xml content-type=${contentType}`);
  check(sitemap.body.includes("<urlset") && sitemapUrls.length > 0, `sitemap has urlset and ${sitemapUrls.length} loc entries`);
  check(!sitemap.body.includes("www.huanyinai.com"), "sitemap has no www.huanyinai.com URLs");
  check(!sitemap.body.includes("115.190.115.201"), "sitemap has no server-IP URLs");

  const llms = await fetchPage("/llms.txt");
  check(llms.response.status === 200, `/llms.txt status=${llms.response.status}`);
  check(llms.body.includes("huanyinai.com"), "/llms.txt includes the official domain");
  check(llms.body.includes("企业 AI 智能体与 RPA 业务自动化解决方案"), "/llms.txt includes current solution content");
  check(llms.body.includes("某跨境物流团队：企业模板标准化引擎与离线交付项目"), "/llms.txt includes current case content");
  check(llms.body.includes("跨境物流 AI 项目如何验收"), "/llms.txt includes current blog content");

  for (const page of expectedPages) {
    const result = await fetchPage(page.path);
    const canonical = `${siteUrl}${page.path}`;
    check(result.response.status === 200, `${page.path} status=${result.response.status}`);
    check(/<title>[^<]+<\/title>/i.test(result.body), `${page.path} has title`);
    check(result.body.includes(page.title), `${page.path} contains expected title`);
    check(result.body.includes(`rel="canonical" href="${canonical}"`), `${page.path} has canonical=${canonical}`);
    check(hasJsonLd(result.body, page.jsonLd), `${page.path} has ${page.jsonLd} JSON-LD`);
    check(sitemapUrls.includes(canonical), `${page.path} is in sitemap`);
  }
} catch (error) {
  check(false, `request error: ${error instanceof Error ? error.message : String(error)}`);
}

const failures = checks.filter(({ condition }) => !condition);
for (const { condition, message } of checks) {
  console.log(`${condition ? "PASS" : "FAIL"} ${message}`);
}

if (failures.length > 0) {
  process.exitCode = 1;
  console.error(`SEO smoke test failed: ${failures.length}/${checks.length} checks failed`);
} else {
  console.log(`SEO smoke test passed: ${checks.length} checks`);
}
