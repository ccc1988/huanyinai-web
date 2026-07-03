"use client";

import { useState, FormEvent } from "react";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";

type Status = "idle" | "loading" | "success" | "error";

export default function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (data: FormData): Record<string, string> => {
    const errs: Record<string, string> = {};
    const name = data.get("name") as string;
    const company = data.get("company") as string;
    const phone = data.get("phone") as string;
    const message = data.get("message") as string;

    if (!name || name.trim().length < 2) {
      errs.name = "请输入您的姓名";
    }
    if (!company || company.trim().length < 2) {
      errs.company = "请输入公司名称";
    }
    if (!phone || phone.trim().length < 6) {
      errs.phone = "请输入有效的联系方式";
    }
    if (!message || message.trim().length < 10) {
      errs.message = "请简要描述您的需求（至少 10 个字）";
    }
    return errs;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const errs = validate(formData);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setStatus("loading");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.get("name"),
          company: formData.get("company"),
          phone: formData.get("phone"),
          email: formData.get("email"),
          message: formData.get("message"),
        }),
      });

      if (res.ok) {
        setStatus("success");
        (e.target as HTMLFormElement).reset();
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="glass-card rounded-[var(--radius-lg)] p-8 text-center">
        <CheckCircle size={48} className="mx-auto mb-4" style={{ color: "var(--color-accent-light)" }} />
        <h3 className="text-xl font-bold mb-2" style={{ color: "var(--color-text-primary)" }}>
          提交成功
        </h3>
        <p className="text-sm" style={{ color: "var(--color-text-body)" }}>
          我们会在 24 小时内与您联系，请留意手机或微信。
        </p>
        <button
          onClick={() => setStatus("idle")}
          className="mt-6 cta-secondary text-sm cursor-pointer"
        >
          再次提交
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="glass-card rounded-[var(--radius-lg)] p-8 space-y-5" noValidate>
      {/* Name */}
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium mb-2"
          style={{ color: "var(--color-text-muted)" }}
        >
          姓名 <span style={{ color: "var(--color-accent-light)" }}>*</span>
        </label>
        <input
          type="text"
          id="name"
          name="name"
          placeholder="请输入您的姓名"
          aria-required="true"
          aria-invalid={!!errors.name}
          className="w-full px-4 py-3 rounded-[var(--radius-sm)] text-base transition-colors"
          style={{
            backgroundColor: "rgba(255,255,255,0.05)",
            border: `1px solid ${errors.name ? "rgba(239,68,68,0.5)" : "var(--color-border-default)"}`,
            color: "var(--color-text-primary)",
          }}
        />
        {errors.name && (
          <p role="alert" className="mt-1 text-xs flex items-center gap-1" style={{ color: "#ef4444" }}>
            <AlertCircle size={12} />
            {errors.name}
          </p>
        )}
      </div>

      {/* Company */}
      <div>
        <label
          htmlFor="company"
          className="block text-sm font-medium mb-2"
          style={{ color: "var(--color-text-muted)" }}
        >
          公司名称 <span style={{ color: "var(--color-accent-light)" }}>*</span>
        </label>
        <input
          type="text"
          id="company"
          name="company"
          placeholder="请输入公司名称"
          aria-required="true"
          aria-invalid={!!errors.company}
          className="w-full px-4 py-3 rounded-[var(--radius-sm)] text-base transition-colors"
          style={{
            backgroundColor: "rgba(255,255,255,0.05)",
            border: `1px solid ${errors.company ? "rgba(239,68,68,0.5)" : "var(--color-border-default)"}`,
            color: "var(--color-text-primary)",
          }}
        />
        {errors.company && (
          <p role="alert" className="mt-1 text-xs flex items-center gap-1" style={{ color: "#ef4444" }}>
            <AlertCircle size={12} />
            {errors.company}
          </p>
        )}
      </div>

      {/* Phone + Email */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="phone"
            className="block text-sm font-medium mb-2"
            style={{ color: "var(--color-text-muted)" }}
          >
            联系电话 <span style={{ color: "var(--color-accent-light)" }}>*</span>
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            placeholder="手机号或座机"
            aria-required="true"
            aria-invalid={!!errors.phone}
            className="w-full px-4 py-3 rounded-[var(--radius-sm)] text-base transition-colors"
            style={{
              backgroundColor: "rgba(255,255,255,0.05)",
              border: `1px solid ${errors.phone ? "rgba(239,68,68,0.5)" : "var(--color-border-default)"}`,
              color: "var(--color-text-primary)",
            }}
          />
          {errors.phone && (
            <p role="alert" className="mt-1 text-xs flex items-center gap-1" style={{ color: "#ef4444" }}>
              <AlertCircle size={12} />
              {errors.phone}
            </p>
          )}
        </div>
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium mb-2"
            style={{ color: "var(--color-text-muted)" }}
          >
            邮箱（选填）
          </label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="your@email.com"
            className="w-full px-4 py-3 rounded-[var(--radius-sm)] text-base transition-colors"
            style={{
              backgroundColor: "rgba(255,255,255,0.05)",
              border: "1px solid var(--color-border-default)",
              color: "var(--color-text-primary)",
            }}
          />
        </div>
      </div>

      {/* Message */}
      <div>
        <label
          htmlFor="message"
          className="block text-sm font-medium mb-2"
          style={{ color: "var(--color-text-muted)" }}
        >
          需求描述 <span style={{ color: "var(--color-accent-light)" }}>*</span>
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          placeholder="请简要描述您的业务场景和 AI 需求"
          aria-required="true"
          aria-invalid={!!errors.message}
          className="w-full px-4 py-3 rounded-[var(--radius-sm)] text-base resize-none transition-colors"
          style={{
            backgroundColor: "rgba(255,255,255,0.05)",
            border: `1px solid ${errors.message ? "rgba(239,68,68,0.5)" : "var(--color-border-default)"}`,
            color: "var(--color-text-primary)",
          }}
        />
        {errors.message && (
          <p role="alert" className="mt-1 text-xs flex items-center gap-1" style={{ color: "#ef4444" }}>
            <AlertCircle size={12} />
            {errors.message}
          </p>
        )}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={status === "loading"}
        className="cta-primary w-full justify-center cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {status === "loading" ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            提交中...
          </>
        ) : (
          "提交咨询"
        )}
      </button>

      {status === "error" && (
        <p role="alert" className="text-sm text-center flex items-center justify-center gap-1" style={{ color: "#ef4444" }}>
          <AlertCircle size={14} />
          提交失败，请稍后重试或直接添加微信 {`huanyin-ai`}
        </p>
      )}
    </form>
  );
}
