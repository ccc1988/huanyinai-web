# W3 页面字段映射与验收

- 日期：2026-10-08；状态：云端隔离 worktree 开发候选，未提交、未部署。
- 权威：`docs/specs/full-site-operations-api-v1.md` FULL-04 / W3；本任务仅固定页面 copy 与 schema。
- 事实源：主代理 `readPublic("pages", dataDir?)` 只读 SQLite 公开快照 → 发布 JSON；缺失/不合法快照回退 `DEFAULT_PAGES`。页面 helpers 不直连数据库；reader 的 SQLite 分支使用只读连接，不建表、迁移、chmod、seed 或写入。
- `pages.json` 顶层必须为页面集合数组；详情模板 key 为 `solution-detail`、`blog-detail`、`case-detail`。
- 文案 props 只能使用下表命名字段；使用普通文本，不允许 HTML、JS、CSS、函数或任意对象。CTA href 仅站内绝对路径或锚点。
- 类型/白名单：`lib/content/pageSchema.ts`；客户端安全类型/默认值：`lib/content/pageFields.ts`；完整默认页面：`lib/content/defaultPages.ts`。
- schema 接口 `validatePage(data): PageContent`、`validatePagesData(data): PageContent[]`：成功返回输入，失败抛出含字段路径的 `PageValidationError`（`errors: string[]`）。
- 已发布 props 可以部分更新；未给字段精确回退默认，空字符串不被 `||` 覆盖；整个页面/区块缺失回退默认。enabled=false 隐藏已连接的模板/组件；order 必须等于 PAGE_TEMPLATE_ORDER 的固定模板槽位，blocks 数组按该值递增；变更槽位会被 schema 拒绝，明确不提供拖拽重排。
- 数组：AI GEO servicePillars（仅可运营字段，不含 icon 代码）、deliveryRows、customerQuestions、journey、principles；图标/布局留在 TSX。
- SEO：page.seo.title/description 在每次 generateMetadata 消费；未设仍用原有资源/动态统计拼接，详情 SEO override 作用于整个模板。首页全站 SEO 仍由 layout/settings 管理；home/site-chrome 的 seo 必须为空对象，schema 拒绝未消费的覆盖值。page.title 是运营记录名称，公开标题使用对应 props.title/titlePrimary 等字段。

## 执行契约与明确不做

固定文案映射，保持默认 DOM、metadata、样式/布局与营销统计。只修改指定 content/公开页面/home/Navbar/Footer/test/pages*.test.ts/本文；不写 operations、admin/API、package、生产 current/main。不提交、不部署。既有资源文案（公司/行业/案例/能力/客户/统计/联系方式/设置）仍由原资源读取；不复制成第二事实源。

## 客户端集成接口与主代理边界

`Navbar` 和 `Footer` 被 `components/ui/AppShell.tsx` 客户端直接导入，禁止从中导入服务器读取器。它们已支持 `copy` 与 `enabled?: boolean`，移动 Navbar 的隐藏判断在所有 hooks 之后，未改变 hooks 调用顺序。

```ts
// server layout: getPageChrome() 返回以下对象，实际 AppShell 参数名为 chrome。
chrome: {
  navbar: PageFields<"site-navbar">;
  footer: PageFields<"site-footer">;
  navbarEnabled: boolean;
  footerEnabled: boolean;
}
// AppShell 转发：
<Navbar copy={chrome.navbar} enabled={chrome.navbarEnabled} /* 原参数不变 */ />
<Footer copy={chrome.footer} enabled={chrome.footerEnabled} /* 原参数不变 */ />
```

layout/AppShell 不在本任务写入范围，由主代理接线；`test/pages-render.test.ts` 已加入实际 AppShell copy/enabled 消费检查，未接 flags 时保留红测，不用跳过或 mock 隐藏问题。

`AISearchGrowthBanner` 当前未被首页挂载；原 `content` 参数仍由 settings 消费方提供，新增固定提示文案由组件内 `getPageFields("home-ai-search-copy")` 读取。保留原挂载状态，不新增或重复展示。该 block 采用固定预留槽位，仅在现有/后续授权挂载时显示。

纯 schema `PageValidationError` 不依赖 operations。主代理的写入/HTTP 边界需把异常转换为 400 `invalid_pages` 并保留脱敏字段路径，不能将可预期校验错误归类为 500。

## 字段映射（行号为迁移前基线）

