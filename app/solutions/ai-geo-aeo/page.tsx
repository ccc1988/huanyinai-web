import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Check,
  ChevronRight,
  ClipboardCheck,
  FileSearch,
  Layers3,
  LineChart,
  ScanSearch,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { createMetadata } from "@/lib/seo";
import { getBreadcrumbJsonLd, getFaqJsonLd, getServiceJsonLd } from "@/lib/geo";
import { getCompany, getIndustryBySlug } from "@/lib/data";
import AiAnswerDemo from "@/components/solutions/AiAnswerDemo";

const industryRecord = getIndustryBySlug("ai-geo-aeo");

if (!industryRecord) {
  throw new Error("AI GEO/AEO solution data is required");
}

const industry = industryRecord;

export const metadata = createMetadata({
  title: industry.metaTitle || industry.title,
  description: industry.metaDescription || industry.subtitle,
  path: "/solutions/ai-geo-aeo",
});

const servicePillars = [
  {
    icon: ScanSearch,
    number: "01",
    title: "目标问句与增长指标",
    summary: "锁定客户在采购、比较与了解服务时会问的问题，把曝光、引用与推荐机会转成可复测的目标。",
    deliverables: ["高价值问句与意图清单", "出现、引用与推荐机会基线", "周期目标与首轮行动优先级"],
  },
  {
    icon: BadgeCheck,
    number: "02",
    title: "企业事实与推荐证据",
    summary: "把企业名称、服务、产品、案例、资质和行业经验整理为 AI 能理解、客户能核验的推荐依据。",
    deliverables: ["企业实体与事实资料表", "产品、案例与行业关联证据", "公开来源与事实冲突修正"],
  },
  {
    icon: Layers3,
    number: "03",
    title: "官网与推荐内容运营",
    summary: "持续优化服务、行业、案例和 FAQ，让客户要比较的信息在官网与内容中有清晰、可引用的答案。",
    deliverables: ["服务、行业、案例与 FAQ 优化", "页面结构、内链与摘要优化", "结构化信息与索引入口检查"],
  },
  {
    icon: FileSearch,
    number: "04",
    title: "可信信源与内容分发",
    summary: "围绕目标问句持续建设可信来源与内容证据，扩大品牌被 AI 理解、引用和比较的有效信号。",
    deliverables: ["信源与内容机会清单", "来源质量和公开授权检查", "分发优先级与发布计划"],
  },
  {
    icon: LineChart,
    number: "05",
    title: "持续代运营与结果复盘",
    summary: "按约定周期复测、调整和复盘，让每一轮优化都围绕目标问句的可见性与咨询机会继续推进。",
    deliverables: ["周期复测与推荐证据索引", "页面与内容变更记录", "阶段结果报告与下一周期计划"],
  },
];

const deliveryRows = [
  ["目标问句与指标方案", "把高价值提问、目标平台与观察口径确定为代运营目标。", "问句清单、抽样条件、基线记录与阶段指标。"],
  ["企业事实与推荐证据包", "让品牌、产品、服务和案例成为可理解、可比较的推荐依据。", "事实表、来源清单、授权与冲突核对记录。"],
  ["官网与内容运营包", "持续补齐客户比较和 AI 理解需要的服务、行业、案例与 FAQ 信息。", "页面优化稿、内容计划、结构化与内链检查。"],
  ["周期结果与优化报告", "复盘目标问句中的出现、引用、推荐机会与后续增长动作。", "带时间戳的复测记录、证据索引、变更清单与下周期计划。"],
];

const customerQuestions = [
  "做企业 AI 定制开发，哪些服务商更适合制造和外贸企业？",
  "向 AI 提问：这家公司的 AI 能力、行业经验和真实案例可靠吗？",
  "如何比较几家跨境物流 AI 解决方案供应商？",
  "企业官网为什么有内容，却不容易被 AI 搜索、AI 问答答案引用或推荐？",
];

const journey = [
  ["锁定问句", "从采购、选型与业务场景中确定高价值目标问题"],
  ["建立基线", "记录品牌、竞品、引用来源与推荐机会"],
  ["持续运营", "优化官网、事实、内容、信源与技术入口"],
  ["证据验收", "在约定条件下复测并留存可追溯记录"],
  ["推动增长", "根据结果继续优化下一周期优先级"],
];

