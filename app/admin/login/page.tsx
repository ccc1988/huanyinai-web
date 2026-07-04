"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, ArrowRight } from "lucide-react";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        router.push("/admin");
      } else {
        const data = await res.json();
        setError(data.error || "登录失败");
      }
    } catch {
      setError("网络错误，请重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "var(--color-bg-base)" }}>
      <div className="w-full max-w-md px-6">
        <div className="text-center mb-8">
          <div
            className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center"
            style={{ backgroundColor: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)" }}
          >
            <Lock size={28} style={{ color: "var(--color-accent-light)" }} />
          </div>
          <h1 className="text-2xl font-bold mb-2" style={{ color: "var(--color-text-primary)" }}>
            寰引智能管理后台
          </h1>
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
            请输入管理员密码
          </p>
        </div>

        <form onSubmit={handleSubmit} className="glass-card rounded-[var(--radius-lg)] p-8">
          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium mb-2" style={{ color: "var(--color-text-body)" }}>
              密码
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-[var(--radius-sm)] outline-none transition-colors"
              style={{
                backgroundColor: "rgba(255,255,255,0.05)",
                border: "1px solid var(--color-border-default)",
                color: "var(--color-text-primary)",
              }}
              placeholder="请输入密码"
              autoComplete="current-password"
              autoFocus
              required
            />
          </div>

          {error && (
            <p className="text-sm mb-4" style={{ color: "#ef4444" }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="cta-primary w-full justify-center disabled:opacity-50"
          >
            {loading ? "登录中..." : "登录"}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <p className="text-center text-xs mt-6" style={{ color: "var(--color-text-logo)" }}>
          寰引智能科技（深圳）有限公司
        </p>
      </div>
    </div>
  );
}
