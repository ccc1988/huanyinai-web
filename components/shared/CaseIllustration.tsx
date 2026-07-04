import { getCaseVisual } from "@/lib/caseVisuals";

/**
 * 案例卡片头部装饰图
 * 纯 SVG/CSS 实现，无外部图片依赖
 */
export default function CaseIllustration({ slug }: { slug: string }) {
  const { icon: Icon, pattern } = getCaseVisual(slug);

  return (
    <div
      className="relative h-32 overflow-hidden rounded-t-[var(--radius-lg)] flex items-center justify-center"
      style={{
        background: "linear-gradient(135deg, rgba(99,102,241,0.08), rgba(26,29,39,0.6))",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {/* Decorative grid pattern */}
      <svg
        className="absolute inset-0 opacity-30"
        width="100%"
        height="100%"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern id={`grid-${slug}`} width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#grid-${slug})`} />
      </svg>

      {/* Pattern-specific decorations */}
      <PatternVisual pattern={pattern} />

      {/* Center icon */}
      <div
        className="relative z-10 w-14 h-14 rounded-2xl flex items-center justify-center"
        style={{
          backgroundColor: "rgba(99,102,241,0.15)",
          border: "1px solid rgba(99,102,241,0.3)",
        }}
      >
        <Icon size={28} style={{ color: "var(--color-accent-light)" }} />
      </div>

      {/* Corner glow */}
      <div
        className="absolute -top-12 -right-12 w-32 h-32 rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)",
        }}
      />
    </div>
  );
}

function PatternVisual({ pattern }: { pattern: string }) {
  switch (pattern) {
    case "document":
      return (
        <svg className="absolute left-4 top-4 opacity-20" width="48" height="48" viewBox="0 0 48 48" fill="none">
          <rect x="6" y="4" width="24" height="32" rx="2" stroke="#6366F1" strokeWidth="1" />
          <line x1="10" y1="10" x2="26" y2="10" stroke="#6366F1" strokeWidth="0.5" />
          <line x1="10" y1="14" x2="26" y2="14" stroke="#6366F1" strokeWidth="0.5" />
          <line x1="10" y1="18" x2="22" y2="18" stroke="#6366F1" strokeWidth="0.5" />
          <rect x="20" y="20" width="22" height="28" rx="2" stroke="#8B5CF6" strokeWidth="1" />
          <line x1="24" y1="26" x2="38" y2="26" stroke="#8B5CF6" strokeWidth="0.5" />
          <line x1="24" y1="30" x2="38" y2="30" stroke="#8B5CF6" strokeWidth="0.5" />
        </svg>
      );
    case "tracking":
      return (
        <svg className="absolute left-4 top-4 opacity-20" width="48" height="48" viewBox="0 0 48 48" fill="none">
          <circle cx="12" cy="12" r="4" stroke="#6366F1" strokeWidth="1" />
          <circle cx="36" cy="36" r="4" stroke="#8B5CF6" strokeWidth="1" />
          <path d="M16 14 Q24 20 32 32" stroke="#6366F1" strokeWidth="0.5" strokeDasharray="2 2" />
          <path d="M12 18 L12 36 L32 36" stroke="#6366F1" strokeWidth="0.5" strokeDasharray="2 2" />
        </svg>
      );
    case "chat":
      return (
        <svg className="absolute left-4 top-4 opacity-20" width="48" height="48" viewBox="0 0 48 48" fill="none">
          <path d="M4 8 L40 8 L40 28 L20 28 L12 36 L12 28 L4 28 Z" stroke="#6366F1" strokeWidth="1" fill="none" />
          <circle cx="14" cy="18" r="2" fill="#6366F1" />
          <circle cx="22" cy="18" r="2" fill="#6366F1" />
          <circle cx="30" cy="18" r="2" fill="#6366F1" />
        </svg>
      );
    case "table":
      return (
        <svg className="absolute left-4 top-4 opacity-20" width="48" height="48" viewBox="0 0 48 48" fill="none">
          <rect x="4" y="4" width="40" height="36" rx="2" stroke="#6366F1" strokeWidth="1" />
          <line x1="4" y1="12" x2="44" y2="12" stroke="#6366F1" strokeWidth="0.5" />
          <line x1="4" y1="20" x2="44" y2="20" stroke="#6366F1" strokeWidth="0.5" />
          <line x1="4" y1="28" x2="44" y2="28" stroke="#6366F1" strokeWidth="0.5" />
          <line x1="18" y1="4" x2="18" y2="40" stroke="#6366F1" strokeWidth="0.5" />
          <line x1="30" y1="4" x2="30" y2="40" stroke="#6366F1" strokeWidth="0.5" />
        </svg>
      );
    case "production":
      return (
        <svg className="absolute left-4 top-4 opacity-20" width="48" height="48" viewBox="0 0 48 48" fill="none">
          <rect x="4" y="8" width="16" height="16" rx="2" stroke="#6366F1" strokeWidth="1" />
          <rect x="16" y="16" width="16" height="16" rx="2" stroke="#8B5CF6" strokeWidth="1" />
          <rect x="28" y="24" width="16" height="16" rx="2" stroke="#6366F1" strokeWidth="1" />
          <path d="M20 16 L16 16 M32 24 L28 24" stroke="#6366F1" strokeWidth="0.5" strokeDasharray="1 1" />
        </svg>
      );
    case "flow":
      return (
        <svg className="absolute left-4 top-4 opacity-20" width="48" height="48" viewBox="0 0 48 48" fill="none">
          <rect x="4" y="8" width="14" height="12" rx="2" stroke="#6366F1" strokeWidth="1" />
          <rect x="30" y="8" width="14" height="12" rx="2" stroke="#8B5CF6" strokeWidth="1" />
          <rect x="17" y="28" width="14" height="12" rx="2" stroke="#6366F1" strokeWidth="1" />
          <path d="M18 14 L30 14 M24 20 L24 28" stroke="#6366F1" strokeWidth="0.5" />
        </svg>
      );
    case "stamp":
      return (
        <svg className="absolute left-4 top-4 opacity-20" width="48" height="48" viewBox="0 0 48 48" fill="none">
          <circle cx="20" cy="20" r="12" stroke="#6366F1" strokeWidth="1" />
          <circle cx="20" cy="20" r="8" stroke="#8B5CF6" strokeWidth="0.5" strokeDasharray="2 1" />
          <path d="M32 32 L42 42" stroke="#6366F1" strokeWidth="1" />
        </svg>
      );
    case "dashboard":
      return (
        <svg className="absolute left-4 top-4 opacity-20" width="48" height="48" viewBox="0 0 48 48" fill="none">
          <rect x="4" y="4" width="40" height="8" rx="1" stroke="#6366F1" strokeWidth="0.5" />
          <rect x="4" y="16" width="18" height="14" rx="1" stroke="#6366F1" strokeWidth="0.5" />
          <rect x="26" y="16" width="18" height="14" rx="1" stroke="#8B5CF6" strokeWidth="0.5" />
          <rect x="4" y="34" width="40" height="10" rx="1" stroke="#6366F1" strokeWidth="0.5" />
          <rect x="7" y="38" width="8" height="2" fill="#6366F1" opacity="0.5" />
          <rect x="7" y="42" width="14" height="2" fill="#6366F1" opacity="0.3" />
        </svg>
      );
    default:
      return null;
  }
}
