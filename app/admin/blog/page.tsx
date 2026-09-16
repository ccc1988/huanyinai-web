"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Edit3, Trash2 } from "lucide-react";
import type { BlogPost } from "@/lib/data";
import { EditModal, FormField, ArrayEditor, SearchBar } from "@/components/admin/AdminShared";

const emptyPost: BlogPost = {
  slug: "",
  title: "",
  excerpt: "",
  category: "深度案例",
  tags: [],
  date: new Date().toISOString().split("T")[0],
  author: "寰引智能",
  sections: [],
  reviewStatus: "draft",
};

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [search, setSearch] = useState("");

  const fetchPosts = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/blog");
      setPosts(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const handleSave = async () => {
    if (!editing) return;
    setSaving(true);
    setSaveError("");
    try {
      const response = await fetch("/api/admin/blog", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editing),
      });
      if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result.error || "保存失败，请稍后重试");
      }
      setEditing(null);
      fetchPosts();
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "保存失败，请稍后重试");
    } finally { setSaving(false); }
  };

  const handleDelete = async (slug: string) => {
    if (!confirm("确定删除这篇文章？")) return;
    const response = await fetch("/api/admin/blog", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug }),
    });
    if (!response.ok) {
      const result = await response.json().catch(() => ({}));
      alert(result.error || "删除失败，请稍后重试");
      return;
    }
    fetchPosts();
  };

  const filtered = posts.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="py-20 text-center" style={{ color: "var(--color-text-muted)" }}>加载中...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--color-text-primary)" }}>博客管理</h1>
          <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>共 {posts.length} 篇文章</p>
        </div>
        <button
          onClick={() => setEditing({ ...emptyPost })}
          className="flex items-center gap-2 px-4 py-2 rounded-[var(--radius-sm)] text-sm font-medium cursor-pointer transition-colors"
          style={{ backgroundColor: "rgba(99,102,241,0.15)", color: "var(--color-accent-light)" }}
        >
          <Plus size={16} /> 新增文章
        </button>
      </div>

      <SearchBar value={search} onChange={setSearch} placeholder="搜索文章标题或分类..." />

      <div className="space-y-2">
        {filtered.map((post) => (
          <div key={post.slug} className="glass-card rounded-[var(--radius-md)] p-4 flex items-center justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium truncate" style={{ color: "var(--color-text-primary)" }}>{post.title}</span>
                <span className="px-2 py-0.5 rounded-full text-xs whitespace-nowrap" style={{ backgroundColor: "rgba(99,102,241,0.15)", color: "var(--color-accent-light)" }}>{post.category}</span>
                <span className="px-2 py-0.5 rounded-full text-xs whitespace-nowrap" style={{ backgroundColor: post.reviewStatus === "draft" ? "rgba(245,158,11,0.15)" : "rgba(34,197,94,0.15)", color: post.reviewStatus === "draft" ? "#f59e0b" : "#4ade80" }}>
                  {post.reviewStatus === "draft" ? "待审核" : post.reviewStatus === "reviewed" ? "已审核" : "历史公开待复核"}
                </span>
              </div>
              <p className="text-xs truncate" style={{ color: "var(--color-text-muted)" }}>{post.date} · {post.author} · {post.sections.length} 个段落</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button onClick={() => setEditing({ ...post })} className="p-2 rounded-[var(--radius-xs)] cursor-pointer" style={{ color: "var(--color-text-muted)" }}><Edit3 size={16} /></button>
              <button onClick={() => handleDelete(post.slug)} className="p-2 rounded-[var(--radius-xs)] cursor-pointer" style={{ color: "rgb(248,113,113)" }}><Trash2 size={16} /></button>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <EditModal title={editing.slug ? "编辑文章" : "新增文章"} onClose={() => setEditing(null)} onSave={handleSave} saving={saving}>
          {saveError && <p className="text-sm mb-4" style={{ color: "rgb(248,113,113)" }}>{saveError}</p>}
          <BlogForm data={editing} onChange={setEditing} />
        </EditModal>
      )}
    </div>
  );
}

