"use client";

import { useState, useEffect } from "react";
import { Save, Plus, Trash2 } from "lucide-react";
import { FormField, ArrayEditor, Toast } from "@/components/admin/AdminShared";
import type { Customer, CapabilityItem, StatItem } from "@/lib/data";

type CompanyData = {
  company: Record<string, string>;
  customers: Customer[];
  capabilities: CapabilityItem[];
  stats: StatItem[];
};

export default function AdminCompanyPage() {
  const [data, setData] = useState<CompanyData | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    fetch("/api/admin/company")
      .then((res) => res.json())
      .then(setData);
  }, []);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const saveCompany = async () => {
    if (!data) return;
    setSaving(true);
    try {
      await fetch("/api/admin/company", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "company", data: data.company }),
      });
      showToast("公司信息已保存", "success");
    } catch {
      showToast("保存失败", "error");
    } finally { setSaving(false); }
  };

  const saveCustomers = async () => {
    if (!data) return;
    setSaving(true);
    try {
      await fetch("/api/admin/company", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "customers", data: data.customers }),
      });
      showToast("客户列表已保存", "success");
    } catch {
      showToast("保存失败", "error");
    } finally { setSaving(false); }
  };

  const saveStats = async () => {
    if (!data) return;
    setSaving(true);
    try {
      await fetch("/api/admin/company", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "stats", data: data.stats }),
      });
      showToast("数据指标已保存", "success");
    } catch {
      showToast("保存失败", "error");
    } finally { setSaving(false); }
  };

  if (!data) return <div className="py-20 text-center" style={{ color: "var(--color-text-muted)" }}>加载中...</div>;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold" style={{ color: "var(--color-text-primary)" }}>公司信息管理</h1>

      {/* 公司基本信息 */}
      <section className="glass-card rounded-[var(--radius-lg)] p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold" style={{ color: "var(--color-text-primary)" }}>公司基本信息</h2>
          <SaveButton onClick={saveCompany} saving={saving} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="公司全称">
            <input
              value={data.company.fullName || ""}
              onChange={(e) => setData({ ...data, company: { ...data.company, fullName: e.target.value } })}
              className="form-input"
            />
          </FormField>
          <FormField label="简称">
            <input
              value={data.company.shortName || ""}
              onChange={(e) => setData({ ...data, company: { ...data.company, shortName: e.target.value } })}
              className="form-input"
            />
          </FormField>
          <FormField label="官网地址">
            <input
              value={data.company.website || ""}
              onChange={(e) => setData({ ...data, company: { ...data.company, website: e.target.value } })}
              className="form-input"
            />
          </FormField>
          <FormField label="邮箱">
            <input
              value={data.company.email || ""}
              onChange={(e) => setData({ ...data, company: { ...data.company, email: e.target.value } })}
              className="form-input"
            />
          </FormField>
          <FormField label="微信">
            <input
              value={data.company.wechat || ""}
              onChange={(e) => setData({ ...data, company: { ...data.company, wechat: e.target.value } })}
              className="form-input"
            />
          </FormField>
          <FormField label="电话">
            <input
              value={data.company.phone || ""}
              onChange={(e) => setData({ ...data, company: { ...data.company, phone: e.target.value } })}
              className="form-input"
            />
          </FormField>
          <FormField label="描述">
            <input
              value={data.company.description || ""}
              onChange={(e) => setData({ ...data, company: { ...data.company, description: e.target.value } })}
              className="form-input"
            />
          </FormField>
          <FormField label="所在地">
            <input
              value={data.company.location || ""}
              onChange={(e) => setData({ ...data, company: { ...data.company, location: e.target.value } })}
              className="form-input"
            />
          </FormField>
        </div>
      </section>

      {/* 数据指标 */}
      <section className="glass-card rounded-[var(--radius-lg)] p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold" style={{ color: "var(--color-text-primary)" }}>首页数据指标</h2>
          <SaveButton onClick={saveStats} saving={saving} />
        </div>
        <div className="space-y-2">
          {data.stats.map((stat, idx) => (
            <div key={idx} className="grid grid-cols-3 gap-2 items-end">
              <FormField label="数值">
                <input
                  type="number"
                  value={stat.value}
                  onChange={(e) => {
                    const newStats = [...data.stats];
                    newStats[idx] = { ...stat, value: Number(e.target.value) };
                    setData({ ...data, stats: newStats });
                  }}
                  className="form-input"
                />
              </FormField>
              <FormField label="后缀">
                <input
                  value={stat.suffix || ""}
                  onChange={(e) => {
                    const newStats = [...data.stats];
                    newStats[idx] = { ...stat, suffix: e.target.value };
                    setData({ ...data, stats: newStats });
                  }}
                  className="form-input"
                  placeholder="如 +、x+"
                />
              </FormField>
              <FormField label="标签">
                <input
                  value={stat.label}
                  onChange={(e) => {
                    const newStats = [...data.stats];
                    newStats[idx] = { ...stat, label: e.target.value };
                    setData({ ...data, stats: newStats });
                  }}
                  className="form-input"
                />
              </FormField>
            </div>
          ))}
        </div>
      </section>

      {/* 客户列表 */}
      <section className="glass-card rounded-[var(--radius-lg)] p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold" style={{ color: "var(--color-text-primary)" }}>客户列表</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setData({ ...data, customers: [...data.customers, { name: "", industry: "", solutions: [] }] })}
              className="flex items-center gap-1 text-xs cursor-pointer px-3 py-1.5 rounded-[var(--radius-sm)]"
              style={{ backgroundColor: "rgba(99,102,241,0.15)", color: "var(--color-accent-light)" }}
            >
              <Plus size={14} /> 新增客户
            </button>
            <SaveButton onClick={saveCustomers} saving={saving} />
          </div>
        </div>
        <div className="space-y-3">
          {data.customers.map((customer, idx) => (
            <div key={idx} className="glass-card rounded-[var(--radius-sm)] p-4 space-y-2">
              <div className="flex items-center gap-2">
                <input
                  value={customer.name}
                  onChange={(e) => {
                    const newCustomers = [...data.customers];
                    newCustomers[idx] = { ...customer, name: e.target.value };
                    setData({ ...data, customers: newCustomers });
                  }}
                  placeholder="客户名称"
                  className="form-input flex-1"
                />
                <input
                  value={customer.industry}
                  onChange={(e) => {
                    const newCustomers = [...data.customers];
                    newCustomers[idx] = { ...customer, industry: e.target.value };
                    setData({ ...data, customers: newCustomers });
                  }}
                  placeholder="行业"
                  className="form-input"
                  style={{ maxWidth: "120px" }}
                />
                <button
                  onClick={() => setData({ ...data, customers: data.customers.filter((_, i) => i !== idx) })}
                  className="p-2 cursor-pointer"
                  style={{ color: "rgb(248,113,113)" }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <FormField label="使用方案（每行一条）">
                <ArrayEditor
                  value={customer.solutions}
                  onChange={(v) => {
                    const newCustomers = [...data.customers];
                    newCustomers[idx] = { ...customer, solutions: v };
                    setData({ ...data, customers: newCustomers });
                  }}
                  rows={3}
                />
              </FormField>
            </div>
          ))}
        </div>
      </section>

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}

function SaveButton({ onClick, saving }: { onClick: () => void; saving: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={saving}
      className="flex items-center gap-2 px-4 py-2 rounded-[var(--radius-sm)] text-sm font-medium cursor-pointer transition-colors disabled:opacity-50"
      style={{ backgroundColor: "var(--color-accent)", color: "white" }}
    >
      <Save size={16} />
      {saving ? "保存中..." : "保存"}
    </button>
  );
}
