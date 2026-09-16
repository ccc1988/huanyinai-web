import Link from "next/link";
import { ArrowRight, SearchCheck } from "lucide-react";
import type { AiSearchGrowthContent } from "@/lib/data";

export default function AISearchGrowthBanner({ content }: { content: AiSearchGrowthContent }) {
  return (
    <section
      aria-labelledby="ai-search-growth-title"
      className="relative overflow-hidden border-y py-8 sm:py-10"
      style={{
        backgroundColor: "var(--color-bg-base)",
        borderColor: "var(--color-border-default)",
      }}
    >
      <div className="absolute inset-0 grid-bg opacity-15 pointer-events-none" />
      <div className="container-max relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between lg:gap-16">
        <div className="min-w-0">
          <div className="mb-3 flex items-center gap-2 text-sm font-medium" style={{ color: "var(--color-accent-light)" }}>
            <span className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ backgroundColor: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.24)" }}>
              <SearchCheck size={18} aria-hidden="true" />
            </span>
            <span>{content.eyebrow}</span>
          </div>
          <h2 id="ai-search-growth-title" className="max-w-2xl text-2xl font-bold leading-tight sm:text-3xl" style={{ color: "var(--color-text-primary)" }}>
            {content.title}
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 sm:text-base" style={{ color: "var(--color-text-body)" }}>
            {content.description}
          </p>
        </div>

        <div className="ai-growth-floating-card relative shrink-0 rounded-[var(--radius-md)] p-4 sm:p-5 lg:w-[30rem]">
          <div className="ai-growth-flow" aria-label="AI 搜索增长路径">
            {content.flow.map((step, index) => (
              <span key={`${step}-${index}`} className="contents">
                <span className="ai-growth-flow-step">
                  <span className="ai-growth-flow-dot" aria-hidden="true" />
                  <span>{step}</span>
                </span>
                {index < content.flow.length - 1 && <span className="ai-growth-flow-line" aria-hidden="true" />}
              </span>
            ))}
          </div>
          <p className="mt-3 text-xs leading-5" style={{ color: "var(--color-text-muted)" }}>
            提升进入相关答案的机会，不承诺固定排名或平台推荐。
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Link href={content.primaryCtaHref} className="cta-primary justify-center px-5 py-2.5 text-sm">
              {content.primaryCtaLabel}
              <ArrowRight size={17} aria-hidden="true" />
            </Link>
            <Link href={content.secondaryCtaHref} className="text-sm font-medium transition-colors hover:text-[var(--color-text-primary)]" style={{ color: "var(--color-text-muted)" }}>
              {content.secondaryCtaLabel}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
