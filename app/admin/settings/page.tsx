"use client";

import { useState, useEffect } from "react";
import { Save, Plus, Trash2 } from "lucide-react";
import { FormField, ArrayEditor, Toast } from "@/components/admin/AdminShared";

type SiteSettings = {
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string[];
  ogTitle: string;
  ogDescription: string;
  llmsTxtDescription: string;
  navItems: { label: string; href: string }[];
};

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((res) => res.json())
      .then(setSettings);
  }, []);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      showToast("站点设置已保存", "success");
    } catch {
      showToast("保存失败", "error");
    } finally { setSaving(false); }
  };

  if (!settings) return <div className="py-20 text-center" style={{ color: "var(--color-text-muted)" }}>加载中...</div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--color-text-primary)" }}>站点设置</h1>
          <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>管理 SEO、GEO 和导航配置</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 rounded-[var(--radius-sm)] text-sm font-medium cursor-pointer transition-colors disabled:opacity-50"
          style={{ backgroundColor: "var(--color-accent)", color: "white" }}
        >
          <Save size={16} />
          {saving ? "保存中..." : "保存全部"}
        </button>
      </div>

      {/* SEO 设置 */}
      <section className="glass-card rounded-[var(--radius-lg)] p-6">
        <h2 className="text-lg font-bold mb-4" style={{ color: "var(--color-text-primary)" }}>SEO 搜索引擎优化</h2>
        <div className="space-y-4">
          <FormField label="SEO 标题（Title Tag）">
            <input
              value={settings.seoTitle}
              onChange={(e) => setSettings({ ...settings, seoTitle: e.target.value })}
              className="form-input"
            />
          </FormField>
          <FormField label="SEO 描述（Meta Description）">
            <textarea
              value={settings.seoDescription}
              onChange={(e) => setSettings({ ...settings, seoDescription: e.target.value })}
              rows={3}
              className="form-input resize-none"
            />
          </FormField>
          <FormField label="SEO 关键词（每行一条）">
            <ArrayEditor
              value={settings.seoKeywords}
              onChange={(v) => setSettings({ ...settings, seoKeywords: v })}
              rows={5}
            />
          </FormField>
        </div>
      </section>

      {/* OG 社交分享 */}
      <section className="glass-card rounded-[var(--radius-lg)] p-6">
        <h2 className="text-lg font-bold mb-4" style={{ color: "var(--color-text-primary)" }}>社交分享（Open Graph）</h2>
        <div className="space-y-4">
          <FormField label="OG 标题（微信/Twitter 分享标题）">
            <input
              value={settings.ogTitle}
              onChange={(e) => setSettings({ ...settings, ogTitle: e.target.value })}
              className="form-input"
            />
          </FormField>
          <FormField label="OG 描述">
            <textarea
              value={settings.ogDescription}
              onChange={(e) => setSettings({ ...settings, ogDescription: e.target.value })}
              rows={2}
              className="form-input resize-none"
            />
          </FormField>
        </div>
      </section>

      {/* GEO / LLM 设置 */}
      <section className="glass-card rounded-[var(--radius-lg)] p-6">
        <h2 className="text-lg font-bold mb-4" style={{ color: "var(--color-text-primary)" }}>GEO / AI 搜索优化</h2>
        <FormField label="llms.txt 描述（供 AI 爬虫读取的网站简介）">
          <textarea
            value={settings.llmsTxtDescription}
            onChange={(e) => setSettings({ ...settings, llmsTxtDescription: e.target.value })}
            rows={3}
            className="form-input resize-none"
          />
        </FormField>
      </section>

      {/* 导航菜单 */}
      <section className="glass-card rounded-[var(--radius-lg)] p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold" style={{ color: "var(--color-text-primary)" }}>导航菜单</h2>
          <button
            onClick={() => setSettings({ ...settings, navItems: [...settings.navItems, { label: "", href: "" }] })}
            className="flex items-center gap-1 text-xs cursor-pointer px-3 py-1.5 rounded-[var(--radius-sm)]"
            style={{ backgroundColor: "rgba(99,102,241,0.15)", color: "var(--color-accent-light)" }}
          >
            <Plus size={14} /> 新增导航项
          </button>
        </div>
        <div className="space-y-2">
          {settings.navItems.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <input
                value={item.label}
                onChange={(e) => {
                  const newNav = [...settings.navItems];
                  newNav[idx] = { ...item, label: e.target.value };
                  setSettings({ ...settings, navItems: newNav });
                }}
                placeholder="菜单名称"
                className="form-input flex-1"
              />
              <input
                value={item.href}
                onChange={(e) => {
                  const newNav = [...settings.navItems];
                  newNav[idx] = { ...item, href: e.target.value };
                  setSettings({ ...settings, navItems: newNav });
                }}
                placeholder="链接地址"
                className="form-input flex-1"
              />
              <button
                onClick={() => setSettings({ ...settings, navItems: settings.navItems.filter((_, i) => i !== idx) })}
                className="p-2 cursor-pointer"
                style={{ color: "rgb(248,113,113)" }}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </section>

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}
