import Link from "next/link";
import { ArrowRight } from "lucide-react";
import SectionTitle from "@/components/ui/SectionTitle";
import CaseIllustration from "@/components/shared/CaseIllustration";
import { cases } from "@/lib/data";

const highlightSlugs = ["customs-document-ai", "ecommerce-ai-production", "logistics-tracking-ai"];

export default function CaseHighlights() {
  const highlights = cases.filter((c) => highlightSlugs.includes(c.slug));

  return (
    <section className="py-24" style={{ backgroundColor: "var(--color-bg-base)" }}>
      <div className="container-max">
        <SectionTitle>用真实交付说话</SectionTitle>

        <div className="grid md:grid-cols-3 gap-6">
          {highlights.map((item) => (
            <Link
              key={item.slug}
              href={`/cases/${item.slug}`}
              className="glass-card rounded-[var(--radius-lg)] flex flex-col group cursor-pointer overflow-hidden"
            >
              {/* Illustration header */}
              <CaseIllustration slug={item.slug} />

              <div className="p-8 flex flex-col flex-1">
                {/* Title */}
                <h3
                  className="text-xl font-bold mb-3"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  {item.title}
                </h3>

                {/* Tag */}
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
          ))}
        </div>
      </div>
    </section>
  );
}
