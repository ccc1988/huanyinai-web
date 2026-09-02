"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown, BarChart3, Check, ChevronLeft, ChevronRight, Save, RefreshCw } from "lucide-react";
import type { ContentAction } from "@/lib/siteAnalytics";

type Dashboard = {
  days: number;
  totals: { visits: number; engagedViews: number; ctaClicks: number; inquiries: number };
  content: Array<{ path: string; title: string; contentType: string; industry: string; visits: number; engagedViews: number; ctaClicks: number; inquiries: number; source: string; status: string }>;
  sources: Array<{ source: string; visits: number; pages: number; engagedViews: number; ctaClicks: number; inquiries: number; lastVisit: string }>;
  actions: ContentAction[];
  health: { complete: boolean; incompleteEvents: number; lastErrorAt?: string };
  updatedAt: string;
};

type ContentRow = Dashboard["content"][number];
type SortKey = "title" | "contentType" | "visits" | "engagedViews" | "ctaClicks" | "inquiries" | "source" | "status";
type SortState = { key: SortKey; direction: "asc" | "desc" };
type PageSize = 25 | 50 | 100 | "all";

const sourceLabels: Record<string, string> = { google: "Google 来源", bing: "Bing 来源", baidu: "百度来源", chatgpt: "ChatGPT 来源", claude: "Claude 来源", perplexity: "Perplexity 来源", external: "外部网站", direct: "直接/未知" };
const typeLabels: Record<string, string> = { case: "案例", solution: "行业方案", blog: "博客" };
const actionLabels: Record<ContentAction["action"], string> = { "expand-case": "扩写案例", "add-faq-links": "补 FAQ/内链", "optimize-cta": "优化 CTA", "optimize-intro": "优化首段", observe: "继续观察" };