| pageKey | block id | 字段 | 原消费者 | 默认文案/数组 |
|---|---|---|---|---|
| `about` | `about-intro` | `props.eyebrow` | `app/about/page.tsx:36` | "关于寰引智能" |
| `about` | `about-intro` | `props.title` | `app/about/page.tsx:44` | "不是喊 AI 口号，是真正交付过" |
| `about` | `about-intro` | `props.introLead` | `app/about/page.tsx:50` | "，定位为面向企业的 AI 转型落地服务商。 我们已服务 " |
| `about` | `about-intro` | `props.customerCountLabel` | `app/about/page.tsx:51` | " 企业客户、交付 " |
| `about` | `about-intro` | `props.systemCountLabel` | `app/about/page.tsx:51` | " 智能化系统、覆盖 " |
| `about` | `about-intro` | `props.industryCountLabel` | `app/about/page.tsx:51` | " 大行业解决方案， 核心竞争优势是有实际交付能力。" |
| `about` | `about-intro` | `props.capabilitiesTitle` | `app/about/page.tsx:91` | "我们的能力边界" |
| `about` | `about-intro` | `props.industriesTitle` | `app/about/page.tsx:128` | "行业覆盖" |
| `about` | `about-intro` | `props.customersTitle` | `app/about/page.tsx:160` | "客户信任" |
| `about` | `about-intro` | `props.customersDescription` | `app/about/page.tsx:163` | "多家真实企业客户选择寰引智能" |
| `about` | `about-intro` | `props.ctaHref` | `app/about/page.tsx:194` | "/contact" |
| `about` | `about-intro` | `props.ctaLabel` | `app/about/page.tsx:195` | "预约免费咨询" |
| `contact` | `contact-intro` | `props.eyebrow` | `app/contact/page.tsx:30` | "联系我们" |
| `contact` | `contact-intro` | `props.title` | `app/contact/page.tsx:38` | "让 AI 为你的企业创造价值" |
| `contact` | `contact-intro` | `props.description` | `app/contact/page.tsx:44` | "告诉我们你的业务场景，我们给出可落地的 AI 方案" |
| `contact` | `contact-intro` | `props.contactDetailsTitle` | `app/contact/page.tsx:60` | "联系方式" |
| `contact` | `contact-intro` | `props.wechatLabel` | `app/contact/page.tsx:73` | "微信咨询" |
| `contact` | `contact-intro` | `props.emailLabel` | `app/contact/page.tsx:90` | "邮箱" |
| `contact` | `contact-intro` | `props.phoneLabel` | `app/contact/page.tsx:107` | "电话" |
| `contact` | `contact-intro` | `props.addressLabel` | `app/contact/page.tsx:124` | "公司地址" |
| `contact` | `contact-intro` | `props.contactFallbackName` | `app/contact/page.tsx:146` | "联系人" |
| `contact` | `contact-intro` | `props.wechatFallbackName` | `app/contact/page.tsx:149` | "微信" |
| `contact` | `contact-intro` | `props.qrCodeLabel` | `app/contact/page.tsx:149` | "二维码" |
| `contact` | `contact-intro` | `props.wechatPrefix` | `app/contact/page.tsx:162` | "微信：" |
| `contact` | `contact-intro` | `props.formTitle` | `app/contact/page.tsx:177` | "预约咨询" |
| `blog` | `blog-list` | `props.eyebrow` | `app/blog/page.tsx:32` | "行业洞察" |
| `blog` | `blog-list` | `props.title` | `app/blog/page.tsx:40` | "AI 落地实践" |
| `blog` | `blog-list` | `props.description` | `app/blog/page.tsx:46` | "真实案例背后的思考与方法论" |
| `blog` | `blog-list` | `props.readMoreLabel` | `app/blog/page.tsx:116` | "阅读全文" |
| `cases` | `cases-list` | `props.homeHref` | `app/cases/page.tsx:81` | "/" |
| `cases` | `cases-list` | `props.homeLabel` | `app/cases/page.tsx:84` | "首页" |
| `cases` | `cases-list` | `props.breadcrumbLabel` | `app/cases/page.tsx:87` | "客户案例" |
| `cases` | `cases-list` | `props.title` | `app/cases/page.tsx:108` | "客户案例" |
| `cases` | `cases-list` | `props.introLead` | `app/cases/page.tsx:115` | "精选 " |
| `cases` | `cases-list` | `props.caseCountLabel` | `app/cases/page.tsx:115` | " 个公开案例，覆盖 " |
| `cases` | `cases-list` | `props.industryCountLabel` | `app/cases/page.tsx:115` | " 大行业场景，从痛点诊断到系统交付的真实实践" |
| `cases` | `cases-list` | `props.caseCountCaption` | `app/cases/page.tsx:132` | "精选公开案例" |
| `cases` | `cases-list` | `props.industryCountCaption` | `app/cases/page.tsx:147` | "行业覆盖" |
| `cases` | `cases-list` | `props.groupCaseCountLabel` | `app/cases/page.tsx:185` | " 个案例" |
| `cases` | `cases-list` | `props.ctaTitle` | `app/cases/page.tsx:219` | "你的企业也有类似需求？" |
| `cases` | `cases-list` | `props.ctaDescription` | `app/cases/page.tsx:222` | "告诉我们你的业务场景，我们给出可落地的 AI 方案" |
| `cases` | `cases-list` | `props.ctaHref` | `app/cases/page.tsx:224` | "/contact" |
| `cases` | `cases-list` | `props.ctaLabel` | `app/cases/page.tsx:225` | "预约免费咨询" |
| `solutions` | `solutions-list` | `props.homeHref` | `app/solutions/page.tsx:57` | "/" |
| `solutions` | `solutions-list` | `props.homeLabel` | `app/solutions/page.tsx:60` | "首页" |
| `solutions` | `solutions-list` | `props.breadcrumbLabel` | `app/solutions/page.tsx:63` | "解决方案" |
| `solutions` | `solutions-list` | `props.title` | `app/solutions/page.tsx:84` | "行业 AI 解决方案" |
| `solutions` | `solutions-list` | `props.industryCountLabel` | `app/solutions/page.tsx:91` | " 大行业全覆盖，精选 " |
| `solutions` | `solutions-list` | `props.caseCountLabel` | `app/solutions/page.tsx:91` | " 个公开案例，从痛点诊断到智能体交付的全链路服务" |
| `solutions` | `solutions-list` | `props.relatedCaseCountLabel` | `app/solutions/page.tsx:194` | " 个关联案例" |
| `solutions` | `solutions-list` | `props.viewSolutionLabel` | `app/solutions/page.tsx:201` | "查看方案" |
| `solutions` | `solutions-list` | `props.ctaTitle` | `app/solutions/page.tsx:234` | "不确定哪个方案适合你？" |
| `solutions` | `solutions-list` | `props.ctaDescription` | `app/solutions/page.tsx:240` | "告诉我们你的业务场景，我们给出可落地的 AI 方案" |
| `solutions` | `solutions-list` | `props.ctaHref` | `app/solutions/page.tsx:242` | "/contact" |
| `solutions` | `solutions-list` | `props.ctaLabel` | `app/solutions/page.tsx:243` | "预约免费咨询" |
| `ai-geo-aeo` | `ai-geo-content` | `props.servicePillars` | `app/solutions/ai-geo-aeo/page.tsx:35` | [{"number":"01","title":"目标问句与增长指标","summary":"锁定客户在采购、比较与了解服务时会问的问题，把曝光、引用与推荐机会转成可复测的目标。","deliverables":["高价值问句与意图清单","出现、引用与推荐机会基线","周期目标与首轮行动优先级"]},{"number":"02","title":"企业事实与推荐证据","summary":"把企业名称、服务、产品、案例、资质和行业经验整理为 AI 能理解、客户能核验的推荐依据。","deliverables":["企业实体与事实资料表","产品、案例与行业关联证据","公开来源与事实冲突修正"]},{"number":"03","title":"官网与推荐内容运营","summary":"持续优化服务、行业、案例和 FAQ，让客户要比较的信息在官网与内容中有清晰、可引用的答案。","deliverables":["服务、行业、案例与 FAQ 优化","页面结构、内链与摘要优化","结构化信息与索引入口检查"]},{"number":"04","title":"可信信源与内容分发","summary":"围绕目标问句持续建设可信来源与内容证据，扩大品牌被 AI 理解、引用和比较的有效信号。","deliverables":["信源与内容机会清单","来源质量和公开授权检查","分发优先级与发布计划"]},{"number":"05","title":"持续代运营与结果复盘","summary":"按约定周期复测、调整和复盘，让每一轮优化都围绕目标问句的可见性与咨询机会继续推进。","deliverables":["周期复测与推荐证据索引","页面与内容变更记录","阶段结果报告与下一周期计划"]}] |
| `ai-geo-aeo` | `ai-geo-content` | `props.deliveryRows` | `app/solutions/ai-geo-aeo/page.tsx:73` | [["目标问句与指标方案","把高价值提问、目标平台与观察口径确定为代运营目标。","问句清单、抽样条件、基线记录与阶段指标。"],["企业事实与推荐证据包","让品牌、产品、服务和案例成为可理解、可比较的推荐依据。","事实表、来源清单、授权与冲突核对记录。"],["官网与内容运营包","持续补齐客户比较和 AI 理解需要的服务、行业、案例与 FAQ 信息。","页面优化稿、内容计划、结构化与内链检查。"],["周期结果与优化报告","复盘目标问句中的出现、引用、推荐机会与后续增长动作。","带时间戳的复测记录、证据索引、变更清单与下周期计划。"]] |
| `ai-geo-aeo` | `ai-geo-content` | `props.customerQuestions` | `app/solutions/ai-geo-aeo/page.tsx:80` | ["做企业 AI 定制开发，哪些服务商更适合制造和外贸企业？","向 AI 提问：这家公司的 AI 能力、行业经验和真实案例可靠吗？","如何比较几家跨境物流 AI 解决方案供应商？","企业官网为什么有内容，却不容易被 AI 搜索、AI 问答答案引用或推荐？"] |
| `ai-geo-aeo` | `ai-geo-content` | `props.journey` | `app/solutions/ai-geo-aeo/page.tsx:87` | [["锁定问句","从采购、选型与业务场景中确定高价值目标问题"],["建立基线","记录品牌、竞品、引用来源与推荐机会"],["持续运营","优化官网、事实、内容、信源与技术入口"],["证据验收","在约定条件下复测并留存可追溯记录"],["推动增长","根据结果继续优化下一周期优先级"]] |
| `ai-geo-aeo` | `ai-geo-content` | `props.homeBreadcrumbName` | `app/solutions/ai-geo-aeo/page.tsx:100` | "首页" |
| `ai-geo-aeo` | `ai-geo-content` | `props.solutionsBreadcrumbName` | `app/solutions/ai-geo-aeo/page.tsx:101` | "解决方案" |
| `ai-geo-aeo` | `ai-geo-content` | `props.breadcrumbAriaLabel` | `app/solutions/ai-geo-aeo/page.tsx:116` | "面包屑" |
| `ai-geo-aeo` | `ai-geo-content` | `props.homeHref` | `app/solutions/ai-geo-aeo/page.tsx:117` | "/" |
| `ai-geo-aeo` | `ai-geo-content` | `props.homeLabel` | `app/solutions/ai-geo-aeo/page.tsx:117` | "首页" |
| `ai-geo-aeo` | `ai-geo-content` | `props.solutionsHref` | `app/solutions/ai-geo-aeo/page.tsx:119` | "/solutions" |
| `ai-geo-aeo` | `ai-geo-content` | `props.solutionsLabel` | `app/solutions/ai-geo-aeo/page.tsx:119` | "解决方案" |
| `ai-geo-aeo` | `ai-geo-content` | `props.breadcrumbLabel` | `app/solutions/ai-geo-aeo/page.tsx:121` | "AI 搜索与答案推荐" |
| `ai-geo-aeo` | `ai-geo-content` | `props.heroEyebrow` | `app/solutions/ai-geo-aeo/page.tsx:126` | "企业 AI 搜索与答案推荐代运营 · GEO / AEO" |
| `ai-geo-aeo` | `ai-geo-content` | `props.titlePrimary` | `app/solutions/ai-geo-aeo/page.tsx:128` | "让品牌进入" |
| `ai-geo-aeo` | `ai-geo-content` | `props.titleSecondary` | `app/solutions/ai-geo-aeo/page.tsx:129` | "AI 搜索与答案推荐" |
| `ai-geo-aeo` | `ai-geo-content` | `props.heroDescription` | `app/solutions/ai-geo-aeo/page.tsx:132` | "围绕目标客户在 AI 搜索、AI 提问与供应商比较时的高价值问题，持续提升品牌、产品与服务在 AI 问答答案中的曝光、引用与推荐机会，并以可监控、可审计、可追溯的证据交付结果。" |
| `ai-geo-aeo` | `ai-geo-content` | `props.primaryHref` | `app/solutions/ai-geo-aeo/page.tsx:135` | "/contact?service=ai-geo-aeo" |
| `ai-geo-aeo` | `ai-geo-content` | `props.primaryLabel` | `app/solutions/ai-geo-aeo/page.tsx:136` | "申请 AI 搜索增长代运营评估" |
| `ai-geo-aeo` | `ai-geo-content` | `props.secondaryHref` | `app/solutions/ai-geo-aeo/page.tsx:139` | "#deliverables" |
| `ai-geo-aeo` | `ai-geo-content` | `props.secondaryLabel` | `app/solutions/ai-geo-aeo/page.tsx:140` | "查看可交付服务" |
| `ai-geo-aeo` | `ai-geo-content` | `props.introEyebrow` | `app/solutions/ai-geo-aeo/page.tsx:155` | "AI 搜索与 AI 问答的结果代运营" |
| `ai-geo-aeo` | `ai-geo-content` | `props.introTitle` | `app/solutions/ai-geo-aeo/page.tsx:157` | "把 AI 搜索与问答答案变成增长入口" |
| `ai-geo-aeo` | `ai-geo-content` | `props.introDescription` | `app/solutions/ai-geo-aeo/page.tsx:162` | "客户会在 AI 搜索中找服务商，也会通过 AI 提问、AI 问答答案比较和验证供应商。我们以代运营方式持续建设品牌事实、内容与可信信号，推动品牌在目标答案中被发现、引用、推荐，并进入客户的比较和咨询环节。" |
| `ai-geo-aeo` | `ai-geo-content` | `props.principles` | `app/solutions/ai-geo-aeo/page.tsx:165` | [["锁定目标问句","覆盖 AI 搜索、提问、比较与咨询场景"],["建设推荐依据","让产品、案例和行业经验可被理解"],["持续运营优化","围绕曝光、引用与推荐机会推进"],["证据化结果验收","每轮保留时间戳、来源与变更记录"]] |
| `ai-geo-aeo` | `ai-geo-content` | `props.pillarsEyebrow` | `app/solutions/ai-geo-aeo/page.tsx:185` | "企业 AI 搜索与答案推荐代运营服务" |
| `ai-geo-aeo` | `ai-geo-content` | `props.pillarsTitle` | `app/solutions/ai-geo-aeo/page.tsx:187` | "围绕 AI 搜索、问答引用与推荐持续代运营" |
| `ai-geo-aeo` | `ai-geo-content` | `props.pillarsDescription` | `app/solutions/ai-geo-aeo/page.tsx:190` | "从 AI 搜索和 AI 问答的目标问句与基线开始，到内容运营、信源建设与周期复盘，每个阶段都对应增长目标、运营动作和可验收的证据记录。" |
| `ai-geo-aeo` | `ai-geo-content` | `props.journeyEyebrow` | `app/solutions/ai-geo-aeo/page.tsx:221` | "方法与验证" |
| `ai-geo-aeo` | `ai-geo-content` | `props.journeyTitle` | `app/solutions/ai-geo-aeo/page.tsx:223` | "从目标问句到结果证据的代运营闭环" |
| `ai-geo-aeo` | `ai-geo-content` | `props.journeyDescription` | `app/solutions/ai-geo-aeo/page.tsx:236` | "每次复测都会固定问句、平台、地区、语言和时间等条件。只有在可比条件下，变化才有解释价值。" |
| `ai-geo-aeo` | `ai-geo-content` | `props.deliverablesEyebrow` | `app/solutions/ai-geo-aeo/page.tsx:246` | "目标、动作与证据同时交付" |
| `ai-geo-aeo` | `ai-geo-content` | `props.deliverablesTitle` | `app/solutions/ai-geo-aeo/page.tsx:248` | "每一轮代运营如何验收" |
| `ai-geo-aeo` | `ai-geo-content` | `props.deliverablesCaption` | `app/solutions/ai-geo-aeo/page.tsx:251` | "以结果记录与证据包作为交付依据" |
| `ai-geo-aeo` | `ai-geo-content` | `props.deliveryColumnLabel` | `app/solutions/ai-geo-aeo/page.tsx:254` | "代运营交付" |
| `ai-geo-aeo` | `ai-geo-content` | `props.outcomeColumnLabel` | `app/solutions/ai-geo-aeo/page.tsx:254` | "目标结果" |
| `ai-geo-aeo` | `ai-geo-content` | `props.evidenceColumnLabel` | `app/solutions/ai-geo-aeo/page.tsx:254` | "证据验收" |
| `ai-geo-aeo` | `ai-geo-content` | `props.questionsEyebrow` | `app/solutions/ai-geo-aeo/page.tsx:270` | "AI 搜索、AI 提问与客户决策场景" |
| `ai-geo-aeo` | `ai-geo-content` | `props.questionsTitle` | `app/solutions/ai-geo-aeo/page.tsx:272` | "客户会如何搜索、提问与比较" |
| `ai-geo-aeo` | `ai-geo-content` | `props.questionsDescription` | `app/solutions/ai-geo-aeo/page.tsx:275` | "我们不堆砌关键词，而是围绕客户在 AI 搜索、AI 提问、采购比较、验证与咨询环节的自然问题，建设企业真正需要回答的信息。" |
| `ai-geo-aeo` | `ai-geo-content` | `props.resultsEyebrow` | `app/solutions/ai-geo-aeo/page.tsx:290` | "结果可监控、可审计、可追溯" |
| `ai-geo-aeo` | `ai-geo-content` | `props.resultsTitle` | `app/solutions/ai-geo-aeo/page.tsx:292` | "用统一口径验收增长结果" |
| `ai-geo-aeo` | `ai-geo-content` | `props.outcomeTitle` | `app/solutions/ai-geo-aeo/page.tsx:298` | "目标结果" |
| `ai-geo-aeo` | `ai-geo-content` | `props.outcomeDescription` | `app/solutions/ai-geo-aeo/page.tsx:299` | "围绕目标问句观察 AI 搜索曝光、AI 问答答案中的品牌出现、信息正确性、引用来源、推荐机会、访问与咨询等增长变化。" |
| `ai-geo-aeo` | `ai-geo-content` | `props.operationsTitle` | `app/solutions/ai-geo-aeo/page.tsx:303` | "持续代运营" |
| `ai-geo-aeo` | `ai-geo-content` | `props.operationsDescription` | `app/solutions/ai-geo-aeo/page.tsx:304` | "按周期完成问句诊断、官网与内容优化、信源建设、复测复盘与下一轮增长动作。" |
| `ai-geo-aeo` | `ai-geo-content` | `props.evidenceTitle` | `app/solutions/ai-geo-aeo/page.tsx:308` | "证据化验收" |
| `ai-geo-aeo` | `ai-geo-content` | `props.evidenceDescription` | `app/solutions/ai-geo-aeo/page.tsx:309` | "固定问句、平台、地区、语言和时间条件，交付带时间戳的答案记录、引用来源、变更清单与阶段报告。" |
| `ai-geo-aeo` | `ai-geo-content` | `props.faqEyebrow` | `app/solutions/ai-geo-aeo/page.tsx:319` | "目标、过程与验收口径" |
| `ai-geo-aeo` | `ai-geo-content` | `props.faqTitle` | `app/solutions/ai-geo-aeo/page.tsx:321` | "先把代运营怎么做、怎么验收讲清楚" |
| `ai-geo-aeo` | `ai-geo-content` | `props.ctaEyebrow` | `app/solutions/ai-geo-aeo/page.tsx:339` | "从目标问句开始，持续走向增长结果" |
| `ai-geo-aeo` | `ai-geo-content` | `props.ctaTitle` | `app/solutions/ai-geo-aeo/page.tsx:341` | "让品牌进入客户的 AI 搜索与答案推荐" |
| `ai-geo-aeo` | `ai-geo-content` | `props.ctaDescription` | `app/solutions/ai-geo-aeo/page.tsx:344` | "提供官网、核心服务与目标客户问题。我们先完成代运营评估，明确品牌在 AI 搜索和 AI 问答答案中的当前机会、目标问句、增长指标与首轮行动计划。" |
| `ai-geo-aeo` | `ai-geo-content` | `props.ctaHref` | `app/solutions/ai-geo-aeo/page.tsx:346` | "/contact?service=ai-geo-aeo" |
| `ai-geo-aeo` | `ai-geo-content` | `props.ctaLabel` | `app/solutions/ai-geo-aeo/page.tsx:347` | "申请 AI 搜索增长代运营评估" |
| `solution-detail` | `solution-detail-copy` | `props.homeBreadcrumbName` | `app/solutions/[industry]/page.tsx:43` | "首页" |
| `solution-detail` | `solution-detail-copy` | `props.solutionsBreadcrumbName` | `app/solutions/[industry]/page.tsx:44` | "解决方案" |
| `solution-detail` | `solution-detail-copy` | `props.homeHref` | `app/solutions/[industry]/page.tsx:81` | "/" |
| `solution-detail` | `solution-detail-copy` | `props.homeLabel` | `app/solutions/[industry]/page.tsx:81` | "首页" |
| `solution-detail` | `solution-detail-copy` | `props.solutionsHref` | `app/solutions/[industry]/page.tsx:83` | "/solutions" |
| `solution-detail` | `solution-detail-copy` | `props.solutionsLabel` | `app/solutions/[industry]/page.tsx:83` | "解决方案" |
| `solution-detail` | `solution-detail-copy` | `props.painPointsTitle` | `app/solutions/[industry]/page.tsx:134` | "行业痛点" |
| `solution-detail` | `solution-detail-copy` | `props.solutionTitle` | `app/solutions/[industry]/page.tsx:166` | "寰引解决方案" |
| `solution-detail` | `solution-detail-copy` | `props.servicePackagesTitle` | `app/solutions/[industry]/page.tsx:186` | "我们提供什么" |
| `solution-detail` | `solution-detail-copy` | `props.servicePackagesDescription` | `app/solutions/[industry]/page.tsx:187` | "从一次基线诊断开始，把客户问题、公开信息和可验证的交付物连接起来。" |
| `solution-detail` | `solution-detail-copy` | `props.processTitle` | `app/solutions/[industry]/page.tsx:218` | "项目如何推进" |
| `solution-detail` | `solution-detail-copy` | `props.deliveryTitle` | `app/solutions/[industry]/page.tsx:240` | "交付什么，如何验收" |
| `solution-detail` | `solution-detail-copy` | `props.deliverablesTitle` | `app/solutions/[industry]/page.tsx:245` | "交付物" |
| `solution-detail` | `solution-detail-copy` | `props.measurementTitle` | `app/solutions/[industry]/page.tsx:251` | "可观察指标" |
| `solution-detail` | `solution-detail-copy` | `props.boundariesTitle` | `app/solutions/[industry]/page.tsx:261` | "哪些结果不能保证" |
| `solution-detail` | `solution-detail-copy` | `props.relatedCasesTitle` | `app/solutions/[industry]/page.tsx:279` | "关联案例" |
| `solution-detail` | `solution-detail-copy` | `props.faqTitle` | `app/solutions/[industry]/page.tsx:298` | "常见问题" |
| `solution-detail` | `solution-detail-copy` | `props.geoCtaTitle` | `app/solutions/[industry]/page.tsx:339` | "先从一次可验证的基线诊断开始" |
| `solution-detail` | `solution-detail-copy` | `props.ctaTitle` | `app/solutions/[industry]/page.tsx:339` | "想了解更多？" |
| `solution-detail` | `solution-detail-copy` | `props.geoCtaDescription` | `app/solutions/[industry]/page.tsx:345` | "提供你的官网、主要服务和目标客户问题，我们先确认 AI 搜索增长是否适合当前阶段。" |
| `solution-detail` | `solution-detail-copy` | `props.ctaDescription` | `app/solutions/[industry]/page.tsx:345` | "告诉我们你的业务场景，我们给出可落地的 AI 方案" |
| `solution-detail` | `solution-detail-copy` | `props.geoCtaLabel` | `app/solutions/[industry]/page.tsx:348` | "申请 AI 搜索可见性诊断" |
| `solution-detail` | `solution-detail-copy` | `props.ctaLabel` | `app/solutions/[industry]/page.tsx:348` | "预约免费咨询" |
| `blog-detail` | `blog-detail-copy` | `props.homeHref` | `app/blog/[slug]/page.tsx:60` | "/" |
| `blog-detail` | `blog-detail-copy` | `props.homeLabel` | `app/blog/[slug]/page.tsx:60` | "首页" |
| `blog-detail` | `blog-detail-copy` | `props.blogHref` | `app/blog/[slug]/page.tsx:62` | "/blog" |
| `blog-detail` | `blog-detail-copy` | `props.blogLabel` | `app/blog/[slug]/page.tsx:62` | "博客" |
| `blog-detail` | `blog-detail-copy` | `props.authorPrefix` | `app/blog/[slug]/page.tsx:85` | "作者：" |
| `blog-detail` | `blog-detail-copy` | `props.sourcesTitle` | `app/blog/[slug]/page.tsx:140` | "资料来源与内容审核" |
| `blog-detail` | `blog-detail-copy` | `props.sourceAccessedPrefix` | `app/blog/[slug]/page.tsx:146` | "（访问：" |
| `blog-detail` | `blog-detail-copy` | `props.reviewStatusPrefix` | `app/blog/[slug]/page.tsx:152` | "内容状态：" |
| `blog-detail` | `blog-detail-copy` | `props.pendingReviewLabel` | `app/blog/[slug]/page.tsx:152` | "待审核" |
| `blog-detail` | `blog-detail-copy` | `props.ctaTitle` | `app/blog/[slug]/page.tsx:166` | "想了解更多 AI 落地方案？" |
| `blog-detail` | `blog-detail-copy` | `props.ctaDescription` | `app/blog/[slug]/page.tsx:169` | "告诉我们你的业务场景，我们给出可落地的 AI 方案" |
| `blog-detail` | `blog-detail-copy` | `props.ctaLabel` | `app/blog/[slug]/page.tsx:172` | "预约免费咨询" |
| `blog-detail` | `blog-detail-copy` | `props.relatedPostsTitle` | `app/blog/[slug]/page.tsx:188` | "继续阅读" |
| `blog-detail` | `blog-detail-copy` | `props.readMoreLabel` | `app/blog/[slug]/page.tsx:213` | "阅读全文" |
| `case-detail` | `case-detail-copy` | `props.homeHref` | `app/cases/[slug]/page.tsx:63` | "/" |
| `case-detail` | `case-detail-copy` | `props.homeLabel` | `app/cases/[slug]/page.tsx:63` | "首页" |
| `case-detail` | `case-detail-copy` | `props.casesHref` | `app/cases/[slug]/page.tsx:65` | "/cases" |
| `case-detail` | `case-detail-copy` | `props.casesLabel` | `app/cases/[slug]/page.tsx:65` | "案例" |
| `case-detail` | `case-detail-copy` | `props.relatedCustomersPrefix` | `app/cases/[slug]/page.tsx:109` | "关联客户：" |
| `case-detail` | `case-detail-copy` | `props.painPointsTitle` | `app/cases/[slug]/page.tsx:126` | "客户痛点" |
| `case-detail` | `case-detail-copy` | `props.solutionTitle` | `app/cases/[slug]/page.tsx:158` | "解决方案" |
| `case-detail` | `case-detail-copy` | `props.customerValueTitle` | `app/cases/[slug]/page.tsx:184` | "客户价值" |
| `case-detail` | `case-detail-copy` | `props.metricsTitle` | `app/cases/[slug]/page.tsx:222` | "数据指标" |
| `case-detail` | `case-detail-copy` | `props.scenariosTitle` | `app/cases/[slug]/page.tsx:244` | "适用场景" |
| `case-detail` | `case-detail-copy` | `props.ctaTitle` | `app/cases/[slug]/page.tsx:278` | "你的企业也有类似需求？" |
| `case-detail` | `case-detail-copy` | `props.ctaDescription` | `app/cases/[slug]/page.tsx:281` | "告诉我们你的业务场景，我们给出可落地的 AI 方案" |
| `case-detail` | `case-detail-copy` | `props.ctaHref` | `app/cases/[slug]/page.tsx:283` | "/contact" |
| `case-detail` | `case-detail-copy` | `props.ctaLabel` | `app/cases/[slug]/page.tsx:284` | "预约免费咨询" |
| `home` | `home-capabilities` | `props.description` | `components/home/CapabilityMatrix.tsx:39` | "从业务提效到增长获客，为企业提供可落地的 AI 产品与实施服务。" |
| `home` | `home-capabilities` | `props.title` | `components/home/CapabilityMatrix.tsx:40` | "AI 应用与增长服务" |
| `home` | `home-capabilities` | `props.featuredEyebrow` | `components/home/CapabilityMatrix.tsx:52` | "AI 搜索增长 · GEO / AEO" |
| `home` | `home-capabilities` | `props.featuredLead` | `components/home/CapabilityMatrix.tsx:57` | "让品牌、产品与服务在 " |
| `home` | `home-capabilities` | `props.searchEmphasis` | `components/home/CapabilityMatrix.tsx:57` | "AI 搜索" |
| `home` | `home-capabilities` | `props.discoveryLead` | `components/home/CapabilityMatrix.tsx:57` | " 中更容易" |
| `home` | `home-capabilities` | `props.discoveryEmphasis` | `components/home/CapabilityMatrix.tsx:57` | "被发现" |
| `home` | `home-capabilities` | `props.questionLead` | `components/home/CapabilityMatrix.tsx:57` | "；在 " |
| `home` | `home-capabilities` | `props.questionEmphasis` | `components/home/CapabilityMatrix.tsx:57` | "AI 提问" |
| `home` | `home-capabilities` | `props.recommendationLead` | `components/home/CapabilityMatrix.tsx:57` | " 的答案中更容易被" |
| `home` | `home-capabilities` | `props.recommendationEmphasis` | `components/home/CapabilityMatrix.tsx:57` | "理解、引用与推荐" |
| `home` | `home-capabilities` | `props.ctaHref` | `components/home/CapabilityMatrix.tsx:65` | "/solutions/ai-geo-aeo" |
| `home` | `home-capabilities` | `props.ctaLabel` | `components/home/CapabilityMatrix.tsx:66` | "查看方案" |
| `home` | `home-industries` | `props.title` | `components/home/IndustryTabs.tsx:21` | "行业解决方案" |
| `home` | `home-industries` | `props.painPointsTitle` | `components/home/IndustryTabs.tsx:83` | "客户痛点" |
| `home` | `home-industries` | `props.solutionTitle` | `components/home/IndustryTabs.tsx:123` | "解决方案" |
| `home` | `home-industries` | `props.casesLabel` | `components/home/IndustryTabs.tsx:162` | "查看全部案例" |
| `home` | `home-cases` | `props.title` | `components/home/CaseHighlights.tsx:18` | "用真实交付说话" |
| `home` | `home-cases` | `props.readMoreLabel` | `components/home/CaseHighlights.tsx:81` | "了解更多" |
| `home` | `home-clients` | `props.description` | `components/home/ClientLogos.tsx:78` | "跨行业服务经验 — 真实客户与典型业务场景" |
| `home` | `home-stats-copy` | `props.title` | `components/home/StatsWall.tsx:79` | "用数据证明实力" |
| `home` | `home-stats-copy` | `props.description` | `components/home/StatsWall.tsx:82` | "持续为企业创造可量化的 AI 价值" |
| `home` | `home-ai-search-copy` | `props.flowAriaLabel` | `components/home/AISearchGrowthBanner.tsx:33` | "AI 搜索增长路径" |
| `home` | `home-ai-search-copy` | `props.disclaimer` | `components/home/AISearchGrowthBanner.tsx:45` | "提升进入相关答案的机会，不承诺固定排名或平台推荐。" |
| `site-chrome` | `site-navbar` | `props.homeHref` | `components/ui/Navbar.tsx:45` | "/" |
| `site-chrome` | `site-navbar` | `props.desktopCtaHref` | `components/ui/Navbar.tsx:68` | "/contact" |
| `site-chrome` | `site-navbar` | `props.desktopCtaLabel` | `components/ui/Navbar.tsx:69` | "预约咨询" |
| `site-chrome` | `site-navbar` | `props.menuAriaLabel` | `components/ui/Navbar.tsx:77` | "切换菜单" |
| `site-chrome` | `site-navbar` | `props.mobileCtaHref` | `components/ui/Navbar.tsx:110` | "/contact" |
| `site-chrome` | `site-navbar` | `props.mobileCtaLabel` | `components/ui/Navbar.tsx:113` | "预约咨询" |
| `site-chrome` | `site-footer` | `props.solutionsTitle` | `components/ui/Footer.tsx:70` | "解决方案" |
| `site-chrome` | `site-footer` | `props.solutionsHref` | `components/ui/Footer.tsx:86` | "/solutions" |
| `site-chrome` | `site-footer` | `props.solutionsAllLabel` | `components/ui/Footer.tsx:90` | "查看全部" |
| `site-chrome` | `site-footer` | `props.casesTitle` | `components/ui/Footer.tsx:103` | "客户案例" |
| `site-chrome` | `site-footer` | `props.casesHref` | `components/ui/Footer.tsx:119` | "/cases" |
| `site-chrome` | `site-footer` | `props.casesAllLabel` | `components/ui/Footer.tsx:123` | "查看全部" |
| `site-chrome` | `site-footer` | `props.contactsTitle` | `components/ui/Footer.tsx:136` | "联系我们" |
| `site-chrome` | `site-footer` | `props.emailLabel` | `components/ui/Footer.tsx:140` | "邮箱" |
| `site-chrome` | `site-footer` | `props.wechatLabel` | `components/ui/Footer.tsx:150` | "微信" |
| `home` | `home-hero` | `props.titlePrimary` | `components/home/Hero.tsx` | "AI 智能体与 AI 搜索获客" |
| `home` | `home-hero` | `props.titleSecondary` | `components/home/Hero.tsx` | "重构业务流程，连接增长入口" |
| `home` | `home-hero` | `props.description` | `components/home/Hero.tsx` | "为物流、跨境、制造、电商、金融等行业提供可落地的 AI 解决方案。" |
| `home` | `home-hero` | `props.primaryLabel` | `components/home/Hero.tsx` | "预约 AI 解决方案咨询" |
| `home` | `home-hero` | `props.primaryHref` | `components/home/Hero.tsx` | "/contact" |
| `home` | `home-hero` | `props.secondaryLabel` | `components/home/Hero.tsx` | "查看案例" |
| `home` | `home-hero` | `props.secondaryHref` | `components/home/Hero.tsx` | "/cases/customs-document-ai" |
| `home` | `home-final-cta` | `props.title` | `components/home/FinalCTA.tsx` | "把 AI 用在关键业务上" |
| `home` | `home-final-cta` | `props.description` | `components/home/FinalCTA.tsx` | "从内部提效到 AI 搜索增长，告诉我们你的场景，我们给出可执行的方案。" |
| `home` | `home-final-cta` | `props.label` | `components/home/FinalCTA.tsx` | "预约 AI 方案咨询" |
| `home` | `home-final-cta` | `props.href` | `components/home/FinalCTA.tsx` | "/contact" |
| `blog-detail` | `blog-detail-copy` | `props.reviewedLabel` | `app/blog/[slug]/page.tsx` | "已审核" |
| `solution-detail` | `solution-detail-copy` | `props.geoCtaHref` | `app/solutions/[industry]/page.tsx` | "/contact?service=ai-geo-aeo" |
| `solution-detail` | `solution-detail-copy` | `props.ctaHref` | `app/solutions/[industry]/page.tsx` | "/contact" |

