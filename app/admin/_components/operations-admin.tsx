"use client";

import type { ReactNode } from "react";

export { adminFetch, adminJson, ensureCsrfToken, jsonRequest } from "./admin-http";

export function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString("zh-CN", { hour12: false });
}

export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 1024) return `${bytes || 0} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

const statusLabels: Record<string, string> = {
  active: "启用",
  expired: "已到期",
  revoked: "已撤销",
  needs_recovery: "待恢复",
  disabled: "停用",
  archived: "已归档",
  draft: "草稿",
  submitted: "待审核",
  approved: "已批准",
  published: "已发布",
  unpublished: "已下线",
  pending: "处理中",
  committed: "已完成",
  failed: "失败",
  deleted: "已删除",
};

export function StatusBadge({ status }: { status: string }) {
  const tone = ["active", "approved", "published", "committed"].includes(status)
    ? "bg-emerald-400/10 text-emerald-300 border-emerald-400/20"
    : ["failed", "disabled", "deleted", "expired", "revoked"].includes(status)
      ? "bg-rose-400/10 text-rose-300 border-rose-400/20"
      : "bg-amber-400/10 text-amber-300 border-amber-400/20";
  return <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs ${tone}`}>{statusLabels[status] || status}</span>;
}

export function AdminPage({
  eyebrow,
  title,
  description,
  actions,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="w-full min-w-0 space-y-5 break-words">
      <div className="flex flex-col gap-4 border-b pb-5 lg:flex-row lg:items-end lg:justify-between" style={{ borderColor: "var(--color-border-default)" }}>
        <div className="min-w-0">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em]" style={{ color: "var(--color-accent-light)" }}>{eyebrow}</p>
          <h1 className="text-2xl font-semibold" style={{ color: "var(--color-text-primary)" }}>{title}</h1>
          <p className="mt-2 max-w-3xl text-sm" style={{ color: "var(--color-text-muted)" }}>{description}</p>
        </div>
        {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
      </div>
      {children}
    </div>
  );
}

export function Panel({ title, description, children, className = "" }: { title?: string; description?: string; children: ReactNode; className?: string }) {
  return (
    <section className={`min-w-0 rounded-[var(--radius-md)] border p-3 sm:p-5 ${className}`} style={{ backgroundColor: "var(--color-bg-elevated)", borderColor: "var(--color-border-default)" }}>
      {title ? <div className="mb-4"><h2 className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>{title}</h2>{description ? <p className="mt-1 text-xs" style={{ color: "var(--color-text-muted)" }}>{description}</p> : null}</div> : null}
      {children}
    </section>
  );
}

export function Notice({ tone = "info", children }: { tone?: "info" | "success" | "error" | "warning"; children: ReactNode }) {
  const styles = {
    info: "border-sky-400/20 bg-sky-400/10 text-sky-200",
    success: "border-emerald-400/20 bg-emerald-400/10 text-emerald-200",
    error: "border-rose-400/20 bg-rose-400/10 text-rose-200",
    warning: "border-amber-400/20 bg-amber-400/10 text-amber-200",
  };
  return <div role={tone === "error" ? "alert" : "status"} aria-live="polite" className={`min-w-0 break-words [overflow-wrap:anywhere] rounded-[var(--radius-sm)] border px-3 py-2 text-sm ${styles[tone]}`}>{children}</div>;
}

export function Button({ variant = "secondary", children, className = "", ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "danger" | "ghost" }) {
  const variants = {
    primary: "bg-indigo-500 text-white hover:bg-indigo-400",
    secondary: "border border-slate-600 bg-slate-800/60 text-slate-200 hover:border-slate-500 hover:bg-slate-700/70",
    danger: "border border-rose-400/30 bg-rose-400/10 text-rose-200 hover:bg-rose-400/20",
    ghost: "text-slate-300 hover:bg-slate-800/70 hover:text-white",
  };
  return <button type="button" {...props} className={`max-w-full whitespace-normal focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-400 rounded-[var(--radius-sm)] px-3 py-2 text-sm transition disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}>{children}</button>;
}

export function FieldLabel({ children }: { children: ReactNode }) {
  return <label className="mb-1.5 block text-xs font-medium" style={{ color: "var(--color-text-muted)" }}>{children}</label>;
}

export function EmptyState({ children }: { children: ReactNode }) {
  return <div className="rounded-[var(--radius-sm)] border border-dashed p-8 text-center text-sm" style={{ borderColor: "var(--color-border-default)", color: "var(--color-text-muted)" }}>{children}</div>;
}

export const resourceOptions = [
  ["blog-posts", "博客"],
  ["cases", "案例"],
  ["industries", "行业方案"],
  ["company", "公司信息"],
  ["pages", "结构化页面"],
  ["customers", "客户与信任证明"],
  ["capabilities", "能力"],
  ["stats", "保护统计数据"],
  ["contacts", "联系信息"],
  ["settings", "站点设置与 SEO"],
] as const;

export type Feedback = { tone: "error" | "success" | "warning"; text: string } | null;
export function messageOf(error: unknown) { return error instanceof Error ? error.message : "操作失败，请核对输入和当前状态"; }
export function PasswordReview({ value, onChange, disabled = false }: { value: string; onChange: (value: string) => void; disabled?: boolean }) {
  return <label className="block text-sm">近期复核：管理员密码<input aria-label="管理员复核密码" type="password" autoComplete="off" value={value} onChange={event => onChange(event.target.value)} disabled={disabled} className="form-input mt-2 w-full min-w-0" /><span className="mt-1 block text-xs text-slate-400">仅用于本次危险操作，提交或取消后清除；不写入浏览器存储。</span></label>;
}
export function ConfirmAction({ title, description, password, onPassword, onConfirm, onCancel, busy }: { title: string; description: string; password: string; onPassword: (value: string) => void; onConfirm: () => void; onCancel: () => void; busy: boolean }) {
  return <Panel title={title} description={description}><div className="space-y-3"><PasswordReview value={password} onChange={onPassword} disabled={busy} /><div className="flex flex-wrap gap-2"><Button variant="danger" disabled={busy || !password.trim()} onClick={onConfirm}>{busy ? "执行中…" : "确认执行"}</Button><Button disabled={busy} onClick={onCancel}>取消</Button></div></div></Panel>;
}
