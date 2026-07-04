import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, ChevronRight } from "lucide-react";
import { industries, getIndustryBySlug, getCasesByIndustry, company } from "@/lib/data";
import { createMetadata } from "@/lib/seo";
import { getServiceJsonLd, getFaqJsonLd } from "@/lib/geo";
import { getIndustryIcon } from "@/lib/industryIcons";
import CaseCard from "@/components/shared/CaseCard";

export function generateStaticParams() {
  return industries.map((ind) => ({ industry: ind.slug }));
}

export function generateMetadata({ params }: { params: Promise<{ industry: string }> }) {
  return params.then(({ industry: slug }) => {
    const ind = getIndustryBySlug(slug);
    if (!ind) return {};
    return createMetadata({
      title: ind.title,
      description: ind.subtitle,
      path: `/solutions/${slug}`,
    });
  });
}

export default async function SolutionPage({
  params,
}: {
  params: Promise<{ industry: string }>;
}) {
  const { industry: slug } = await params;
  const industry = getIndustryBySlug(slug);

  if (!industry) {
    notFound();
  }

  const relatedCases = getCasesByIndustry(slug);
  const serviceJsonLd = getServiceJsonLd(slug);
  const faqJsonLd = getFaqJsonLd(industry!.faq);

  return (
    <div className="pt-24">
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* Hero */}
      <section className="py-20 relative overflow-hidden" style={{ backgroundColor: "var(--color-bg-base)" }}>
        {/* Background layers */}
        <div className="absolute inset-0 -z-0 grid-bg" />
        <div className="absolute inset-0 -z-0 starfield" />
        {/* Decorative glow */}
        <div
          className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full opacity-60"
          style={{ background: "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)", transform: "translate(30%, -30%)" }}
        />
        <div
          className="absolute bottom-0 left-0 w-96 h-96 rounded-full opacity-40"
          style={{ background: "radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)", transform: "translate(-20%, 30%)" }}
        />
        <div className="container-max relative z-10">
          {/* Breadcrumb */}
          <nav className="inline-flex items-center gap-2 text-sm mb-8 px-4 py-2 rounded-full" style={{ color: "var(--color-text-muted)", backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <Link href="/" className="hover:text-[var(--color-text-body)] transition-colors">首页</Link>
            <ChevronRight size={14} />
            <Link href="/solutions/customs" className="hover:text-[var(--color-text-body)] transition-colors">解决方案</Link>
            <ChevronRight size={14} />
            <span style={{ color: "var(--color-text-body)" }}>{industry!.title.replace(/ AI 解决方案.*/, "")}</span>
          </nav>

          {/* Title with Icon - Same line layout */}
          <div className="flex items-start gap-4 mb-4">
            {(() => {
              const Icon = getIndustryIcon(slug);
              return (
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor: "rgba(99,102,241,0.15)",
                    border: "1px solid rgba(99,102,241,0.3)",
                  }}
                >
                  <Icon size={32} style={{ color: "var(--color-accent-light)" }} />
                </div>
              );
            })()}
            
            <div className="flex-1 pt-2">
              <h1
                className="font-bold leading-tight"
                style={{
                  color: "var(--color-text-primary)",
                  fontSize: "clamp(2rem, 4vw, 3rem)",
                }}
              >
                {industry!.title}
              </h1>
              <p
                className="text-xl mt-3 max-w-3xl"
                style={{ color: "var(--color-text-body)" }}
              >
                {industry!.subtitle}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pain points */}
      <section className="py-20 relative overflow-hidden" style={{ backgroundColor: "var(--color-bg-elevated)" }}>
        <div className="absolute inset-0 -z-0 section-decor" />
        <div className="container-max">
          <h2
            className="text-3xl font-bold mb-8"
            style={{ color: "var(--color-text-primary)" }}
          >
            行业痛点
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {industry!.painPoints.map((point, i) => (
              <div
                key={i}
                className="glass-card hud-corners rounded-[var(--radius-md)] p-6 flex items-start gap-4"
              >
                <span
                  className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-bold"
                  style={{
                    backgroundColor: "rgba(99,102,241,0.15)",
                    color: "var(--color-accent-light)",
                  }}
                >
                  {i + 1}
                </span>
                <p style={{ color: "var(--color-text-body)" }}>{point}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solution */}
      <section className="py-20 relative overflow-hidden" style={{ backgroundColor: "var(--color-bg-base)" }}>
        <div className="absolute inset-0 -z-0 grid-bg" />
        <div className="container-max">
          <h2
            className="text-3xl font-bold mb-8"
            style={{ color: "var(--color-text-primary)" }}
          >
            寰引解决方案
          </h2>
          <div
            className="glass-card rounded-[var(--radius-lg)] p-8 max-w-4xl"
          >
            <p
              className="text-lg leading-relaxed"
              style={{ color: "var(--color-text-body)" }}
            >
              {industry!.solutionSummary}
            </p>
          </div>
        </div>
      </section>

      {/* Related cases */}
      {relatedCases.length > 0 && (
        <section className="py-20 relative overflow-hidden" style={{ backgroundColor: "var(--color-bg-elevated)" }}>
          <div className="absolute inset-0 -z-0 section-decor" />
          <div className="container-max">
            <h2
              className="text-3xl font-bold mb-8"
              style={{ color: "var(--color-text-primary)" }}
            >
              关联案例
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedCases.map((c) => (
                <CaseCard key={c.slug} item={c} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ */}
      <section className="py-20 relative overflow-hidden" style={{ backgroundColor: "var(--color-bg-base)" }}>
        <div className="absolute inset-0 -z-0 grid-bg" />
        <div className="container-max max-w-4xl">
          <h2
            className="text-3xl font-bold mb-8"
            style={{ color: "var(--color-text-primary)" }}
          >
            常见问题
          </h2>
          <div className="space-y-4">
            {industry!.faq.map((item, i) => (
              <div
                key={i}
                className="glass-card hud-corners rounded-[var(--radius-md)] p-6"
              >
                <h3
                  className="font-semibold mb-2"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  {item.q}
                </h3>
                <p
                  className="text-base leading-relaxed"
                  style={{ color: "var(--color-text-body)" }}
                >
                  {item.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        className="py-20 text-center relative overflow-hidden"
        style={{ backgroundColor: "var(--color-bg-base)" }}
      >
        <div className="absolute inset-0 -z-0 grid-bg" />
        <div
          className="absolute top-1/2 left-1/2 w-[600px] h-[400px] rounded-full opacity-30 -z-0"
          style={{ background: "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)", transform: "translate(-50%, -50%)" }}
        />
        <div className="container-max relative z-10">
          <h2
            className="text-3xl font-bold mb-4"
            style={{ color: "var(--color-text-primary)" }}
          >
            想了解更多？
          </h2>
          <p
            className="mb-8"
            style={{ color: "var(--color-text-body)" }}
          >
            告诉我们你的业务场景，我们给出可落地的 AI 方案
          </p>
          <Link href="/contact" className="cta-primary">
            预约免费咨询
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
}