export default function SeoInsightsPage() {
  const [days, setDays] = useState(30);
  const [data, setData] = useState<Dashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sort, setSort] = useState<SortState>({ key: "inquiries", direction: "desc" });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState<PageSize>(25);
  const [form, setForm] = useState({ path: "", action: "observe" as ContentAction["action"], owner: "", period: "", status: "planned" as ContentAction["status"], note: "" });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/seo-insights?days=${days}`, { cache: "no-store" });
      if (response.ok) setData(await response.json());
    } finally { setLoading(false); }
  }, [days]);

  useEffect(() => { void load(); }, [load]);

  const selectedTitle = useMemo(() => data?.content.find((item) => item.path === form.path)?.title || form.path, [data, form.path]);

  const sortedContent = useMemo(() => {
    if (!data) return [];
    return [...data.content].sort((left, right) => {
      const leftValue = sortValue(left, sort.key);
      const rightValue = sortValue(right, sort.key);
      const result = typeof leftValue === "number" && typeof rightValue === "number"
        ? leftValue - rightValue
        : String(leftValue).localeCompare(String(rightValue), "zh-CN");
      return (sort.direction === "asc" ? result : -result) || left.path.localeCompare(right.path);
    });
  }, [data, sort]);

  const pageCount = pageSize === "all" ? 1 : Math.max(1, Math.ceil(sortedContent.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const visibleContent = pageSize === "all"
    ? sortedContent
    : sortedContent.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const pageNumbers = getPageNumbers(pageCount, currentPage);

  const updateSort = (key: SortKey) => {
    setSort((current) => current.key === key
      ? { key, direction: current.direction === "asc" ? "desc" : "asc" }
      : { key, direction: key === "title" || key === "contentType" || key === "source" || key === "status" ? "asc" : "desc" });
    setPage(1);
  };

  const saveAction = async () => {
    if (!form.path || !form.owner.trim() || !form.period.trim()) return;
    setSaving(true);
    try {
      const response = await fetch("/api/admin/seo-insights", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}` }),
      });
      if (response.ok) {
        setForm({ path: "", action: "observe", owner: "", period: "", status: "planned", note: "" });
        await load();
      }
    } finally { setSaving(false); }
  };

  if (loading && !data) return <div className="py-20 text-center" style={{ color: "var(--color-text-muted)" }}>加载中...</div>;
  if (!data) return <div className="py-20 text-center" style={{ color: "var(--color-text-muted)" }}>统计暂时不可用</div>;

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 size={22} style={{ color: "var(--color-accent-light)" }} />
            <h1 className="text-2xl font-bold" style={{ color: "var(--color-text-primary)" }}>内容方向</h1>
          </div>
          <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>只统计官网自己的访问、行为和咨询归因，不是搜索引擎后台数据。</p>
        </div>
        <div className="flex items-center gap-2">
          {[7, 30, 90].map((value) => <button key={value} onClick={() => setDays(value)} className="px-3 py-2 rounded-[var(--radius-sm)] text-sm cursor-pointer" style={{ backgroundColor: days === value ? "var(--color-accent)" : "var(--color-bg-elevated)", color: days === value ? "white" : "var(--color-text-muted)" }}>{value} 天</button>)}
          <button title="刷新统计" aria-label="刷新统计" onClick={() => void load()} className="p-2 cursor-pointer" style={{ color: "var(--color-text-muted)" }}><RefreshCw size={17} /></button>
        </div>
      </header>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Metric label="页面访问" value={data.totals.visits} />
        <Metric label="有效阅读" value={data.totals.engagedViews} />
        <Metric label="CTA 点击" value={data.totals.ctaClicks} />
        <Metric label="咨询提交" value={data.totals.inquiries} />
      </section>

      <div className="flex items-center justify-between text-xs" style={{ color: "var(--color-text-muted)" }}>
        <span>{data.health.complete ? "数据完整" : `数据不完整，已有 ${data.health.incompleteEvents} 次写入失败记录`}</span>
        <span>最近更新：{data.updatedAt === new Date(0).toISOString() ? "暂无数据" : new Date(data.updatedAt).toLocaleString("zh-CN")}</span>
      </div>

      <section>
        <h2 className="text-lg font-bold mb-3" style={{ color: "var(--color-text-primary)" }}>来源概览</h2>
        <div className="overflow-x-auto glass-card rounded-[var(--radius-md)]"><table className="w-full text-left text-sm min-w-[700px]"><thead><tr style={{ borderBottom: "1px solid var(--color-border-default)", color: "var(--color-text-muted)" }}><th className="p-4 font-medium">来源</th><th className="p-4 font-medium">访问</th><th className="p-4 font-medium">页面数</th><th className="p-4 font-medium">有效阅读</th><th className="p-4 font-medium">CTA</th><th className="p-4 font-medium">咨询</th><th className="p-4 font-medium">最近访问</th></tr></thead><tbody>{data.sources.map((item) => <tr key={item.source} style={{ borderBottom: "1px solid var(--color-border-default)" }}><td className="p-4" style={{ color: "var(--color-text-primary)" }}>{sourceLabels[item.source] || item.source}</td><td className="p-4">{item.visits}</td><td className="p-4">{item.pages}</td><td className="p-4">{item.engagedViews}</td><td className="p-4">{item.ctaClicks}</td><td className="p-4">{item.inquiries}</td><td className="p-4" style={{ color: "var(--color-text-muted)" }}>{item.lastVisit}</td></tr>)}</tbody></table></div>
      </section>

      <section className="glass-card rounded-[var(--radius-md)] p-5">
        <h2 className="text-lg font-bold mb-1" style={{ color: "var(--color-text-primary)" }}>记录下一步内容动作</h2>
        <p className="text-xs mb-4" style={{ color: "var(--color-text-muted)" }}>这是人工复盘记录，不会自动修改或发布官网内容。</p>
        <div className="grid md:grid-cols-2 gap-3">
          <select value={form.path} onChange={(e) => setForm({ ...form, path: e.target.value })} className="form-input"><option value="">选择页面</option>{data.content.map((item) => <option key={item.path} value={item.path}>{item.title}</option>)}</select>
          <select value={form.action} onChange={(e) => setForm({ ...form, action: e.target.value as ContentAction["action"] })} className="form-input">{Object.entries(actionLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select>
          <input value={form.owner} onChange={(e) => setForm({ ...form, owner: e.target.value })} placeholder="负责人" className="form-input" />
          <input value={form.period} onChange={(e) => setForm({ ...form, period: e.target.value })} placeholder="计划周期，如 2026-09" className="form-input" />
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as ContentAction["status"] })} className="form-input"><option value="planned">计划中</option><option value="done">已完成</option><option value="skipped">暂不处理</option></select>
          <input value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="备注（可选）" className="form-input" />
        </div>
        {form.path && <p className="text-xs mt-3" style={{ color: "var(--color-text-muted)" }}>当前页面：{selectedTitle}</p>}
        <button onClick={() => void saveAction()} disabled={saving || !form.path || !form.owner.trim() || !form.period.trim()} className="mt-4 flex items-center gap-2 px-4 py-2 rounded-[var(--radius-sm)] text-sm cursor-pointer disabled:opacity-50" style={{ backgroundColor: "var(--color-accent)", color: "white" }}><Save size={16} />{saving ? "保存中..." : "保存动作"}</button>
      </section>

      {data.actions.length > 0 && <section><h2 className="text-lg font-bold mb-3" style={{ color: "var(--color-text-primary)" }}>最近动作</h2><div className="space-y-2">{data.actions.slice(0, 10).map((action) => <div key={action.id} className="flex flex-wrap items-center gap-3 p-3 rounded-[var(--radius-sm)]" style={{ backgroundColor: "var(--color-bg-elevated)" }}><Check size={16} style={{ color: action.status === "done" ? "#4ade80" : "var(--color-text-muted)" }} /><span className="text-sm" style={{ color: "var(--color-text-primary)" }}>{actionLabels[action.action]}</span><span className="text-xs" style={{ color: "var(--color-text-muted)" }}>{action.path} · {action.owner} · {action.period}</span><span className="text-xs ml-auto" style={{ color: "var(--color-text-muted)" }}>{action.status === "done" ? "已完成" : action.status === "skipped" ? "暂不处理" : "计划中"}</span></div>)}</div></section>}

      <section>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between mb-3">
          <div><h2 className="text-lg font-bold" style={{ color: "var(--color-text-primary)" }}>内容表现</h2><p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>共 {sortedContent.length} 个内容页面，默认按咨询、有效阅读、访问、CTA 降序。</p></div>
          <label className="flex items-center gap-2 text-xs" style={{ color: "var(--color-text-muted)" }}>每页
            <select aria-label="每页条数" value={pageSize} onChange={(e) => { const value = e.target.value; setPageSize(value === "all" ? "all" : Number(value) as PageSize); setPage(1); }} className="form-input py-2 w-[92px]"><option value={25}>25</option><option value={50}>50</option><option value={100}>100</option><option value="all">全部</option></select>
          </label>
        </div>
        <div className="overflow-x-auto glass-card rounded-[var(--radius-md)]">
          <table className="w-full text-left text-sm min-w-[900px]"><thead><tr style={{ borderBottom: "1px solid var(--color-border-default)", color: "var(--color-text-muted)" }}>
            <SortableHeader label="内容" sortKey="title" sort={sort} onSort={updateSort} /><SortableHeader label="类型" sortKey="contentType" sort={sort} onSort={updateSort} /><SortableHeader label="访问" sortKey="visits" sort={sort} onSort={updateSort} /><SortableHeader label="阅读" sortKey="engagedViews" sort={sort} onSort={updateSort} /><SortableHeader label="CTA" sortKey="ctaClicks" sort={sort} onSort={updateSort} /><SortableHeader label="咨询" sortKey="inquiries" sort={sort} onSort={updateSort} /><SortableHeader label="主要来源" sortKey="source" sort={sort} onSort={updateSort} /><SortableHeader label="方向" sortKey="status" sort={sort} onSort={updateSort} />
          </tr></thead><tbody>{visibleContent.map((item) => <tr key={item.path} style={{ borderBottom: "1px solid var(--color-border-default)" }}>
            <td className="p-4"><div style={{ color: "var(--color-text-primary)" }}>{item.title}</div><div className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>{item.path}</div></td>
            <td className="p-4" style={{ color: "var(--color-text-muted)" }}>{typeLabels[item.contentType] || item.contentType}</td><td className="p-4" style={{ color: "var(--color-text-body)" }}>{item.visits}</td><td className="p-4" style={{ color: "var(--color-text-body)" }}>{item.engagedViews}</td><td className="p-4" style={{ color: "var(--color-text-body)" }}>{item.ctaClicks}</td><td className="p-4 font-medium" style={{ color: item.inquiries ? "#f59e0b" : "var(--color-text-body)" }}>{item.inquiries}</td><td className="p-4" style={{ color: "var(--color-text-muted)" }}>{sourceLabels[item.source] || item.source}</td><td className="p-4"><span className="text-xs px-2 py-1 rounded" style={{ backgroundColor: item.status === "重点关注" ? "rgba(34,197,94,.15)" : "rgba(148,163,184,.12)", color: item.status === "重点关注" ? "#4ade80" : "var(--color-text-muted)" }}>{item.status}</span></td>
          </tr>)}</tbody></table>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mt-3 text-xs" style={{ color: "var(--color-text-muted)" }}>
          <span>{sortedContent.length === 0 ? "暂无内容" : `显示 ${(currentPage - 1) * (pageSize === "all" ? sortedContent.length : pageSize) + 1}-${Math.min(currentPage * (pageSize === "all" ? sortedContent.length : pageSize), sortedContent.length)} / ${sortedContent.length}`}</span>
          {pageCount > 1 && <nav aria-label="内容表现分页" className="flex items-center gap-1"><button title="上一页" aria-label="上一页" disabled={currentPage === 1} onClick={() => setPage((value) => Math.max(1, value - 1))} className="p-2 rounded-[var(--radius-xs)] cursor-pointer disabled:opacity-40" style={{ backgroundColor: "var(--color-bg-elevated)" }}><ChevronLeft size={15} /></button>{pageNumbers.map((item, index) => item === "..." ? <span key={`ellipsis-${index}`} className="px-2">...</span> : <button key={item} aria-current={item === currentPage ? "page" : undefined} onClick={() => setPage(item)} className="min-w-8 h-8 px-2 rounded-[var(--radius-xs)] cursor-pointer" style={{ backgroundColor: item === currentPage ? "var(--color-accent)" : "var(--color-bg-elevated)", color: item === currentPage ? "white" : "var(--color-text-muted)" }}>{item}</button>)}<button title="下一页" aria-label="下一页" disabled={currentPage === pageCount} onClick={() => setPage((value) => Math.min(pageCount, value + 1))} className="p-2 rounded-[var(--radius-xs)] cursor-pointer disabled:opacity-40" style={{ backgroundColor: "var(--color-bg-elevated)" }}><ChevronRight size={15} /></button></nav>}
        </div>
      </section>
    </div>
  );
}

