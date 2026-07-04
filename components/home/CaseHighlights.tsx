import Link from "next/link";
import { ArrowRight, TrendingUp } from "lucide-react";
import SectionTitle from "@/components/ui/SectionTitle";
import CaseIllustration from "@/components/shared/CaseIllustration";
import { cases } from "@/lib/data";

const highlightSlugs = ["customs-document-ai", "ecommerce-ai-production", "logistics-tracking-ai"];

export default function CaseHighlights() {
  const highlights = cases.filter((c) => highlightSlugs.includes(c.slug));

  return (
    <section className="section-decor py-24 relative" style={{ backgroundColor: "var(--color-bg-base)" }}>
      {/* 背景装饰 */}
      <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
      <div className="container-max relative">
        <SectionTitle>用真实交付说话</SectionTitle>

        <div className="grid md:grid-cols-3 gap-6">
          {highlights.map((item) => {
            const firstMetric = item.metrics?.[0];
            return (
            <Link
              key={item.slug}
              href={`/cases/${item.slug}`}
              className="glass-card rounded-[var(--radius-lg)] flex flex-col group cursor-pointer overflow-hidden hover:border-[var(--color-border-hover)]"
            >
              {/* Illustration header */}
              <CaseIllustration slug={item.slug} />

              <div className="p-8 flex flex-col flex-1">
                {/* 数据指标亮点 */}
                {firstMetric && (
                  <div
                    className="flex items-center gap-2 mb-4 px-3 py-2 rounded-lg"
                    style={{
                      backgroundColor: "rgba(99,102,241,0.06)",
                      border: "1px solid rgba(99,102,241,0.12)",
                    }}
                  >
                    <TrendingUp size={14} style={{ color: "var(--color-accent-light)" }} />
                    <span className="text-xs font-medium" style={{ color: "var(--color-accent-light)" }}>
                      {firstMetric.length > 30 ? firstMetric.slice(0, 30) + "…" : firstMetric}
                    </span>
                  </div>
                )}

                {/* Title */}
                <h3
                  className="text-xl font-bold mb-3"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  {item.title}
                </h3>

                {/* Tags */}
                {item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {item.tags.map((tag) => (
                      <span key={tag} className="pill-tag text-xs">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Summary */}
                <p
                  className="text-sm leading-relaxed flex-1 mb-4"
                  style={{ color: "var(--color-text-body)" }}
                >
                  {item.oneLiner}
                </p>

                {/* Link */}
                <span
                  className="inline-flex items-center gap-1 text-sm font-medium transition-colors"
                  style={{ color: "var(--color-accent-light)" }}
                >
                  了解更多
                  <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
