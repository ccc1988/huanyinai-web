"use client";

import { useState, useEffect } from "react";
import { Save, Plus, Trash2, Upload } from "lucide-react";
import { FormField, ArrayEditor, Toast } from "@/components/admin/AdminShared";
import type { Customer, CapabilityItem, StatItem, Contact } from "@/lib/data";

type CompanyData = {
  company: Record<string, string>;
  customers: Customer[];
  capabilities: CapabilityItem[];
  stats: StatItem[];
  contacts: Contact[];
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

  const saveContacts = async () => {
    if (!data) return;
    setSaving(true);
    try {
      await fetch("/api/admin/company", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "contacts", data: data.contacts }),
      });
      showToast("联系人信息已保存", "success");
    } catch {
      showToast("保存失败", "error");
    } finally { setSaving(false); }
  };

  // 上传二维码后自动压缩到 200×200，避免 base64 撑大 HTML 体积
  const QR_MAX_SIZE = 200;
  const handleQrUpload = (idx: number, file: File | undefined) => {
    if (!file || !data) return;
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(img.src);
      const canvas = document.createElement("canvas");
      canvas.width = QR_MAX_SIZE;
      canvas.height = QR_MAX_SIZE;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      // 白色背景，避免透明 PNG 在深色 Footer 上不可见
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, QR_MAX_SIZE, QR_MAX_SIZE);
      // 等比缩放居中
      const scale = Math.min(QR_MAX_SIZE / img.width, QR_MAX_SIZE / img.height);
      const w = img.width * scale;
      const h = img.height * scale;
      const x = (QR_MAX_SIZE - w) / 2;
      const y = (QR_MAX_SIZE - h) / 2;
      ctx.drawImage(img, x, y, w, h);
      // JPEG 压缩，二维码用 quality 0.85 足够清晰
      const compressed = canvas.toDataURL("image/jpeg", 0.85);
      const newContacts = [...data.contacts];
      newContacts[idx] = { ...newContacts[idx], qrCode: compressed };
      setData({ ...data, contacts: newContacts });
    };
    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      showToast("图片加载失败", "error");
    };
    img.src = URL.createObjectURL(file);
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

      {/* 联系人 / 二维码 */}
      <section className="glass-card rounded-[var(--radius-lg)] p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold" style={{ color: "var(--color-text-primary)" }}>联系人 & 微信二维码</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setData({ ...data, contacts: [...data.contacts, { name: "", role: "商务经理", phone: "", wechat: "", qrCode: "" }] })}
              className="flex items-center gap-1 text-xs cursor-pointer px-3 py-1.5 rounded-[var(--radius-sm)]"
              style={{ backgroundColor: "rgba(99,102,241,0.15)", color: "var(--color-accent-light)" }}
            >
              <Plus size={14} /> 新增联系人
            </button>
            <SaveButton onClick={saveContacts} saving={saving} />
          </div>
        </div>
        <div className="space-y-4">
          {data.contacts.map((contact, idx) => (
            <div key={idx} className="glass-card rounded-[var(--radius-sm)] p-4">
              <div className="flex gap-4">
                {/* 二维码预览 */}
                <div className="shrink-0">
                  <div
                    className="w-28 h-28 rounded-[var(--radius-md)] flex items-center justify-center overflow-hidden"
                    style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid var(--color-border-default)" }}
                  >
                    {contact.qrCode ? (
                      // ponytail: next/image 在 base64 动态 src 下收益低，原生 img 更省事
                      <img src={contact.qrCode} alt={`${contact.name || "联系人"}二维码`} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xs text-center px-2" style={{ color: "var(--color-text-copyright)" }}>未上传二维码</span>
                    )}
                  </div>
                  <label className="mt-2 flex items-center justify-center gap-1 text-xs cursor-pointer px-2 py-1.5 rounded-[var(--radius-sm)] transition-colors" style={{ backgroundColor: "rgba(99,102,241,0.1)", color: "var(--color-accent-light)" }}>
                    <Upload size={12} /> {contact.qrCode ? "更换" : "上传"}
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => handleQrUpload(idx, e.target.files?.[0])} />
                  </label>
                  {contact.qrCode && (
                    <button
                      onClick={() => {
                        const newContacts = [...data.contacts];
                        newContacts[idx] = { ...contact, qrCode: "" };
                        setData({ ...data, contacts: newContacts });
                      }}
                      className="mt-1 w-full text-xs cursor-pointer" style={{ color: "rgb(248,113,113)" }}
                    >移除二维码</button>
                  )}
                </div>
                {/* 文本字段 */}
                <div className="flex-1 grid grid-cols-2 gap-3">
                  <FormField label="姓名">
                    <input
                      value={contact.name}
                      onChange={(e) => {
                        const newContacts = [...data.contacts];
                        newContacts[idx] = { ...contact, name: e.target.value };
                        setData({ ...data, contacts: newContacts });
                      }}
                      placeholder="如 张三"
                      className="form-input"
                    />
                  </FormField>
                  <FormField label="职务">
                    <input
                      value={contact.role}
                      onChange={(e) => {
                        const newContacts = [...data.contacts];
                        newContacts[idx] = { ...contact, role: e.target.value };
                        setData({ ...data, contacts: newContacts });
                      }}
                      placeholder="如 商务经理"
                      className="form-input"
                    />
                  </FormField>
                  <FormField label="电话">
                    <input
                      value={contact.phone}
                      onChange={(e) => {
                        const newContacts = [...data.contacts];
                        newContacts[idx] = { ...contact, phone: e.target.value };
                        setData({ ...data, contacts: newContacts });
                      }}
                      placeholder="如 138-xxxx-xxxx"
                      className="form-input"
                    />
                  </FormField>
                  <FormField label="微信号">
                    <input
                      value={contact.wechat}
                      onChange={(e) => {
                        const newContacts = [...data.contacts];
                        newContacts[idx] = { ...contact, wechat: e.target.value };
                        setData({ ...data, contacts: newContacts });
                      }}
                      placeholder="微信号"
                      className="form-input"
                    />
                  </FormField>
                </div>
                {/* 删除 */}
                <button
                  onClick={() => setData({ ...data, contacts: data.contacts.filter((_, i) => i !== idx) })}
                  className="self-start p-2 cursor-pointer"
                  style={{ color: "rgb(248,113,113)" }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
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
