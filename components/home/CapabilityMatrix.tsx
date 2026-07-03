import { Bot, FileText, Workflow, BarChart3 } from "lucide-react";
import SectionTitle from "@/components/ui/SectionTitle";
import { capabilities } from "@/lib/data";

const iconMap: Record<string, React.ElementType> = {
  Bot,
  FileText,
  Workflow,
  BarChart3,
};

export default function CapabilityMatrix() {
  return (
    <section className="py-24" style={{ backgroundColor: "var(--color-bg-base)" }}>
      <div className="container-max">
        <SectionTitle subtitle="四大能力模块，覆盖企业 AI 转型全链路">
          从 AI 智能体到数据智能，全栈交付
        </SectionTitle>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {capabilities.map((cap) => {
            const Icon = iconMap[cap.icon] || Bot;
            return (
              <div key={cap.module} className="glass-card rounded-[var(--radius-lg)] p-8 flex flex-col">
                {/* Icon */}
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center mb-6"
                  style={{
                    backgroundColor: "rgba(99,102,241,0.15)",
                  }}
                >
                  <Icon size={24} style={{ color: "var(--color-accent-light)" }} />
                </div>

                {/* Title */}
                <h3
                  className="text-xl font-bold mb-4"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  {cap.module}
                </h3>

                {/* Products list */}
                <ul className="space-y-2 flex-1">
                  {cap.products.map((product) => (
                    <li
                      key={product}
                      className="text-sm flex items-start gap-2"
                      style={{ color: "var(--color-text-body)" }}
                    >
                      <span
                        className="mt-1.5 w-1 h-1 rounded-full shrink-0"
                        style={{ backgroundColor: "var(--color-accent)" }}
                      />
                      {product}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
