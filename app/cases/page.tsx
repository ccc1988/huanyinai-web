import Link from "next/link";
import { ArrowRight, ChevronRight, FolderOpen } from "lucide-react";
import { getCases, type CaseItem } from "@/lib/data";
import { createMetadata } from "@/lib/seo";
import CaseCard from "@/components/shared/CaseCard";

export const metadata = createMetadata({
  title: "精选公开案例 — AI 系统落地实践",
  description:
    "寰引智能精选公开案例，覆盖报关 AI 文档处理、跨境物流智能系统、跨境电商 AI 生产、物流轨迹追踪、电商智能客服、RPA 自动化等领域。",
  path: "/cases",
});

// 行业分组顺序（与 solutions 页面保持一致）
const INDUSTRY_ORDER = [
  "报关",
  "跨境物流",
  "跨境电商",
  "物流",
  "电商客服",
  "RPA",
];

// 行业图标映射
const INDUSTRY_ICONS: Record<string, string> = {
  报关: "📄",
  跨境物流: "🚚",
  跨境电商: "🛒",
  物流: "📦",
  电商客服: "💬",
  RPA: "🤖",
};

export default function CasesPage() {
  const allCases = getCases();

  // 按行业分组
  const grouped = INDUSTRY_ORDER.map((industry) => ({
    industry,
    cases: allCases.filter((c) => c.industry === industry),
  })).filter((g) => g.cases.length > 0);

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
            <span style={{ color: "var(--color-text-body)" }}>客户案例</span>
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
              <FolderOpen size={28} style={{ color: "var(--color-accent-light)" }} />
            </div>
            <h1
              className="font-bold leading-tight"
              style={{
                color: "var(--color-text-primary)",
                fontSize: "clamp(2rem, 4vw, 3rem)",
              }}
            >
              客户案例
            </h1>
          </div>
          <p
            className="text-xl max-w-3xl"
            style={{ color: "var(--color-text-body)" }}
          >
            精选 {allCases.length} 个公开案例，覆盖 {grouped.length} 大行业场景，从痛点诊断到系统交付的真实实践
          </p>

          {/* Stats bar */}
          <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-3">
            <div className="flex items-baseline gap-2">
              <span
                className="text-2xl font-bold font-[family-name:var(--font-heading)]"
                style={{
                  background: "linear-gradient(135deg, #F8FAFC 0%, #C7D2FE 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {allCases.length}
              </span>
              <span className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                精选公开案例
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span
                className="text-2xl font-bold font-[family-name:var(--font-heading)]"
                style={{
                  background: "linear-gradient(135deg, #F8FAFC 0%, #C7D2FE 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {grouped.length}
              </span>
              <span className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                行业覆盖
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Industry Sections */}
      {grouped.map((group, gIdx) => (
        <section
          key={group.industry}
          className="py-16 relative overflow-hidden"
          style={{
            backgroundColor:
              gIdx % 2 === 0 ? "var(--color-bg-elevated)" : "var(--color-bg-base)",
          }}
        >
          {gIdx % 2 === 1 && <div className="absolute inset-0 -z-0 grid-bg" />}
          <div className="container-max relative z-10">
            {/* Section header */}
            <div className="flex items-center gap-3 mb-8">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                style={{
                  backgroundColor: "rgba(99,102,241,0.12)",
                  border: "1px solid rgba(99,102,241,0.2)",
                }}
              >
                <span className="text-lg">{INDUSTRY_ICONS[group.industry] || "📋"}</span>
              </div>
              <div>
                <h2
                  className="text-2xl font-bold"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  {group.industry}
                </h2>
                <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                  {group.cases.length} 个案例
                </p>
              </div>
            </div>

            {/* Case cards grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {group.cases.map((item: CaseItem) => (
                <CaseCard key={item.slug} item={item} />
              ))}
            </div>
          </div>
        </section>
      ))}

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