export default function AiGeoAeoPage() {
  const company = getCompany();
  const serviceJsonLd = getServiceJsonLd("ai-geo-aeo");
  const faqJsonLd = getFaqJsonLd(industry.faq);
  const breadcrumbJsonLd = getBreadcrumbJsonLd([
    { name: "首页", url: company.website },
    { name: "解决方案", url: `${company.website}/solutions` },
    { name: industry.title, url: `${company.website}/solutions/ai-geo-aeo` },
  ]);

  return (
    <main className="ai-geo-page pt-24">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <section className="ai-geo-hero relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-60 pointer-events-none" />
        <div className="absolute inset-0 starfield pointer-events-none" />
        <div className="ai-geo-hero-glow pointer-events-none" />
        <div className="ai-geo-hero-inner container-max relative py-12">
          <nav aria-label="面包屑" className="ai-geo-breadcrumb">
            <Link href="/">首页</Link>
            <ChevronRight size={14} aria-hidden="true" />
            <Link href="/solutions">解决方案</Link>
            <ChevronRight size={14} aria-hidden="true" />
            <span>AI 搜索与答案推荐</span>
          </nav>

          <div className="ai-geo-hero-grid mt-12 grid gap-12 lg:grid-cols-2 lg:items-center">
            <div className="ai-geo-hero-copy">
              <p className="ai-geo-kicker">企业 AI 搜索与答案推荐代运营 · GEO / AEO</p>
              <h1 className="ai-geo-hero-title mt-5 text-balance font-bold leading-tight text-[clamp(2.45rem,4.8vw,4.15rem)]" style={{ color: "var(--color-text-primary)" }}>
                <span className="block">让品牌进入</span>
                <span className="block">AI 搜索与答案推荐</span>
              </h1>
              <p className="ai-geo-hero-description mt-6 text-lg leading-8" style={{ color: "var(--color-text-body)" }}>
                围绕目标客户在 AI 搜索、AI 提问与供应商比较时的高价值问题，持续提升品牌、产品与服务在 AI 问答答案中的曝光、引用与推荐机会，并以可监控、可审计、可追溯的证据交付结果。
              </p>
              <div className="ai-geo-hero-actions mt-9 flex flex-col gap-3 sm:flex-row">
                <Link href="/contact?service=ai-geo-aeo" className="cta-primary">
                  申请 AI 搜索增长代运营评估
                  <ArrowRight size={18} aria-hidden="true" />
                </Link>
                <a href="#deliverables" className="cta-secondary">
                  查看可交付服务
                  <ChevronRight size={18} aria-hidden="true" />
                </a>
              </div>
            </div>

            <AiAnswerDemo />
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden py-20 lg:py-28" style={{ backgroundColor: "var(--color-bg-elevated)" }}>
        <div className="absolute inset-0 section-decor pointer-events-none" />
        <div className="container-max relative grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div>
            <p className="ai-geo-kicker">AI 搜索与 AI 问答的结果代运营</p>
            <h2 className="mt-4 text-balance text-[clamp(2rem,4vw,3.25rem)] font-semibold" style={{ color: "var(--color-text-primary)" }}>
              把 AI 搜索与问答答案变成增长入口
            </h2>
          </div>
          <div className="ai-geo-principles">
            <p className="text-lg leading-8" style={{ color: "var(--color-text-body)" }}>
              客户会在 AI 搜索中找服务商，也会通过 AI 提问、AI 问答答案比较和验证供应商。我们以代运营方式持续建设品牌事实、内容与可信信号，推动品牌在目标答案中被发现、引用、推荐，并进入客户的比较和咨询环节。
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {[
                ["锁定目标问句", "覆盖 AI 搜索、提问、比较与咨询场景"],
                ["建设推荐依据", "让产品、案例和行业经验可被理解"],
                ["持续运营优化", "围绕曝光、引用与推荐机会推进"],
                ["证据化结果验收", "每轮保留时间戳、来源与变更记录"],
              ].map(([title, text]) => (
                <div key={title} className="ai-geo-principle">
                  <Check size={16} aria-hidden="true" />
                  <div><strong>{title}</strong><span>{text}</span></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="deliverables" className="relative overflow-hidden py-20 lg:py-28" style={{ backgroundColor: "var(--color-bg-base)" }}>
        <div className="absolute inset-0 grid-bg opacity-40 pointer-events-none" />
        <div className="container-max relative">
          <div className="max-w-3xl">
            <p className="ai-geo-kicker">企业 AI 搜索与答案推荐代运营服务</p>
            <h2 className="mt-4 text-balance text-[clamp(2rem,4vw,3.25rem)] font-semibold" style={{ color: "var(--color-text-primary)" }}>
              围绕 AI 搜索、问答引用与推荐持续代运营
            </h2>
            <p className="mt-5 text-lg leading-8" style={{ color: "var(--color-text-body)" }}>
              从 AI 搜索和 AI 问答的目标问句与基线开始，到内容运营、信源建设与周期复盘，每个阶段都对应增长目标、运营动作和可验收的证据记录。
            </p>
          </div>

          <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {servicePillars.map((service) => {
              const Icon = service.icon;
              return (
                <article key={service.title} className="ai-geo-service-card">
                  <div className="flex items-start justify-between gap-4">
                    <div className="ai-geo-service-icon"><Icon size={23} aria-hidden="true" /></div>
                    <span className="ai-geo-service-number">{service.number}</span>
                  </div>
                  <h3 className="mt-7 text-xl font-bold" style={{ color: "var(--color-text-primary)" }}>{service.title}</h3>
                  <p className="mt-3 leading-7" style={{ color: "var(--color-text-body)" }}>{service.summary}</p>
                  <ul className="mt-6 space-y-2.5">
                    {service.deliverables.map((item) => (
                      <li key={item}><Check size={15} aria-hidden="true" />{item}</li>
                    ))}
                  </ul>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden py-20 lg:py-28" style={{ backgroundColor: "var(--color-bg-elevated)" }}>
        <div className="absolute inset-0 section-decor pointer-events-none" />
        <div className="container-max relative">
          <div className="max-w-3xl">
            <p className="ai-geo-kicker">方法与验证</p>
            <h2 className="mt-4 text-balance text-[clamp(2rem,4vw,3.25rem)] font-semibold" style={{ color: "var(--color-text-primary)" }}>
              从目标问句到结果证据的代运营闭环
            </h2>
          </div>
          <ol className="ai-geo-journey mt-12">
            {journey.map(([title, text], index) => (
              <li key={title}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <h3>{title}</h3>
                <p>{text}</p>
              </li>
            ))}
          </ol>
          <p className="mt-8 max-w-3xl text-sm leading-7" style={{ color: "var(--color-text-muted)" }}>
            每次复测都会固定问句、平台、地区、语言和时间等条件。只有在可比条件下，变化才有解释价值。
          </p>
        </div>
      </section>

      <section className="relative overflow-hidden py-20 lg:py-28" style={{ backgroundColor: "var(--color-bg-base)" }}>
        <div className="absolute inset-0 grid-bg opacity-40 pointer-events-none" />
        <div className="container-max relative">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div className="max-w-3xl">
            <p className="ai-geo-kicker">目标、动作与证据同时交付</p>
              <h2 className="mt-4 text-balance text-[clamp(2rem,4vw,3.25rem)] font-semibold" style={{ color: "var(--color-text-primary)" }}>
              每一轮代运营如何验收
              </h2>
            </div>
            <div className="ai-geo-evidence-note"><ClipboardCheck size={18} aria-hidden="true" />以结果记录与证据包作为交付依据</div>
          </div>
          <div className="ai-geo-delivery-table mt-12">
            <div className="ai-geo-delivery-heading"><span>代运营交付</span><span>目标结果</span><span>证据验收</span></div>
            {deliveryRows.map(([name, purpose, evidence]) => (
              <div key={name} className="ai-geo-delivery-row">
                <strong>{name}</strong>
                <p>{purpose}</p>
                <p>{evidence}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden py-20 lg:py-28" style={{ backgroundColor: "var(--color-bg-elevated)" }}>
        <div className="absolute inset-0 section-decor pointer-events-none" />
        <div className="container-max relative grid gap-12 lg:grid-cols-[0.82fr_1.18fr] lg:items-center">
          <div>
            <p className="ai-geo-kicker">AI 搜索、AI 提问与客户决策场景</p>
            <h2 className="mt-4 text-balance text-[clamp(2rem,4vw,3.25rem)] font-semibold" style={{ color: "var(--color-text-primary)" }}>
              客户会如何搜索、提问与比较
            </h2>
            <p className="mt-5 text-lg leading-8" style={{ color: "var(--color-text-body)" }}>
              我们不堆砌关键词，而是围绕客户在 AI 搜索、AI 提问、采购比较、验证与咨询环节的自然问题，建设企业真正需要回答的信息。
            </p>
          </div>
          <div className="ai-geo-question-list">
            {customerQuestions.map((question, index) => (
              <div key={question}><span>{String(index + 1).padStart(2, "0")}</span><p>{question}</p></div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden py-20 lg:py-28" style={{ backgroundColor: "var(--color-bg-base)" }}>
        <div className="absolute inset-0 grid-bg opacity-40 pointer-events-none" />
        <div className="container-max relative">
          <div className="max-w-3xl">
            <p className="ai-geo-kicker">结果可监控、可审计、可追溯</p>
            <h2 className="mt-4 text-balance text-[clamp(2rem,4vw,3.25rem)] font-semibold" style={{ color: "var(--color-text-primary)" }}>
              用统一口径验收增长结果
            </h2>
          </div>
          <div className="ai-geo-boundaries mt-12">
            <div>
              <BarChart3 size={22} aria-hidden="true" />
              <h3>目标结果</h3>
              <p>围绕目标问句观察 AI 搜索曝光、AI 问答答案中的品牌出现、信息正确性、引用来源、推荐机会、访问与咨询等增长变化。</p>
            </div>
            <div>
              <ShieldCheck size={22} aria-hidden="true" />
              <h3>持续代运营</h3>
              <p>按周期完成问句诊断、官网与内容优化、信源建设、复测复盘与下一轮增长动作。</p>
            </div>
            <div>
              <Sparkles size={22} aria-hidden="true" />
              <h3>证据化验收</h3>
              <p>固定问句、平台、地区、语言和时间条件，交付带时间戳的答案记录、引用来源、变更清单与阶段报告。</p>
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden py-20 lg:py-28" style={{ backgroundColor: "var(--color-bg-elevated)" }}>
        <div className="absolute inset-0 section-decor pointer-events-none" />
        <div className="container-max relative max-w-4xl">
          <div className="text-center">
            <p className="ai-geo-kicker">目标、过程与验收口径</p>
            <h2 className="mt-4 text-balance text-[clamp(2rem,4vw,3.25rem)] font-semibold" style={{ color: "var(--color-text-primary)" }}>
              先把代运营怎么做、怎么验收讲清楚
            </h2>
          </div>
          <div className="mt-12 space-y-3">
            {industry.faq.map((item) => (
              <details key={item.q} className="ai-geo-faq">
                <summary>{item.q}<ChevronRight size={18} aria-hidden="true" /></summary>
                <p>{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="ai-geo-final-cta relative overflow-hidden py-20 lg:py-24">
        <div className="absolute inset-0 grid-bg opacity-35 pointer-events-none" />
        <div className="absolute inset-0 starfield pointer-events-none" />
        <div className="container-max relative text-center">
          <p className="ai-geo-kicker">从目标问句开始，持续走向增长结果</p>
          <h2 className="mx-auto mt-4 max-w-3xl text-balance text-[clamp(2rem,4vw,3.25rem)] font-semibold" style={{ color: "var(--color-text-primary)" }}>
            让品牌进入客户的 AI 搜索与答案推荐
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8" style={{ color: "var(--color-text-body)" }}>
            提供官网、核心服务与目标客户问题。我们先完成代运营评估，明确品牌在 AI 搜索和 AI 问答答案中的当前机会、目标问句、增长指标与首轮行动计划。
          </p>
          <Link href="/contact?service=ai-geo-aeo" className="cta-primary mt-9">
            申请 AI 搜索增长代运营评估
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </div>
      </section>
    </main>
  );
}
