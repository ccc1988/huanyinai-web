
import { getPageFields, isPageBlockEnabled, getPageSeo } from "@/lib/content/pages";
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

export function generateMetadata() {
  return createMetadata(getPageSeo("ai-geo-aeo", {
  title: industry.metaTitle || industry.title,
  description: industry.metaDescription || industry.subtitle,
  path: "/solutions/ai-geo-aeo",
}));
}









export default function AiGeoAeoPage() {
  const copy = getPageFields("ai-geo-content");
  if (!isPageBlockEnabled("ai-geo-content")) return null;
  const servicePillars = copy.servicePillars.map((item, index) => ({ ...item, icon: [ScanSearch, BadgeCheck, Layers3, FileSearch, LineChart][index] }));
  const deliveryRows = copy.deliveryRows;
  const customerQuestions = copy.customerQuestions;
  const journey = copy.journey;
  const company = getCompany();
  const serviceJsonLd = getServiceJsonLd("ai-geo-aeo");
  const faqJsonLd = getFaqJsonLd(industry.faq);
  const breadcrumbJsonLd = getBreadcrumbJsonLd([
    { name: copy.homeBreadcrumbName, url: company.website },
    { name: copy.solutionsBreadcrumbName, url: `${company.website}/solutions` },
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
          <nav aria-label={copy.breadcrumbAriaLabel} className="ai-geo-breadcrumb">
            <Link href={copy.homeHref}>{copy.homeLabel}</Link>
            <ChevronRight size={14} aria-hidden="true" />
            <Link href={copy.solutionsHref}>{copy.solutionsLabel}</Link>
            <ChevronRight size={14} aria-hidden="true" />
            <span>{copy.breadcrumbLabel}</span>
          </nav>

          <div className="ai-geo-hero-grid mt-12 grid gap-12 lg:grid-cols-2 lg:items-center">
            <div className="ai-geo-hero-copy">
              <p className="ai-geo-kicker">{copy.heroEyebrow}</p>
              <h1 className="ai-geo-hero-title mt-5 text-balance font-bold leading-tight text-[clamp(2.45rem,4.8vw,4.15rem)]" style={{ color: "var(--color-text-primary)" }}>
                <span className="block">{copy.titlePrimary}</span>
                <span className="block">{copy.titleSecondary}</span>
              </h1>
              <p className="ai-geo-hero-description mt-6 text-lg leading-8" style={{ color: "var(--color-text-body)" }}>{copy.heroDescription}</p>
              <div className="ai-geo-hero-actions mt-9 flex flex-col gap-3 sm:flex-row">
                <Link href={copy.primaryHref} className="cta-primary">{copy.primaryLabel}<ArrowRight size={18} aria-hidden="true" />
                </Link>
                <a href={copy.secondaryHref} className="cta-secondary">{copy.secondaryLabel}<ChevronRight size={18} aria-hidden="true" />
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
            <p className="ai-geo-kicker">{copy.introEyebrow}</p>
            <h2 className="mt-4 text-balance text-[clamp(2rem,4vw,3.25rem)] font-semibold" style={{ color: "var(--color-text-primary)" }}>{copy.introTitle}</h2>
          </div>
          <div className="ai-geo-principles">
            <p className="text-lg leading-8" style={{ color: "var(--color-text-body)" }}>{copy.introDescription}</p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {copy.principles.map(([title, text]) => (
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
            <p className="ai-geo-kicker">{copy.pillarsEyebrow}</p>
            <h2 className="mt-4 text-balance text-[clamp(2rem,4vw,3.25rem)] font-semibold" style={{ color: "var(--color-text-primary)" }}>{copy.pillarsTitle}</h2>
            <p className="mt-5 text-lg leading-8" style={{ color: "var(--color-text-body)" }}>{copy.pillarsDescription}</p>
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
            <p className="ai-geo-kicker">{copy.journeyEyebrow}</p>
            <h2 className="mt-4 text-balance text-[clamp(2rem,4vw,3.25rem)] font-semibold" style={{ color: "var(--color-text-primary)" }}>{copy.journeyTitle}</h2>
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
          <p className="mt-8 max-w-3xl text-sm leading-7" style={{ color: "var(--color-text-muted)" }}>{copy.journeyDescription}</p>
        </div>
      </section>

      <section className="relative overflow-hidden py-20 lg:py-28" style={{ backgroundColor: "var(--color-bg-base)" }}>
        <div className="absolute inset-0 grid-bg opacity-40 pointer-events-none" />
        <div className="container-max relative">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div className="max-w-3xl">
            <p className="ai-geo-kicker">{copy.deliverablesEyebrow}</p>
              <h2 className="mt-4 text-balance text-[clamp(2rem,4vw,3.25rem)] font-semibold" style={{ color: "var(--color-text-primary)" }}>{copy.deliverablesTitle}</h2>
            </div>
            <div className="ai-geo-evidence-note"><ClipboardCheck size={18} aria-hidden="true" />{copy.deliverablesCaption}</div>
          </div>
          <div className="ai-geo-delivery-table mt-12">
            <div className="ai-geo-delivery-heading"><span>{copy.deliveryColumnLabel}</span><span>{copy.outcomeColumnLabel}</span><span>{copy.evidenceColumnLabel}</span></div>
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
            <p className="ai-geo-kicker">{copy.questionsEyebrow}</p>
            <h2 className="mt-4 text-balance text-[clamp(2rem,4vw,3.25rem)] font-semibold" style={{ color: "var(--color-text-primary)" }}>{copy.questionsTitle}</h2>
            <p className="mt-5 text-lg leading-8" style={{ color: "var(--color-text-body)" }}>{copy.questionsDescription}</p>
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
            <p className="ai-geo-kicker">{copy.resultsEyebrow}</p>
            <h2 className="mt-4 text-balance text-[clamp(2rem,4vw,3.25rem)] font-semibold" style={{ color: "var(--color-text-primary)" }}>{copy.resultsTitle}</h2>
          </div>
          <div className="ai-geo-boundaries mt-12">
            <div>
              <BarChart3 size={22} aria-hidden="true" />
              <h3>{copy.outcomeTitle}</h3>
              <p>{copy.outcomeDescription}</p>
            </div>
            <div>
              <ShieldCheck size={22} aria-hidden="true" />
              <h3>{copy.operationsTitle}</h3>
              <p>{copy.operationsDescription}</p>
            </div>
            <div>
              <Sparkles size={22} aria-hidden="true" />
              <h3>{copy.evidenceTitle}</h3>
              <p>{copy.evidenceDescription}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden py-20 lg:py-28" style={{ backgroundColor: "var(--color-bg-elevated)" }}>
        <div className="absolute inset-0 section-decor pointer-events-none" />
        <div className="container-max relative max-w-4xl">
          <div className="text-center">
            <p className="ai-geo-kicker">{copy.faqEyebrow}</p>
            <h2 className="mt-4 text-balance text-[clamp(2rem,4vw,3.25rem)] font-semibold" style={{ color: "var(--color-text-primary)" }}>{copy.faqTitle}</h2>
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
          <p className="ai-geo-kicker">{copy.ctaEyebrow}</p>
          <h2 className="mx-auto mt-4 max-w-3xl text-balance text-[clamp(2rem,4vw,3.25rem)] font-semibold" style={{ color: "var(--color-text-primary)" }}>{copy.ctaTitle}</h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8" style={{ color: "var(--color-text-body)" }}>{copy.ctaDescription}</p>
          <Link href={copy.ctaHref} className="cta-primary mt-9">{copy.ctaLabel}<ArrowRight size={18} aria-hidden="true" />
          </Link>
        </div>
      </section>
    </main>
  );
}