function sortValue(item: ContentRow, key: SortKey): string | number {
  if (key === "title") return item.title;
  if (key === "contentType") return typeLabels[item.contentType] || item.contentType;
  if (key === "source") return sourceLabels[item.source] || item.source;
  if (key === "status") return item.status;
  return item[key];
}

function getPageNumbers(pageCount: number, currentPage: number): Array<number | "..."> {
  if (pageCount <= 7) return Array.from({ length: pageCount }, (_, index) => index + 1);
  const pages = new Set<number>([1, pageCount, currentPage, currentPage - 1, currentPage + 1]);
  const ordered = [...pages].filter((value) => value > 0 && value <= pageCount).sort((a, b) => a - b);
  const result: Array<number | "..."> = [];
  ordered.forEach((value, index) => {
    if (index > 0 && value - ordered[index - 1] > 1) result.push("...");
    result.push(value);
  });
  return result;
}

function SortableHeader({ label, sortKey, sort, onSort }: { label: string; sortKey: SortKey; sort: SortState; onSort: (key: SortKey) => void }) {
  const active = sort.key === sortKey;
  return <th aria-sort={active ? sort.direction === "asc" ? "ascending" : "descending" : "none"} className="p-0 font-medium"><button onClick={() => onSort(sortKey)} className="w-full h-12 px-4 flex items-center gap-1.5 text-left cursor-pointer" style={{ color: active ? "var(--color-accent-light)" : "var(--color-text-muted)" }}>{label}{active ? (sort.direction === "asc" ? <ArrowUp size={13} /> : <ArrowDown size={13} />) : <ArrowUpDown size={13} />}</button></th>;
}

function Metric({ label, value }: { label: string; value: number }) {
  return <div className="glass-card rounded-[var(--radius-md)] p-5"><div className="text-2xl font-bold" style={{ color: "var(--color-text-primary)" }}>{value}</div><div className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>{label}</div></div>;
}
