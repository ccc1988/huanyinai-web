import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CaseItem } from "@/lib/data";
import CaseIllustration from "./CaseIllustration";

export default function CaseCard({ item }: { item: CaseItem }) {
  return (
    <div className="glass-card rounded-[var(--radius-lg)] flex flex-col group overflow-hidden">
      {/* Illustration header */}
      <CaseIllustration slug={item.slug} />

      <div className="p-8 flex flex-col flex-1">
      {/* Industry badge */}
      <span
        className="text-xs font-medium mb-3"
        style={{ color: "var(--color-text-muted)" }}
      >
        {item.industry}
      </span>

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
      <div className="flex items-center justify-between">
        <Link
          href={`/cases/${item.slug}`}
          className="inline-flex items-center gap-1 text-sm font-medium transition-colors"
          style={{ color: "var(--color-accent-light)" }}
        >
          了解更多
          <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
        </Link>
        <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
          {item.relatedCustomers.join("、")}
        </span>
      </div>
      </div>
    </div>
  );
}
