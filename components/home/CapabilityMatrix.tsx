import { ArrowRight, BarChart3, Bot, FileText, Search, Workflow } from "lucide-react";
import Link from "next/link";
import SectionTitle from "@/components/ui/SectionTitle";
import { getCapabilities } from "@/lib/data";

const iconMap: Record<string, React.ElementType> = {
  Bot,
  FileText,
  Workflow,
  BarChart3,
  Search,
};

/* 每张卡片的独特渐变色 */
const cardGradients = [
  "linear-gradient(90deg, #6366F1, #818CF8)",
  "linear-gradient(90deg, #8B5CF6, #A78BFA)",
  "linear-gradient(90deg, #06B6D4, #22D3EE)",
  "linear-gradient(90deg, #6366F1, #8B5CF6)",
];

const iconBgGradients = [
  "linear-gradient(135deg, rgba(99,102,241,0.2), rgba(99,102,241,0.05))",
  "linear-gradient(135deg, rgba(139,92,246,0.2), rgba(139,92,246,0.05))",
  "linear-gradient(135deg, rgba(6,182,212,0.2), rgba(6,182,212,0.05))",
  "linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.08))",
];

export default function CapabilityMatrix() {
  const capabilities = getCapabilities();
  const featured = capabilities.find((cap) => cap.module === "AI 搜索增长");
  const standardCapabilities = capabilities.filter((cap) => cap.module !== "AI 搜索增长");
  return (
    <section className="section-decor py-24 relative" style={{ backgroundColor: "var(--color-bg-base)" }}>
      {/* 背景网格装饰 */}
      <div className="absolute inset-0 grid-bg opacity-50 pointer-events-none" />

      <div className="container-max relative">
        <SectionTitle subtitle="从业务提效到增长获客，为企业提供可落地的 AI 产品与实施服务。">
          AI 应用与增长服务
        </SectionTitle>

        {featured && (
          <div className="ai-capability-featured glass-card glass-card-accent mb-8 rounded-[var(--radius-lg)] p-6 sm:p-7 relative overflow-hidden">
            <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl" style={{ background: "linear-gradient(135deg, rgba(6,182,212,0.2), rgba(74,222,128,0.08))", border: "1px solid rgba(34,211,238,0.28)" }}>
                    <Search size={28} style={{ color: "#67e8f9" }} aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-[0.12em]" style={{ color: "#67e8f9" }}>AI 搜索增长 · GEO / AEO</p>
                    <h3 className="sr-only">{featured.module}</h3>
                  </div>
                </div>
                <p className="mt-4 text-base leading-7 lg:whitespace-nowrap" style={{ color: "var(--color-text-body)" }}>
                  让品牌、产品与服务在 <span className="font-semibold underline decoration-cyan-300/60 underline-offset-4" style={{ color: "#67e8f9" }}>AI 搜索</span> 中更容易<span className="font-semibold underline decoration-cyan-300/60 underline-offset-4" style={{ color: "var(--color-text-primary)" }}>被发现</span>；在 <span className="font-semibold underline decoration-cyan-300/60 underline-offset-4" style={{ color: "#67e8f9" }}>AI 提问</span> 的答案中更容易被<span className="font-semibold underline decoration-cyan-300/60 underline-offset-4" style={{ color: "var(--color-text-primary)" }}>理解、引用与推荐</span>。
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {featured.products.map((product) => (
                    <span key={product} className="pill-tag text-xs">{product}</span>
                  ))}
                </div>
              </div>
              <Link href="/solutions/ai-geo-aeo" className="cta-secondary whitespace-nowrap justify-center">
                查看方案
                <ArrowRight size={17} aria-hidden="true" />
              </Link>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {standardCapabilities.map((cap, idx) => {
            const Icon = iconMap[cap.icon] || Bot;
            return (
              <div
                key={cap.module}
                className="glass-card glass-card-accent rounded-[var(--radius-lg)] p-8 flex flex-col relative group"
              >
                {/* 顶部渐变色条 — 始终可见 */}
                <div
                  className="absolute top-0 left-0 right-0 h-[3px] rounded-t-[var(--radius-lg)]"
                  style={{ background: cardGradients[idx % cardGradients.length] }}
                />

                {/* Icon — 放大 + 渐变背景 */}
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-200 group-hover:scale-110"
                  style={{
                    background: iconBgGradients[idx % iconBgGradients.length],
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <Icon size={28} style={{ color: "var(--color-accent-light)" }} />
                </div>

                {/* Title */}
                <h3
                  className="text-xl font-bold mb-4"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  {cap.module}
                </h3>

                {/* Products list */}
                <ul className="space-y-2.5 flex-1">
                  {cap.products.map((product) => (
                    <li
                      key={product}
                      className="text-sm flex items-start gap-2.5"
                      style={{ color: "var(--color-text-body)" }}
                    >
                      <span
                        className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ backgroundColor: "var(--color-accent)" }}
                      />
                      {product}
                    </li>
                  ))}
                </ul>

                {/* 底部微妙装饰线 */}
                <div
                  className="mt-6 pt-4"
                  style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}
                >
                  <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                    {cap.scenarios}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
