"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Edit3, Trash2, Search } from "lucide-react";
import type { CaseItem } from "@/lib/data";
import { EditModal, FormField, ArrayEditor } from "@/components/admin/AdminShared";

const emptyCase: CaseItem = {
  slug: "",
  title: "",
  industry: "",
  relatedCustomers: [],
  oneLiner: "",
  painPoints: [],
  solution: "",
  customerValue: [],
  metrics: [],
  scenarios: [],
  tags: [],
  hasDetailPage: false,
};

export default function AdminCasesPage() {
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<CaseItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  const fetchCases = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/cases");
      const data = await res.json();
      setCases(data);
    } catch {
      // 静默处理
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCases();
  }, [fetchCases]);

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      await fetch("/api/admin/cases", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editing),
      });
      setEditing(null);
      fetchCases();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (slug: string) => {
    if (!confirm("确定删除此案例？此操作不可撤销。")) return;
    await fetch("/api/admin/cases", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug }),
    });
    fetchCases();
  };

  const filtered = cases.filter(
    (c) =>
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.industry.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <span style={{ color: "var(--color-text-muted)" }}>加载中...</span>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--color-text-primary)" }}>
            案例管理
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>
            共 {cases.length} 个案例
          </p>
        </div>
        <button
          onClick={() => setEditing({ ...emptyCase })}
          className="flex items-center gap-2 px-4 py-2 rounded-[var(--radius-sm)] text-sm font-medium cursor-pointer transition-colors"
          style={{ backgroundColor: "rgba(99,102,241,0.15)", color: "var(--color-accent-light)" }}
        >
          <Plus size={16} />
          新增案例
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2"
          style={{ color: "var(--color-text-muted)" }}
        />
        <input
          type="text"
          placeholder="搜索案例标题或行业..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-[var(--radius-sm)] text-sm outline-none"
          style={{
            backgroundColor: "var(--color-bg-elevated)",
            border: "1px solid var(--color-border-default)",
            color: "var(--color-text-primary)",
          }}
        />
      </div>

      {/* List */}
      <div className="space-y-2">
        {filtered.map((item) => (
          <div
            key={item.slug}
            className="glass-card rounded-[var(--radius-md)] p-4 flex items-center justify-between gap-4"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium truncate" style={{ color: "var(--color-text-primary)" }}>
                  {item.title}
                </span>
                <span
                  className="px-2 py-0.5 rounded-full text-xs whitespace-nowrap"
                  style={{ backgroundColor: "rgba(99,102,241,0.15)", color: "var(--color-accent-light)" }}
                >
                  {item.industry}
                </span>
                {item.hasDetailPage && (
                  <span
                    className="px-2 py-0.5 rounded-full text-xs whitespace-nowrap"
                    style={{ backgroundColor: "rgba(34,197,94,0.15)", color: "rgb(74,222,128)" }}
                  >
                    详情页
                  </span>
                )}
              </div>
              <p className="text-xs truncate" style={{ color: "var(--color-text-muted)" }}>
                {item.oneLiner}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => setEditing({ ...item })}
                className="p-2 rounded-[var(--radius-xs)] cursor-pointer transition-colors"
                style={{ color: "var(--color-text-muted)" }}
                title="编辑"
              >
                <Edit3 size={16} />
              </button>
              <button
                onClick={() => handleDelete(item.slug)}
                className="p-2 rounded-[var(--radius-xs)] cursor-pointer transition-colors"
                style={{ color: "rgb(248,113,113)" }}
                title="删除"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {editing && (
        <EditModal
          title={editing.slug ? "编辑案例" : "新增案例"}
          onClose={() => setEditing(null)}
          onSave={handleSave}
          saving={saving}
        >
          <CaseForm data={editing} onChange={setEditing} />
        </EditModal>
      )}
    </div>
  );
}

// ===== 案例表单组件 =====
function CaseForm({ data, onChange }: { data: CaseItem; onChange: (d: CaseItem) => void }) {
  const update = (field: keyof CaseItem, value: unknown) => onChange({ ...data, [field]: value });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Slug（URL标识）" required>
          <input
            value={data.slug}
            onChange={(e) => update("slug", e.target.value)}
            placeholder="如：customs-document-ai"
            className="form-input"
          />
        </FormField>
        <FormField label="行业">
          <input
            value={data.industry}
            onChange={(e) => update("industry", e.target.value)}
            className="form-input"
          />
        </FormField>
      </div>
      <FormField label="案例标题" required>
        <input
          value={data.title}
          onChange={(e) => update("title", e.target.value)}
          className="form-input"
        />
      </FormField>
      <FormField label="一句话摘要">
        <textarea
          value={data.oneLiner}
          onChange={(e) => update("oneLiner", e.target.value)}
          rows={2}
          className="form-input resize-none"
        />
      </FormField>
      <FormField label="解决方案描述">
        <textarea
          value={data.solution}
          onChange={(e) => update("solution", e.target.value)}
          rows={3}
          className="form-input resize-none"
        />
      </FormField>
      <FormField label="客户痛点（每行一条）">
        <ArrayEditor value={data.painPoints} onChange={(v) => update("painPoints", v)} />
      </FormField>
      <FormField label="客户价值（每行一条）">
        <ArrayEditor value={data.customerValue} onChange={(v) => update("customerValue", v)} />
      </FormField>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="技术指标（每行一条）">
          <ArrayEditor value={data.metrics || []} onChange={(v) => update("metrics", v)} />
        </FormField>
        <FormField label="标签（每行一条）">
          <ArrayEditor value={data.tags} onChange={(v) => update("tags", v)} />
        </FormField>
      </div>
      <FormField label="适用场景（每行一条）">
        <ArrayEditor value={data.scenarios} onChange={(v) => update("scenarios", v)} />
      </FormField>
      <FormField label="关联客户（每行一个客户名）">
        <ArrayEditor value={data.relatedCustomers} onChange={(v) => update("relatedCustomers", v)} />
      </FormField>
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={data.hasDetailPage}
          onChange={(e) => update("hasDetailPage", e.target.checked)}
          className="w-4 h-4"
        />
        <span className="text-sm" style={{ color: "var(--color-text-body)" }}>
          启用独立详情页（/cases/{"{slug}"}）
        </span>
      </label>
    </div>
  );
}


