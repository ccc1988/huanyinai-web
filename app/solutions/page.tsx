import Link from "next/link";
import { ArrowRight, ChevronRight, Layers } from "lucide-react";
import { getIndustries, getCasesByIndustry } from "@/lib/data";
import { createMetadata } from "@/lib/seo";
import { getIndustryIcon } from "@/lib/industryIcons";

export const metadata = createMetadata({
  title: "行业 AI 解决方案 — 6 大行业全链路交付",
  description:
    "寰引智能为报关、跨境物流、跨境电商、制造外贸、供应链、电商客服 6 大行业提供 AI 智能体、AI 文档处理、RPA 自动化全链路解决方案。",
  path: "/solutions",
});

export default function SolutionsPage() {
  const industries = getIndustries();

  return (
    <div className="pt-24">
      {/* Hero */}
      <section
        className="py-20 relative overflow-hidden"
        style={{ backgroundColor: "var(--color-bg-base)" }}
      >
        <div className="absolute inset-0 -z-0 grid-bg" />
        <div className="absolute inset-0 -z-0 starfield" />
        <div
          className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full opacity-60"
          style={{
            background:
              "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)",
            transform: "translate(30%, -30%)",
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-96 h-96 rounded-full opacity-40"
          style={{
            background:
              "radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)",
            transform: "translate(-20%, 30%)",
          }}
        />
        <div className="container-max relative z-10">
          {/* Breadcrumb */}
          <nav
            className="inline-flex items-center gap-2 text-sm mb-8 px-4 py-2 rounded-full"
            style={{
              color: "var(--color-text-muted)",
              backgroundColor: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <Link
              href="/"
              className="hover:text-[var(--color-text-body)] transition-colors"
            >
              首页
            </Link>
            <ChevronRight size={14} />
            <span style={{ color: "var(--color-text-body)" }}>解决方案</span>
          </nav>

          {/* Title */}
          <div className="flex items-center gap-4 mb-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
              style={{
                backgroundColor: "rgba(99,102,241,0.15)",
                border: "1px solid rgba(99,102,241,0.3)",
              }}
            >
              <Layers size={28} style={{ color: "var(--color-accent-light)" }} />
            </div>
            <h1
              className="font-bold leading-tight"
              style={{
                color: "var(--color-text-primary)",
                fontSize: "clamp(2rem, 4vw, 3rem)",
              }}
            >
              行业 AI 解决方案
            </h1>
          </div>
          <p
            className="text-xl max-w-3xl"
            style={{ color: "var(--color-text-body)" }}
          >
            6 大行业、11+ 落地系统，从痛点诊断到智能体交付的全链路服务
          </p>
        </div>
      </section>

      {/* Industry Cards Grid */}
      <section
        className="py-20 relative overflow-hidden"
        style={{ backgroundColor: "var(--color-bg-elevated)" }}
      >
        <div className="absolute inset-0 -z-0 section-decor" />
        <div className="container-max">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {industries.map((ind, idx) => {
              const Icon = getIndustryIcon(ind.slug);
              const shortName = ind.title.replace(/(行业)?\s*AI\s*解决方案.*/, "").trim();
              const caseCount = getCasesByIndustry(ind.slug).length;

              return (
                <Link
                  key={ind.slug}
                  href={`/solutions/${ind.slug}`}
                  className="glass-card hud-corners glass-card-accent rounded-[var(--radius-lg)] p-8 flex flex-col group cursor-pointer"
                >
                  {/* Header: Icon + Number */}
                  <div className="flex items-start justify-between mb-5">
                    <div
                      className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-105"
                      style={{
                        backgroundColor: "rgba(99,102,241,0.12)",
                        border: "1px solid rgba(99,102,241,0.25)",
                      }}
                    >
                      <Icon
                        size={28}
                        style={{ color: "var(--color-accent-light)" }}
                      />
                    </div>
                    <span
                      className="text-3xl font-bold font-mono leading-none opacity-20"
                      style={{ color: "var(--color-text-primary)" }}
                    >
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                  </div>

                  {/* Title */}
                  <h3
                    className="text-xl font-bold mb-2"
                    style={{ color: "var(--color-text-primary)" }}
                  >
                    {shortName}
                  </h3>

                  {/* Subtitle */}
                  <p
                    className="text-sm mb-5 leading-relaxed"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    {ind.subtitle}
                  </p>

                  {/* Divider */}
                  <div className="gradient-divider mb-5" />

                  {/* Pain points */}
                  <ul className="space-y-2 mb-5 flex-1">
                    {ind.painPoints.slice(0, 3).map((point, i) => (
                      <li
                        key={i}
                        className="text-sm flex items-start gap-2"
                        style={{ color: "var(--color-text-body)" }}
                      >
                        <span
                          className="mt-1.5 w-1 h-1 rounded-full shrink-0"
                          style={{ backgroundColor: "var(--color-accent)" }}
                        />
                        <span className="line-clamp-1">{point}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Solution summary */}
                  <p
                    className="text-xs leading-relaxed mb-5 px-4 py-3 rounded-lg"
                    style={{
                      color: "var(--color-text-muted)",
                      backgroundColor: "rgba(99,102,241,0.06)",
                      border: "1px solid rgba(99,102,241,0.12)",
                    }}
                  >
                    {ind.solutionSummary}
                  </p>

                  {/* Footer: Case count + Link */}
                  <div
                    className="flex items-center justify-between pt-1"
                  >
                    {caseCount > 0 && (
                      <span
                        className="text-xs font-medium"
                        style={{ color: "var(--color-text-muted)" }}
                      >
                        {caseCount} 个关联案例
                      </span>
                    )}
                    <span
                      className="inline-flex items-center gap-1 text-sm font-medium transition-colors ml-auto"
                      style={{ color: "var(--color-accent-light)" }}
                    >
                      查看方案
                      <ArrowRight
                        size={14}
                        className="transition-transform group-hover:translate-x-1"
                      />
                    </span>
                  </div>
                </Link>
              );
            })}
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
          style={{
            background:
              "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)",
            transform: "translate(-50%, -50%)",
          }}
        />
        <div className="container-max relative z-10">
          <h2
            className="text-3xl font-bold mb-4"
            style={{ color: "var(--color-text-primary)" }}
          >
            不确定哪个方案适合你？
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
