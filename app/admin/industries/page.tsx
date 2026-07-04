"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Edit3, Trash2 } from "lucide-react";
import type { IndustrySolution } from "@/lib/data";
import { EditModal, FormField, ArrayEditor, SearchBar } from "@/components/admin/AdminShared";

const emptyIndustry: IndustrySolution = {
  slug: "",
  title: "",
  subtitle: "",
  painPoints: [],
  solutionSummary: "",
  relatedCases: [],
  faq: [],
};

export default function AdminIndustriesPage() {
  const [industries, setIndustries] = useState<IndustrySolution[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<IndustrySolution | null>(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  const fetchIndustries = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/industries");
      setIndustries(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchIndustries(); }, [fetchIndustries]);

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      await fetch("/api/admin/industries", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editing),
      });
      setEditing(null);
      fetchIndustries();
    } finally { setSaving(false); }
  };

  const handleDelete = async (slug: string) => {
    if (!confirm("确定删除此行业方案？")) return;
    await fetch("/api/admin/industries", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug }),
    });
    fetchIndustries();
  };

  const filtered = industries.filter(
    (i) =>
      i.title.toLowerCase().includes(search.toLowerCase()) ||
      i.slug.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="py-20 text-center" style={{ color: "var(--color-text-muted)" }}>加载中...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--color-text-primary)" }}>行业方案管理</h1>
          <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>共 {industries.length} 个行业方案</p>
        </div>
        <button
          onClick={() => setEditing({ ...emptyIndustry })}
          className="flex items-center gap-2 px-4 py-2 rounded-[var(--radius-sm)] text-sm font-medium cursor-pointer transition-colors"
          style={{ backgroundColor: "rgba(99,102,241,0.15)", color: "var(--color-accent-light)" }}
        >
          <Plus size={16} /> 新增方案
        </button>
      </div>

      <SearchBar value={search} onChange={setSearch} placeholder="搜索行业方案..." />

      <div className="space-y-2">
        {filtered.map((item) => (
          <div key={item.slug} className="glass-card rounded-[var(--radius-md)] p-4 flex items-center justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>{item.title}</span>
                <span className="px-2 py-0.5 rounded-full text-xs whitespace-nowrap" style={{ backgroundColor: "rgba(99,102,241,0.15)", color: "var(--color-accent-light)" }}>{item.slug}</span>
              </div>
              <p className="text-xs truncate" style={{ color: "var(--color-text-muted)" }}>{item.subtitle}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button onClick={() => setEditing({ ...item, painPoints: [...item.painPoints], relatedCases: [...item.relatedCases], faq: item.faq.map(f => ({ ...f })) })} className="p-2 rounded-[var(--radius-xs)] cursor-pointer" style={{ color: "var(--color-text-muted)" }}><Edit3 size={16} /></button>
              <button onClick={() => handleDelete(item.slug)} className="p-2 rounded-[var(--radius-xs)] cursor-pointer" style={{ color: "rgb(248,113,113)" }}><Trash2 size={16} /></button>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <EditModal title={editing.slug ? "编辑行业方案" : "新增行业方案"} onClose={() => setEditing(null)} onSave={handleSave} saving={saving}>
          <IndustryForm data={editing} onChange={setEditing} />
        </EditModal>
      )}
    </div>
  );
}

function IndustryForm({ data, onChange }: { data: IndustrySolution; onChange: (d: IndustrySolution) => void }) {
  const update = (field: keyof IndustrySolution, value: unknown) => onChange({ ...data, [field]: value });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Slug（URL标识）" required>
          <input value={data.slug} onChange={(e) => update("slug", e.target.value)} placeholder="如：customs" className="form-input" />
        </FormField>
        <FormField label="方案标题" required>
          <input value={data.title} onChange={(e) => update("title", e.target.value)} className="form-input" />
        </FormField>
      </div>
      <FormField label="副标题">
        <input value={data.subtitle} onChange={(e) => update("subtitle", e.target.value)} className="form-input" />
      </FormField>
      <FormField label="方案概述">
        <textarea value={data.solutionSummary} onChange={(e) => update("solutionSummary", e.target.value)} rows={3} className="form-input resize-none" />
      </FormField>
      <FormField label="行业痛点（每行一条）">
        <ArrayEditor value={data.painPoints} onChange={(v) => update("painPoints", v)} />
      </FormField>
      <FormField label="关联案例 Slug（每行一条）">
        <ArrayEditor value={data.relatedCases} onChange={(v) => update("relatedCases", v)} />
      </FormField>
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-medium" style={{ color: "var(--color-text-muted)" }}>常见问题 FAQ</label>
          <button
            onClick={() => update("faq", [...data.faq, { q: "", a: "" }])}
            className="text-xs cursor-pointer flex items-center gap-1"
            style={{ color: "var(--color-accent-light)" }}
          >
            <Plus size={12} /> 添加问题
          </button>
        </div>
        <div className="space-y-3">
          {data.faq.map((item, idx) => (
            <div key={idx} className="glass-card rounded-[var(--radius-sm)] p-3 space-y-2">
              <div className="flex items-center gap-2">
                <input
                  value={item.q}
                  onChange={(e) => {
                    const newFaq = [...data.faq];
                    newFaq[idx] = { ...item, q: e.target.value };
                    update("faq", newFaq);
                  }}
                  placeholder="问题"
                  className="form-input flex-1"
                />
                <button
                  onClick={() => update("faq", data.faq.filter((_, i) => i !== idx))}
                  className="p-2 cursor-pointer"
                  style={{ color: "rgb(248,113,113)" }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <textarea
                value={item.a}
                onChange={(e) => {
                  const newFaq = [...data.faq];
                  newFaq[idx] = { ...item, a: e.target.value };
                  update("faq", newFaq);
                }}
                placeholder="回答..."
                rows={3}
                className="form-input resize-none"
              />
            </div>
          ))}
          {data.faq.length === 0 && (
            <p className="text-xs text-center py-4" style={{ color: "var(--color-text-muted)" }}>
              点击"添加问题"创建 FAQ
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
