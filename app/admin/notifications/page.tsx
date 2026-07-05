"use client";

import { useState, useEffect } from "react";
import { Save, Plus, Trash2, Send, Mail, Bell } from "lucide-react";
import { FormField, Toast } from "@/components/admin/AdminShared";

type SmtpConfigDisplay = {
  enabled: boolean;
  host: string;
  port: number;
  secure: boolean;
  username: string;
  encryptedPassword: string | null;
  hasPassword: boolean;
  fromName: string;
  fromEmail: string;
  recipients: string[];
  subjectTemplate: string;
};

export default function AdminNotificationsPage() {
  const [config, setConfig] = useState<SmtpConfigDisplay | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [testRecipient, setTestRecipient] = useState("");
  const [testing, setTesting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    fetch("/api/admin/notifications")
      .then((res) => res.json())
      .then(setConfig);
  }, []);

  const handleSave = async () => {
    if (!config) return;
    setSaving(true);
    try {
      await fetch("/api/admin/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...config,
          newPassword: newPassword || undefined,
        }),
      });
      showToast("配置已保存", "success");
      setNewPassword("");
      // 重新加载以更新 hasPassword 状态
      const res = await fetch("/api/admin/notifications");
      setConfig(await res.json());
    } catch {
      showToast("保存失败", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    if (!testRecipient) {
      showToast("请输入测试收件人邮箱", "error");
      return;
    }
    setTesting(true);
    try {
      const res = await fetch("/api/admin/notifications/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ testRecipient }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("测试邮件发送成功", "success");
      } else {
        showToast(`发送失败: ${data.error}`, "error");
      }
    } catch {
      showToast("测试发送失败", "error");
    } finally {
      setTesting(false);
    }
  };

  if (!config) {
    return <div className="py-20 text-center" style={{ color: "var(--color-text-muted)" }}>加载中...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: "var(--color-text-primary)" }}>
          邮件通知
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--color-text-muted)" }}>
          配置 SMTP 服务器，新咨询自动转发到指定邮箱
        </p>
      </div>

      {/* 启用开关 */}
      <section className="glass-card rounded-[var(--radius-lg)] p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: config.enabled ? "rgba(34,197,94,0.15)" : "rgba(245,158,11,0.15)" }}
            >
              <Bell size={18} style={{ color: config.enabled ? "#22c55e" : "#f59e0b" }} />
            </div>
            <div>
              <h2 className="text-base font-bold" style={{ color: "var(--color-text-primary)" }}>
                通知状态
              </h2>
              <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                {config.enabled ? "已启用 — 新咨询将自动转发" : "已禁用 — 仅在后台查看"}
              </p>
            </div>
          </div>
          <button
            onClick={() => setConfig({ ...config, enabled: !config.enabled })}
            className="relative w-12 h-6 rounded-full cursor-pointer transition-colors"
            style={{ backgroundColor: config.enabled ? "var(--color-accent)" : "var(--color-border-default)" }}
          >
            <span
              className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform"
              style={{ transform: config.enabled ? "translateX(26px)" : "translateX(2px)" }}
            />
          </button>
        </div>
      </section>

      {/* SMTP 配置 */}
      <section className="glass-card rounded-[var(--radius-lg)] p-6 space-y-4">
        <h2 className="text-lg font-bold" style={{ color: "var(--color-text-primary)" }}>SMTP 服务器配置</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <FormField label="SMTP 主机地址" required>
            <input
              value={config.host}
              onChange={(e) => setConfig({ ...config, host: e.target.value })}
              placeholder="smtp.exmail.qq.com"
              className="form-input"
            />
          </FormField>
          <FormField label="端口">
            <input
              type="number"
              value={config.port}
              onChange={(e) => setConfig({ ...config, port: Number(e.target.value) })}
              className="form-input"
            />
          </FormField>
          <FormField label="加密方式">
            <select
              value={config.secure ? "true" : "false"}
              onChange={(e) => setConfig({ ...config, secure: e.target.value === "true" })}
              className="form-input cursor-pointer"
            >
              <option value="true">SSL/TLS (端口 465)</option>
              <option value="false">STARTTLS (端口 587)</option>
            </select>
          </FormField>
          <FormField label="发件人名称">
            <input
              value={config.fromName}
              onChange={(e) => setConfig({ ...config, fromName: e.target.value })}
              className="form-input"
            />
          </FormField>
          <FormField label="用户名（发件邮箱）" required>
            <input
              value={config.username}
              onChange={(e) => setConfig({ ...config, username: e.target.value, fromEmail: e.target.value })}
              placeholder="noreply@huanyinai.com"
              className="form-input"
            />
          </FormField>
          <FormField label="发件邮箱地址">
            <input
              value={config.fromEmail}
              onChange={(e) => setConfig({ ...config, fromEmail: e.target.value })}
              placeholder="noreply@huanyinai.com"
              className="form-input"
            />
          </FormField>
        </div>
        <FormField label={config.hasPassword ? "SMTP 密码（已配置，如需修改请输入新密码）" : "SMTP 密码"}>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder={config.hasPassword ? "••••••••（保留则不修改）" : "请输入 SMTP 密码"}
            className="form-input"
          />
        </FormField>
      </section>

      {/* 收件人管理 */}
      <section className="glass-card rounded-[var(--radius-lg)] p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold" style={{ color: "var(--color-text-primary)" }}>
            通知收件人
          </h2>
          <button
            onClick={() => setConfig({ ...config, recipients: [...config.recipients, ""] })}
            className="flex items-center gap-1 text-xs cursor-pointer px-3 py-1.5 rounded-[var(--radius-sm)]"
            style={{ backgroundColor: "rgba(99,102,241,0.15)", color: "var(--color-accent-light)" }}
          >
            <Plus size={14} /> 新增收件人
          </button>
        </div>
        <div className="space-y-2">
          {config.recipients.length === 0 && (
            <p className="text-sm py-4 text-center" style={{ color: "var(--color-text-muted)" }}>
              暂无收件人，点击「新增收件人」添加
            </p>
          )}
          {config.recipients.map((email, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <Mail size={16} style={{ color: "var(--color-text-muted)" }} />
              <input
                value={email}
                onChange={(e) => {
                  const newRecipients = [...config.recipients];
                  newRecipients[idx] = e.target.value;
                  setConfig({ ...config, recipients: newRecipients });
                }}
                placeholder="recipient@example.com"
                className="form-input flex-1"
              />
              <button
                onClick={() => setConfig({ ...config, recipients: config.recipients.filter((_, i) => i !== idx) })}
                className="p-2 cursor-pointer"
                style={{ color: "rgb(248,113,113)" }}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 邮件模板 */}
      <section className="glass-card rounded-[var(--radius-lg)] p-6">
        <h2 className="text-lg font-bold mb-4" style={{ color: "var(--color-text-primary)" }}>邮件主题模板</h2>
        <FormField label="支持变量：{name} {company} {phone}">
          <input
            value={config.subjectTemplate}
            onChange={(e) => setConfig({ ...config, subjectTemplate: e.target.value })}
            className="form-input"
          />
        </FormField>
      </section>

      {/* 测试发送 */}
      <section className="glass-card rounded-[var(--radius-lg)] p-6">
        <h2 className="text-lg font-bold mb-4" style={{ color: "var(--color-text-primary)" }}>发送测试邮件</h2>
        <p className="text-sm mb-4" style={{ color: "var(--color-text-muted)" }}>
          保存配置后，可发送一封测试邮件验证 SMTP 是否正确
        </p>
        <div className="flex items-center gap-3">
          <input
            type="email"
            value={testRecipient}
            onChange={(e) => setTestRecipient(e.target.value)}
            placeholder="your@email.com"
            className="form-input flex-1"
          />
          <button
            onClick={handleTest}
            disabled={testing}
            className="flex items-center gap-2 px-4 py-2 rounded-[var(--radius-sm)] text-sm font-medium cursor-pointer transition-colors disabled:opacity-50 shrink-0"
            style={{ backgroundColor: "rgba(99,102,241,0.15)", color: "var(--color-accent-light)" }}
          >
            <Send size={16} />
            {testing ? "发送中..." : "发送测试"}
          </button>
        </div>
      </section>

      {/* 保存按钮 */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 rounded-[var(--radius-sm)] text-sm font-medium cursor-pointer transition-colors disabled:opacity-50"
          style={{ backgroundColor: "var(--color-accent)", color: "white" }}
        >
          <Save size={16} />
          {saving ? "保存中..." : "保存全部配置"}
        </button>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}
