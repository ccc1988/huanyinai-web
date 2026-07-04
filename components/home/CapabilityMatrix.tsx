import { Bot, FileText, Workflow, BarChart3 } from "lucide-react";
import SectionTitle from "@/components/ui/SectionTitle";
import { getCapabilities } from "@/lib/data";

const iconMap: Record<string, React.ElementType> = {
  Bot,
  FileText,
  Workflow,
  BarChart3,
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
  return (
    <section className="section-decor py-24 relative" style={{ backgroundColor: "var(--color-bg-base)" }}>
      {/* 背景网格装饰 */}
      <div className="absolute inset-0 grid-bg opacity-50 pointer-events-none" />

      <div className="container-max relative">
        <SectionTitle subtitle="四大能力模块，覆盖企业 AI 转型全链路">
          从 AI 智能体到数据智能，全栈交付
        </SectionTitle>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {capabilities.map((cap, idx) => {
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
