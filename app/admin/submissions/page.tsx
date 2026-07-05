"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Mail,
  MailOpen,
  Trash2,
  Tag,
  Save,
  X,
  Search,
  Inbox,
  Filter,
} from "lucide-react";
import { Toast, FormField } from "@/components/admin/AdminShared";
import type { Submission } from "@/lib/data";

export default function AdminSubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Submission | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter !== "all") params.set("status", filter);
      if (categoryFilter !== "all") params.set("category", categoryFilter);
      const res = await fetch(`/api/admin/submissions?${params}`);
      const data = await res.json();
      setSubmissions(data);
    } catch {
      showToast("加载失败", "error");
    } finally {
      setLoading(false);
    }
  }, [filter, categoryFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpen = async (sub: Submission) => {
    // 标记已读
    if (sub.status === "unread") {
      try {
        await fetch(`/api/admin/submissions/${sub.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "read" }),
        });
      } catch { /* ignore */ }
    }
    setSelected({ ...sub, status: "read" });
    fetchData();
  };

  const handleSave = async () => {
    if (!selected) return;
    try {
      await fetch(`/api/admin/submissions/${selected.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: selected.category,
          tags: selected.tags,
          notes: selected.notes,
        }),
      });
      showToast("保存成功", "success");
      fetchData();
    } catch {
      showToast("保存失败", "error");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("确定删除这条咨询记录？此操作不可撤销。")) return;
    try {
      await fetch(`/api/admin/submissions/${id}`, { method: "DELETE" });
      setSelected(null);
      showToast("已删除", "success");
      fetchData();
    } catch {
      showToast("删除失败", "error");
    }
  };

  const handleMarkUnread = async (id: string) => {
    try {
      await fetch(`/api/admin/submissions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "unread" }),
      });
      setSelected(null);
      fetchData();
    } catch {
      showToast("操作失败", "error");
    }
  };

  // 统计
  const allSubs = submissions;
  const unreadCount = allSubs.filter((s) => s.status === "unread").length;
  const readCount = allSubs.filter((s) => s.status === "read").length;
  const taggedCount = allSubs.filter((s) => s.tags.length > 0).length;

  // 搜索过滤
  const filtered = search
    ? allSubs.filter(
        (s) =>
          s.name.includes(search) ||
          s.company.includes(search) ||
          s.phone.includes(search) ||
          s.message.includes(search)
      )
    : allSubs;

  const categories = ["物流", "制造", "制药", "跨境", "通用", "其他"];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--color-text-primary)" }}>
          预约咨询
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>
          查看和管理客户提交的咨询信息
        </p>
      </div>

      {/* 统计条 */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "总计", count: allSubs.length, color: "var(--color-accent-light)", icon: Inbox },
          { label: "未读", count: unreadCount, color: "#f59e0b", icon: Mail },
          { label: "已读", count: readCount, color: "#22c55e", icon: MailOpen },
          { label: "已标记", count: taggedCount, color: "#8b5cf6", icon: Tag },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="glass-card rounded-[var(--radius-lg)] p-4 flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${stat.color}22` }}
              >
                <Icon size={18} style={{ color: stat.color }} />
              </div>
              <div>
                <span className="block text-2xl font-bold" style={{ color: "var(--color-text-primary)" }}>
                  {stat.count}
                </span>
                <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                  {stat.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 筛选 + 搜索 */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1 p-1 rounded-[var(--radius-sm)]" style={{ backgroundColor: "var(--color-bg-elevated)" }}>
          {(["all", "unread", "read"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="px-3 py-1.5 rounded-[var(--radius-xs)] text-sm cursor-pointer transition-colors"
              style={{
                backgroundColor: filter === f ? "rgba(99,102,241,0.15)" : "transparent",
                color: filter === f ? "var(--color-accent-light)" : "var(--color-text-muted)",
                fontWeight: filter === f ? 600 : 400,
              }}
            >
              {f === "all" ? "全部" : f === "unread" ? "未读" : "已读"}
            </button>
          ))}
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-1.5 rounded-[var(--radius-sm)] text-sm cursor-pointer outline-none"
          style={{
            backgroundColor: "var(--color-bg-elevated)",
            border: "1px solid var(--color-border-default)",
            color: "var(--color-text-body)",
          }}
        >
          <option value="all">全部分类</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--color-text-muted)" }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索姓名、公司、电话、需求..."
            className="w-full pl-10 pr-4 py-2 rounded-[var(--radius-sm)] text-sm outline-none"
            style={{
              backgroundColor: "var(--color-bg-elevated)",
              border: "1px solid var(--color-border-default)",
              color: "var(--color-text-primary)",
            }}
          />
        </div>
      </div>

      {/* 列表 */}
      {loading ? (
        <div className="py-20 text-center" style={{ color: "var(--color-text-muted)" }}>加载中...</div>
      ) : filtered.length === 0 ? (
        <div className="glass-card rounded-[var(--radius-lg)] py-20 text-center">
          <Inbox size={40} className="mx-auto mb-3" style={{ color: "var(--color-text-muted)" }} />
          <p style={{ color: "var(--color-text-muted)" }}>暂无咨询记录</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((sub) => (
            <div
              key={sub.id}
              onClick={() => handleOpen(sub)}
              className="glass-card rounded-[var(--radius-md)] p-4 cursor-pointer hover:border-[rgba(99,102,241,0.3)] transition-colors"
              style={{
                borderLeft: sub.status === "unread" ? "3px solid var(--color-accent-light)" : "3px solid transparent",
              }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {sub.status === "unread" && (
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: "#f59e0b" }} />
                    )}
                    <span
                      className="font-medium truncate"
                      style={{
                        color: "var(--color-text-primary)",
                        fontWeight: sub.status === "unread" ? 700 : 400,
                      }}
                    >
                      {sub.name}
                    </span>
                    <span className="text-xs shrink-0" style={{ color: "var(--color-text-muted)" }}>
                      {sub.company}
                    </span>
                    {sub.emailSent && (
                      <span className="text-xs px-1.5 py-0.5 rounded shrink-0" style={{ backgroundColor: "rgba(34,197,94,0.15)", color: "#22c55e" }}>
                        已通知
                      </span>
                    )}
                  </div>
                  <p className="text-sm truncate" style={{ color: "var(--color-text-body)" }}>
                    {sub.message}
                  </p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                      {new Date(sub.createdAt).toLocaleString("zh-CN")}
                    </span>
                    {sub.category && (
                      <span className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: "rgba(99,102,241,0.15)", color: "var(--color-accent-light)" }}>
                        {sub.category}
                      </span>
                    )}
                    {sub.tags.length > 0 && (
                      <div className="flex items-center gap-1">
                        <Tag size={10} style={{ color: "var(--color-text-muted)" }} />
                        {sub.tags.map((tag, i) => (
                          <span key={i} className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 详情模态框 */}
      {selected && (
        <div
          className="fixed inset-0 z-[100] flex items-start justify-center p-4 overflow-y-auto"
          style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
          onClick={() => setSelected(null)}
        >
          <div
            className="glass-card rounded-[var(--radius-lg)] w-full max-w-2xl my-8"
            style={{ backgroundColor: "var(--color-bg-elevated)" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 头部 */}
            <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: "var(--color-border-default)" }}>
              <h2 className="text-lg font-bold" style={{ color: "var(--color-text-primary)" }}>
                咨询详情
              </h2>
              <button onClick={() => setSelected(null)} className="cursor-pointer" style={{ color: "var(--color-text-muted)" }}>
                <X size={20} />
              </button>
            </div>

            {/* 内容 */}
            <div className="p-6 space-y-4">
              {/* 基本信息 */}
              <div className="grid grid-cols-2 gap-4">
                <FormField label="姓名">
                  <span className="text-sm" style={{ color: "var(--color-text-primary)" }}>{selected.name}</span>
                </FormField>
                <FormField label="公司">
                  <span className="text-sm" style={{ color: "var(--color-text-primary)" }}>{selected.company}</span>
                </FormField>
                <FormField label="电话">
                  <span className="text-sm" style={{ color: "var(--color-text-primary)" }}>{selected.phone}</span>
                </FormField>
                <FormField label="邮箱">
                  <span className="text-sm" style={{ color: "var(--color-text-primary)" }}>{selected.email || "未提供"}</span>
                </FormField>
                <FormField label="提交时间">
                  <span className="text-sm" style={{ color: "var(--color-text-body)" }}>
                    {new Date(selected.createdAt).toLocaleString("zh-CN")}
                  </span>
                </FormField>
                <FormField label="来源 IP">
                  <span className="text-sm" style={{ color: "var(--color-text-body)" }}>{selected.ip}</span>
                </FormField>
              </div>

              {/* 需求描述 */}
              <FormField label="需求描述">
                <div
                  className="p-3 rounded-[var(--radius-sm)] text-sm whitespace-pre-wrap"
                  style={{ backgroundColor: "rgba(255,255,255,0.03)", color: "var(--color-text-body)" }}
                >
                  {selected.message}
                </div>
              </FormField>

              {/* 分类 */}
              <FormField label="分类">
                <select
                  value={selected.category}
                  onChange={(e) => setSelected({ ...selected, category: e.target.value })}
                  className="form-input cursor-pointer"
                >
                  <option value="">未分类</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </FormField>

              {/* 标签 */}
              <FormField label="标签（每行一个）">
                <textarea
                  value={selected.tags.join("\n")}
                  onChange={(e) => setSelected({ ...selected, tags: e.target.value.split("\n").filter((t) => t.trim()) })}
                  rows={2}
                  className="form-input resize-none"
                  placeholder="如：高意向、报关AI..."
                />
              </FormField>

              {/* 备注 */}
              <FormField label="内部备注">
                <textarea
                  value={selected.notes}
                  onChange={(e) => setSelected({ ...selected, notes: e.target.value })}
                  rows={3}
                  className="form-input resize-none"
                  placeholder="记录跟进情况..."
                />
              </FormField>
            </div>

            {/* 操作栏 */}
            <div className="flex items-center justify-between p-6 border-t" style={{ borderColor: "var(--color-border-default)" }}>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleMarkUnread(selected.id)}
                  className="flex items-center gap-1 px-3 py-2 rounded-[var(--radius-sm)] text-sm cursor-pointer transition-colors"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  <Mail size={14} />
                  标记未读
                </button>
                <button
                  onClick={() => handleDelete(selected.id)}
                  className="flex items-center gap-1 px-3 py-2 rounded-[var(--radius-sm)] text-sm cursor-pointer transition-colors"
                  style={{ color: "#f87171" }}
                >
                  <Trash2 size={14} />
                  删除
                </button>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelected(null)}
                  className="px-4 py-2 rounded-[var(--radius-sm)] text-sm cursor-pointer transition-colors"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  关闭
                </button>
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-4 py-2 rounded-[var(--radius-sm)] text-sm font-medium cursor-pointer transition-colors"
                  style={{ backgroundColor: "var(--color-accent)", color: "white" }}
                >
                  <Save size={16} />
                  保存
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}
