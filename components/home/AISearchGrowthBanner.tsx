import Link from "next/link";
import { ArrowRight, Check, SearchCheck } from "lucide-react";
import type { AiSearchGrowthContent } from "@/lib/data";

export default function AISearchGrowthBanner({ content }: { content: AiSearchGrowthContent }) {
  return (
    <section
      aria-labelledby="ai-search-growth-title"
      className="relative overflow-hidden border-y py-20 sm:py-24"
      style={{
        backgroundColor: "var(--color-bg-elevated)",
        borderColor: "var(--color-border-default)",
      }}
    >
      <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
      <div className="container-max relative grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div>
          <div className="mb-5 flex items-center gap-3 text-sm font-medium" style={{ color: "var(--color-accent-light)" }}>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ backgroundColor: "rgba(99,102,241,0.14)", border: "1px solid rgba(99,102,241,0.28)" }}>
              <SearchCheck size={18} aria-hidden="true" />
            </span>
            <span>{content.eyebrow}</span>
          </div>
          <h2 id="ai-search-growth-title" className="max-w-2xl text-3xl font-bold leading-tight sm:text-4xl" style={{ color: "var(--color-text-primary)" }}>
            {content.title}
          </h2>
          <p className="mt-6 max-w-2xl text-base leading-8 sm:text-lg" style={{ color: "var(--color-text-body)" }}>
            {content.description}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link href={content.primaryCtaHref} className="cta-primary justify-center">
              {content.primaryCtaLabel}
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
            <Link href={content.secondaryCtaHref} className="cta-secondary justify-center">
              {content.secondaryCtaLabel}
            </Link>
          </div>
        </div>

        <div className="relative lg:pl-8">
          <div className="absolute bottom-8 left-0 top-8 hidden w-px lg:block" style={{ backgroundColor: "rgba(99,102,241,0.32)" }} />
          <p className="mb-5 text-sm font-medium uppercase tracking-[0.12em]" style={{ color: "var(--color-text-muted)" }}>
            从 AI 曝光到高意向咨询
          </p>
          <ol className="space-y-3">
            {content.flow.map((step, index) => (
              <li key={`${step}-${index}`} className="flex items-center gap-4 border-b py-3 last:border-b-0" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold" style={{ backgroundColor: "rgba(99,102,241,0.14)", color: "var(--color-accent-light)" }}>
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="text-base font-medium" style={{ color: "var(--color-text-primary)" }}>{step}</span>
                {index === content.flow.length - 1 && <Check size={17} className="ml-auto" style={{ color: "#4ade80" }} aria-hidden="true" />}
              </li>
            ))}
          </ol>
          <p className="mt-5 text-xs leading-6" style={{ color: "var(--color-text-muted)" }}>
            “推荐候选”表示提高进入相关答案的机会，不代表固定排名、收录或平台推荐保证。
          </p>
        </div>
      </div>
    </section>
  );
}