## 验证证据（2026-10-08，云端隔离 worktree）

- W3 契约规模：11 个 pageKey、19 个固定模板 block、213 个命名顶层 props 字段；包含数组的实际字符串叶字段消费测试核验 272 项。
- 红测：原 pages reader 含 SQLite `getRecord/openOperationsDb`；schema 不存在；新白名单校验、order 固定槽位、安全 href、Navbar/Footer enabled、未消费 SEO 检查均在实现前观察失败。
- 迁移前 20 份页面/组件 DOM 与 metadata SHA-256 作为固定 baseline；迁移后逐字节比较通过，未重录通过后的期望来掩盖差异。
- 云端 HEAD `33ef61dad471fa9e6fac6a57ad708d7ac573ee0c` 的详情模板仅在内存读取，追加 38 组默认详情 baseline：9 个行业模板 fixture（含 GEO 条件分支）、11 个案例、18 篇公开文章。实际 AI GEO 专页另有前述 20 份 baseline 中的独立比较。
- 分支 fixture 覆盖：普通/GEO 行业；servicePackages/process/deliverables/measurement/boundaries；联系人有/无二维码和 fallback 名称；文章待审核/已审核/资料来源；移动菜单展开。使用独立内存 resources override，不写原始 data 或 shared-data。
- 272 项修改值同时覆盖对应消费者文本、链接或 JSON-LD/aria 输出；9 类页面 SEO 在 metadata/openGraph 中同步消费；关闭 block、部分 props、刻意空字符串、固定 order、嵌套数组类型、未知字段、跨页 block、安全路径均有正负向检查。
- `test/pages-public-reader.test.ts` 直接运行真实 TypeScript reader/schema，无 operations mock：全部 DEFAULT_PAGES 合法；缺失/JSON fallback 不创建 SQLite；公开 SQLite snapshot 读后文件 hash、权限、文件列表和 sqlite_master 不变。
- 统计 fixture `data/stats.json` SHA-256：`cd650c09def5813fc7d943363b2f90c3cbc962ffea99b45d6550bff6a4426e15`；迁移前后不变。数字、suffix、统计消费表达式保持原资源来源。
- 断线恢复后专项命令：`node --experimental-strip-types --test test/pages-render.test.ts test/pages-public-reader.test.ts`。当前 37/38 通过，唯一剩余为主代理 AppShell enabled flags 未透传；全部默认 baseline、真实无写入、字段消费、schema 与安全检查通过。主代理接线后必须重跑，不把未接通写成已验收。
- 最新全仓 `npm test`：108 项，107 通过、1 失败；唯一失败同上 AppShell enabled 实际消费检查，其他模块测试通过。没有删除、skip 或降低该红测。
- `./node_modules/.bin/tsc --noEmit --incremental false` 已通过，无生成 typecheck 产物；W3 scoped `git diff --check` 通过。全仓 npm test/build/UI/生产验收由主代理串行执行，W3 不运行会写 `.next` 的构建。

