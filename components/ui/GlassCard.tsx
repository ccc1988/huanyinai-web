import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function GlassCard({
  children,
  href,
  className = "",
}: {
  children: React.ReactNode;
  href?: string;
  className?: string;
}) {
  const content = (
    <div className={`glass-card rounded-[var(--radius-lg)] p-8 h-full ${className}`}>
      {children}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block cursor-pointer h-full group">
        {content}
      </Link>
    );
  }

  return content;
}

/** 卡片底部"了解更多"链接 */
export function CardLink({ href, children = "了解更多" }: { href: string; children?: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1 text-sm font-medium transition-colors"
      style={{ color: "var(--color-accent-light)" }}
    >
      {children}
      <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
    </Link>
  );
}
