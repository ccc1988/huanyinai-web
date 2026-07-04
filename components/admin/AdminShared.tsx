"use client";

import { X, Save } from "lucide-react";

// ===== 编辑模态框 =====
export function EditModal({
  title,
  onClose,
  onSave,
  saving,
  children,
}: {
  title: string;
  onClose: () => void;
  onSave: () => void;
  saving: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center p-4 overflow-y-auto"
      style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
    >
      <div
        className="glass-card rounded-[var(--radius-lg)] w-full max-w-3xl my-8"
        style={{ backgroundColor: "var(--color-bg-elevated)" }}
      >
        <div
          className="flex items-center justify-between p-6 border-b"
          style={{ borderColor: "var(--color-border-default)" }}
        >
          <h2 className="text-lg font-bold" style={{ color: "var(--color-text-primary)" }}>
            {title}
          </h2>
          <button onClick={onClose} className="cursor-pointer" style={{ color: "var(--color-text-muted)" }}>
            <X size={20} />
          </button>
        </div>
        <div className="p-6">{children}</div>
        <div
          className="flex items-center justify-end gap-3 p-6 border-t"
          style={{ borderColor: "var(--color-border-default)" }}
        >
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-[var(--radius-sm)] text-sm cursor-pointer transition-colors"
            style={{ color: "var(--color-text-muted)" }}
          >
            取消
          </button>
          <button
            onClick={onSave}
            disabled={saving}
            className="flex items-center gap-2 px-4 py-2 rounded-[var(--radius-sm)] text-sm font-medium cursor-pointer transition-colors disabled:opacity-50"
            style={{ backgroundColor: "var(--color-accent)", color: "white" }}
          >
            <Save size={16} />
            {saving ? "保存中..." : "保存"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ===== 表单字段包装 =====
export function FormField({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--color-text-muted)" }}>
        {label} {required && <span style={{ color: "rgb(248,113,113)" }}>*</span>}
      </label>
      {children}
    </div>
  );
}

// ===== 数组编辑器（textarea，一行一条）=====
export function ArrayEditor({
  value,
  onChange,
  rows,
}: {
  value: string[];
  onChange: (v: string[]) => void;
  rows?: number;
}) {
  return (
    <textarea
      value={value.join("\n")}
      onChange={(e) => onChange(e.target.value.split("\n").filter((l) => l.trim()))}
      rows={rows || Math.min(value.length + 1, 8)}
      className="form-input resize-none"
      placeholder="每行一条..."
    />
  );
}

// ===== Toast 提示 =====
export function Toast({ message, type }: { message: string; type: "success" | "error" }) {
  return (
    <div
      className="fixed bottom-6 right-6 z-[200] px-4 py-3 rounded-[var(--radius-sm)] text-sm font-medium shadow-lg"
      style={{
        backgroundColor: type === "success" ? "rgba(34,197,94,0.9)" : "rgba(239,68,68,0.9)",
        color: "white",
      }}
    >
      {message}
    </div>
  );
}

// ===== 列表页通用搜索栏 =====
export function SearchBar({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-2.5 rounded-[var(--radius-sm)] text-sm outline-none mb-4"
      style={{
        backgroundColor: "var(--color-bg-elevated)",
        border: "1px solid var(--color-border-default)",
        color: "var(--color-text-primary)",
      }}
    />
  );
}