function BlogForm({ data, onChange }: { data: BlogPost; onChange: (d: BlogPost) => void }) {
  const update = (field: keyof BlogPost, value: unknown) => onChange({ ...data, [field]: value });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <FormField label="Slug（URL标识）" required>
          <input value={data.slug} onChange={(e) => update("slug", e.target.value)} placeholder="如：customs-50w-tickets" className="form-input" />
        </FormField>
        <FormField label="分类">
          <input value={data.category} onChange={(e) => update("category", e.target.value)} className="form-input" />
        </FormField>
      </div>
      <FormField label="文章标题" required>
        <input value={data.title} onChange={(e) => update("title", e.target.value)} className="form-input" />
      </FormField>
      <FormField label="摘要">
        <textarea value={data.excerpt} onChange={(e) => update("excerpt", e.target.value)} rows={3} className="form-input resize-none" />
      </FormField>
      <div className="grid grid-cols-2 gap-4">
        <FormField label="发布日期">
          <input type="date" value={data.date} onChange={(e) => update("date", e.target.value)} className="form-input" />
        </FormField>
        <FormField label="作者">
          <input value={data.author} onChange={(e) => update("author", e.target.value)} className="form-input" />
        </FormField>
      </div>
      <FormField label="标签（每行一条）">
        <ArrayEditor value={data.tags} onChange={(v) => update("tags", v)} />
      </FormField>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="内容审核状态">
          <select value={data.reviewStatus || "draft"} onChange={(e) => update("reviewStatus", e.target.value as "draft" | "reviewed")} className="form-input">
            <option value="draft">待审核</option>
            <option value="reviewed">已审核</option>
          </select>
        </FormField>
        <FormField label="审核人">
          <input value={data.reviewer || ""} onChange={(e) => update("reviewer", e.target.value)} className="form-input" />
        </FormField>
        <FormField label="审核日期">
          <input type="date" value={data.reviewedAt || ""} onChange={(e) => update("reviewedAt", e.target.value)} className="form-input" />
        </FormField>
      </div>
      <SourceEditor value={data.sources || []} onChange={(value) => update("sources", value)} />
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-medium" style={{ color: "var(--color-text-muted)" }}>文章段落</label>
          <button
            onClick={() => update("sections", [...data.sections, { heading: "", body: "" }])}
            className="text-xs cursor-pointer flex items-center gap-1"
            style={{ color: "var(--color-accent-light)" }}
          >
            <Plus size={12} /> 添加段落
          </button>
        </div>
        <div className="space-y-3">
          {data.sections.map((section, idx) => (
            <div key={idx} className="glass-card rounded-[var(--radius-sm)] p-3 space-y-2">
              <div className="flex items-center gap-2">
                <input
                  value={section.heading}
                  onChange={(e) => {
                    const newSections = [...data.sections];
                    newSections[idx] = { ...section, heading: e.target.value };
                    update("sections", newSections);
                  }}
                  placeholder="小标题"
                  className="form-input flex-1"
                />
                <button
                  onClick={() => update("sections", data.sections.filter((_, i) => i !== idx))}
                  className="p-2 cursor-pointer"
                  style={{ color: "rgb(248,113,113)" }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <textarea
                value={section.body}
                onChange={(e) => {
                  const newSections = [...data.sections];
                  newSections[idx] = { ...section, body: e.target.value };
                  update("sections", newSections);
                }}
                placeholder="正文内容..."
                rows={4}
                className="form-input resize-none"
              />
            </div>
          ))}
          {data.sections.length === 0 && (
            <p className="text-xs text-center py-4" style={{ color: "var(--color-text-muted)" }}>
              点击"添加段落"开始编写文章
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

type ContentSource = { title: string; url: string; accessedAt: string };

function SourceEditor({ value, onChange }: { value: ContentSource[]; onChange: (value: ContentSource[]) => void }) {
  const update = (index: number, patch: Partial<ContentSource>) => {
    const next = [...value];
    next[index] = { ...next[index], ...patch };
    onChange(next);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-medium" style={{ color: "var(--color-text-muted)" }}>资料来源</label>
        <button type="button" onClick={() => onChange([...value, { title: "", url: "", accessedAt: "" }])} className="text-xs cursor-pointer flex items-center gap-1" style={{ color: "var(--color-accent-light)" }}>
          <Plus size={12} /> 添加来源
        </button>
      </div>
      <div className="space-y-3">
        {value.map((source, index) => (
          <div key={index} className="glass-card rounded-[var(--radius-sm)] p-3 space-y-2">
            <div className="flex items-center gap-2">
              <input value={source.title} onChange={(e) => update(index, { title: e.target.value })} placeholder="来源名称" className="form-input flex-1" />
              <button type="button" onClick={() => onChange(value.filter((_, itemIndex) => itemIndex !== index))} className="p-2 cursor-pointer" style={{ color: "rgb(248,113,113)" }} aria-label="删除来源"><Trash2 size={14} /></button>
            </div>
            <input value={source.url} onChange={(e) => update(index, { url: e.target.value })} placeholder="https://..." className="form-input" />
            <input type="date" value={source.accessedAt} onChange={(e) => update(index, { accessedAt: e.target.value })} className="form-input" />
          </div>
        ))}
      </div>
    </div>
  );
}
