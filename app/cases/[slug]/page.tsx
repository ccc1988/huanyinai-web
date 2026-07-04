import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, ChevronRight, Target, Lightbulb, TrendingUp, Wrench } from "lucide-react";
import { getCases, getCaseBySlug, getCompany } from "@/lib/data";
import { createMetadata } from "@/lib/seo";
import { getCaseStudyJsonLd } from "@/lib/geo";
import { getCaseVisual } from "@/lib/caseVisuals";

export function generateStaticParams() {
  return getCases().map((c) => ({ slug: c.slug }));
}

export function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  return params.then(({ slug }) => {
    const caseItem = getCaseBySlug(slug);
    if (!caseItem) return {};
    return createMetadata({
      title: caseItem.title,
      description: caseItem.oneLiner,
      path: `/cases/${slug}`,
    });
  });
}

export default async function CaseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const caseItem = getCaseBySlug(slug);

  if (!caseItem) {
    notFound();
  }

  const caseStudyJsonLd = getCaseStudyJsonLd(slug);

  return (
    <div className="pt-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(caseStudyJsonLd) }}
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
            <Link href="/cases" className="hover:text-[var(--color-text-body)] transition-colors">案例</Link>
            <ChevronRight size={14} />
            <span style={{ color: "var(--color-text-body)" }}>{caseItem!.industry}</span>
          </nav>

          {/* Title with Icon - Same line layout */}
          <div className="flex items-start gap-4 mb-4">
            {(() => {
              const { icon: Icon } = getCaseVisual(slug);
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
                {caseItem!.title}
              </h1>
              <p
                className="text-xl mt-3 max-w-3xl"
                style={{ color: "var(--color-text-body)" }}
              >
                {caseItem!.oneLiner}
              </p>
            </div>
          </div>


          {/* Customers */}
          <p className="mt-6 text-sm" style={{ color: "var(--color-text-muted)" }}>
            关联客户：{caseItem!.relatedCustomers.join("、")}
          </p>
        </div>
      </section>

      {/* Pain points */}
      <section className="py-20 relative overflow-hidden" style={{ backgroundColor: "var(--color-bg-elevated)" }}>
        <div className="absolute inset-0 -z-0 section-decor" />
        <div className="container-max max-w-4xl">
          <div className="flex items-center gap-3 mb-8">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "rgba(99,102,241,0.15)" }}
            >
              <Target size={20} style={{ color: "var(--color-accent-light)" }} />
            </div>
            <h2 className="text-2xl font-bold" style={{ color: "var(--color-text-primary)" }}>
              客户痛点
            </h2>
          </div>
          <ul className="space-y-4">
            {caseItem!.painPoints.map((point, i) => (
              <li
                key={i}
                className="glass-card rounded-[var(--radius-md)] p-5 flex items-start gap-3"
              >
                <span
                  className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ backgroundColor: "var(--color-accent)" }}
                />
                <span style={{ color: "var(--color-text-body)" }}>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Solution */}
      <section className="py-20 relative overflow-hidden" style={{ backgroundColor: "var(--color-bg-base)" }}>
        <div className="absolute inset-0 -z-0 grid-bg" />
        <div className="container-max max-w-4xl">
          <div className="flex items-center gap-3 mb-8">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "rgba(99,102,241,0.15)" }}
            >
              <Lightbulb size={20} style={{ color: "var(--color-accent-light)" }} />
            </div>
            <h2 className="text-2xl font-bold" style={{ color: "var(--color-text-primary)" }}>
              解决方案
            </h2>
          </div>
          <div className="glass-card rounded-[var(--radius-lg)] p-8">
            <p
              className="text-lg leading-relaxed"
              style={{ color: "var(--color-text-body)" }}
            >
              {caseItem!.solution}
            </p>
          </div>
        </div>
      </section>

      {/* Customer value */}
      <section className="py-20 relative overflow-hidden" style={{ backgroundColor: "var(--color-bg-elevated)" }}>
        <div className="absolute inset-0 -z-0 section-decor" />
        <div className="container-max max-w-4xl">
          <div className="flex items-center gap-3 mb-8">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "rgba(99,102,241,0.15)" }}
            >
              <TrendingUp size={20} style={{ color: "var(--color-accent-light)" }} />
            </div>
            <h2 className="text-2xl font-bold" style={{ color: "var(--color-text-primary)" }}>
              客户价值
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {caseItem!.customerValue.map((value, i) => (
              <div
                key={i}
                className="glass-card hud-corners rounded-[var(--radius-md)] p-6"
              >
                <span
                  className="text-3xl font-bold block mb-2 font-[family-name:var(--font-heading)]"
                  style={{
                    background: "linear-gradient(135deg, #F8FAFC 0%, #C7D2FE 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p style={{ color: "var(--color-text-body)" }}>{value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Metrics */}
      {caseItem!.metrics && caseItem!.metrics.length > 0 && (
        <section className="py-20" style={{ backgroundColor: "var(--color-bg-base)" }}>
          <div className="container-max max-w-4xl">
            <div className="flex items-center gap-3 mb-8">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: "rgba(99,102,241,0.15)" }}
              >
                <Wrench size={20} style={{ color: "var(--color-accent-light)" }} />
              </div>
              <h2 className="text-2xl font-bold" style={{ color: "var(--color-text-primary)" }}>
                数据指标
              </h2>
            </div>
            <div className="space-y-3">
              {caseItem!.metrics.map((metric, i) => (
                <div
                  key={i}
                  className="glass-card rounded-[var(--radius-md)] p-5 flex items-center gap-3"
                >
                  <span style={{ color: "var(--color-accent-light)" }}>→</span>
                  <span style={{ color: "var(--color-text-body)" }}>{metric}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Scenarios */}
      <section className="py-20" style={{ backgroundColor: "var(--color-bg-elevated)" }}>
        <div className="container-max max-w-4xl">
          <h2 className="text-2xl font-bold mb-8" style={{ color: "var(--color-text-primary)" }}>
            适用场景
          </h2>
          <div className="space-y-3">
            {caseItem!.scenarios.map((scenario, i) => (
              <p key={i} style={{ color: "var(--color-text-body)" }}>
                · {scenario}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 text-center relative overflow-hidden" style={{ backgroundColor: "var(--color-bg-base)" }}>
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
            你的企业也有类似需求？
          </h2>
          <p className="mb-8" style={{ color: "var(--color-text-body)" }}>
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
