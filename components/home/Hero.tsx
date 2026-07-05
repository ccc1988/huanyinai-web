import Link from "next/link";
import { ArrowRight, ChevronDown } from "lucide-react";
import type { StatItem } from "@/lib/data";
import NeuralBackground from "./NeuralBackground";

export default function Hero({ stats }: { stats: StatItem[] }) {
  const hudMetrics = stats.map((s) => ({
    label: s.label,
    value: `${s.value}${s.suffix || ""}`,
  }));

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-24">
      {/* ===== Background Layers ===== */}

      {/* Layer 1: Solid base */}
      <div className="absolute inset-0 -z-10" style={{ backgroundColor: "var(--color-bg-base)" }} />

      {/* Layer 2: Radial gradients (透明度略降，避免与新粒子层抢戏) */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 50% 0%, rgba(99,102,241,0.12) 0%, transparent 50%),
            radial-gradient(ellipse 60% 40% at 80% 15%, rgba(139,92,246,0.07) 0%, transparent 45%),
            radial-gradient(ellipse 50% 30% at 20% 25%, rgba(6,182,212,0.04) 0%, transparent 40%)
          `,
        }}
      />

      {/* Layer 3: Grid lines */}
      <div className="absolute inset-0 -z-10 accent-glow" />
      <div className="absolute inset-0 -z-10 grid-bg" />

      {/* Layer 4-5: Neural field (星尘 + 神经网络 + 数据流 + 鼠标交互) */}
      <NeuralBackground />

      {/* Scanline overlay */}
      <div className="absolute inset-0 -z-10 scanline-overlay" />

      {/* ===== Main Content ===== */}
      <div className="container-max flex flex-col items-center text-center">
        {/* Pill tag */}
        <div className="hero-fade hero-delay-0">
          <span className="pill-tag">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] pulse-dot" />
            AI 驱动 · 产业数字化
          </span>
        </div>

        {/* Main title — enhanced size + gradient */}
        <h1
          className="hero-fade hero-delay-1 mt-8 text-center font-bold leading-tight"
          style={{
            fontSize: "clamp(2.5rem, 7vw, 4.5rem)",
          }}
        >
          <span
            className="block bg-clip-text text-transparent"
            style={{
              backgroundImage: "linear-gradient(135deg, #F8FAFC 0%, #C7D2FE 50%, #818CF8 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            AI 智能体 与 RPA 自动化
          </span>
          <span className="block mt-2" style={{ color: "var(--color-text-primary)" }}>
            重构企业每一个业务环节
          </span>
        </h1>

        {/* Subtitle */}
        <p
          className="hero-fade hero-delay-2 mt-6 max-w-2xl text-center leading-relaxed"
          style={{
            color: "var(--color-text-body)",
            fontSize: "clamp(1rem, 2.5vw, 1.25rem)",
            fontWeight: 400,
            lineHeight: 1.8,
          }}
        >
          为物流、跨境、制造、制药等行业提供可落地的 AI 解决方案
        </p>

        {/* CTA buttons */}
        <div className="hero-fade hero-delay-3 mt-10 flex flex-col sm:flex-row gap-4">
          <Link href="/contact" className="cta-primary">
            预约 AI 解决方案咨询
            <ArrowRight size={18} />
          </Link>
          <Link href="/cases/customs-document-ai" className="cta-secondary">
            查看案例
          </Link>
        </div>

        {/* HUD Metrics Bar — 实时数据指标状态栏 */}
        <div className="hero-fade hero-delay-4 mt-14 w-full max-w-2xl">
          <div
            className="hud-corners rounded-[var(--radius-md)] px-6 py-4 flex items-center justify-between gap-4"
            style={{
              backgroundColor: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.06)",
              backdropFilter: "blur(8px)",
            }}
          >
            {hudMetrics.map((m, i) => (
              <div key={m.label} className="flex flex-col items-center gap-1 flex-1">
                <span
                  className="font-[family-name:var(--font-heading)] font-bold text-lg"
                  style={{ color: "var(--color-accent-light)" }}
                >
                  {m.value}
                </span>
                <span className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                  {m.label}
                </span>
                {i < hudMetrics.length - 1 && (
                  <div
                    className="hidden sm:block absolute h-6 w-px"
                    style={{
                      backgroundColor: "rgba(255,255,255,0.06)",
                      right: 0,
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Scroll down indicator */}
        <div className="hero-fade hero-delay-5 mt-12 mb-8">
          <ChevronDown
            size={24}
            className="scroll-indicator"
            style={{ color: "var(--color-text-muted)" }}
          />
        </div>
      </div>

      {/* Bottom horizon glow transition */}
      <div className="absolute bottom-0 left-0 right-0 h-32 horizon-glow pointer-events-none" />
    </section>
  );
}