## 未覆盖项、风险与交接

1. 主代理 AppShell 的 enabled 透传与 page schema 异常到 HTTP 400 映射，位于 W3 禁写文件；有实际集成测试/接口说明，不越权实现。
2. `components/shared/ContactForm.tsx` 的表单字段、校验、提交成功/失败文案与提交操作；`components/shared/CaseCard.tsx` 的固定入口文案；`components/solutions/AiAnswerDemo.tsx` 演示问答内容；`components/ui/LazyQRContacts.tsx` 客户端二维码交互，不在授权写入范围，不声称全部迁移。
3. 既有公司/联系方式/客户/能力/行业/案例/文章/统计/设置内容继续使用原资源模型；事实、数据指标、关联筛选键、图标、品牌 Logo、版权与分隔标点不复制到可运营 props，不改布局。
4. 固定模板内 enabled 当前粒度：home 分组件；about/contact/列表/详情模板/AI GEO 专页整模板；Chrome 导航/页脚分别隐藏。order 为固定槽位契约，不支持移动段落、拖拽重排或任意新增 block。
5. 测试渲染使用 React DOM server 与 Next link/dynamic/navigation adapter；没有真实浏览器视觉、点击/提交、HTTP 管理员审核发布回滚、完整 Next build 或生产公开页面验收，不以 fixture 或 SSR 替代这些门禁。
6. 回滚依据为主代理分支交付/发布方案；本任务无 commit/deploy/current/main 写入，不执行 shared-data/生产数据操作。并行代理修改保留，不重置整个 worktree。

## 文档与知识库收口

受影响的正式文档仅本页（执行契约、命名字段映射、schema/消费接口、证据、未覆盖项）；其他正式设计/运行/发布文档由主代理按主任务影响范围收口，本 W3 不为完整扩写。MyBooks 不在用户指定的唯一写入范围，W3 不写本机知识库、不手工写 Codex memories；将上述已验证决策/证据和未完成接口交给主代理统一沉淀。状态为云端分支已实现并局部验证，未提交、未部署、未生产验收。
