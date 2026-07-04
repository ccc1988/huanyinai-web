"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ChevronDown } from "lucide-react";

/* HUD 实时指标条数据 */
const hudMetrics = [
  { label: "企业客户", value: "10+" },
  { label: "落地系统", value: "11+" },
  { label: "行业覆盖", value: "6" },
  { label: "人效提升", value: "10x" },
];

export default function Hero() {
  const shouldReduceMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fadeUp = (delay: number) =>
    !mounted || shouldReduceMotion
      ? { initial: { opacity: 1, y: 0 }, animate: { opacity: 1, y: 0 } }
      : {
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.6, ease: "easeOut" as const, delay },
        };

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-24">
      {/* ===== Background Layers (5 layers) ===== */}

      {/* Layer 1: Solid base */}
      <div className="absolute inset-0 -z-10" style={{ backgroundColor: "var(--color-bg-base)" }} />

      {/* Layer 2: Enhanced radial gradients — larger and more vivid */}
      <div
        className="absolute inset-0 -z-10"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 50% 0%, rgba(99,102,241,0.2) 0%, transparent 50%),
            radial-gradient(ellipse 60% 40% at 80% 15%, rgba(139,92,246,0.12) 0%, transparent 45%),
            radial-gradient(ellipse 50% 30% at 20% 25%, rgba(6,182,212,0.06) 0%, transparent 40%)
          `,
        }}
      />

      {/* Layer 3: Grid lines (enhanced opacity) */}
      <div className="absolute inset-0 -z-10 accent-glow" />
      <div className="absolute inset-0 -z-10 grid-bg" />

      {/* Layer 4: Starfield particles */}
      <div className="absolute inset-0 -z-10 starfield" />

      {/* Layer 5: Scanline overlay */}
      <div className="absolute inset-0 -z-10 scanline-overlay" />

      {/* ===== Floating orbs — 5 orbs, larger, more dynamic ===== */}
      <motion.div
        animate={shouldReduceMotion ? undefined : {
          y: [0, -40, 0],
          x: [0, 15, 0],
          opacity: [0.3, 0.7, 0.3],
          scale: [1, 1.08, 1],
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[12%] left-[6%] w-80 h-80 rounded-full -z-10 blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(99,102,241,0.14) 0%, transparent 70%)" }}
      />
      <motion.div
        animate={shouldReduceMotion ? undefined : {
          y: [0, 50, 0],
          x: [0, -20, 0],
          opacity: [0.2, 0.55, 0.2],
          scale: [1, 1.1, 1],
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
        className="absolute bottom-[15%] right-[5%] w-[28rem] h-[28rem] rounded-full -z-10 blur-3xl"
        style={{ background: "radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)" }}
      />
      <motion.div
        animate={shouldReduceMotion ? undefined : {
          y: [0, 30, 0],
          opacity: [0.15, 0.4, 0.15],
        }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 3 }}
        className="absolute top-[55%] left-[12%] w-56 h-56 rounded-full -z-10 blur-2xl"
        style={{ background: "radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)" }}
      />
      {/* New orb — top-right cyan accent */}
      <motion.div
        animate={shouldReduceMotion ? undefined : {
          y: [0, -20, 0],
          x: [0, -10, 0],
          opacity: [0.1, 0.3, 0.1],
        }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        className="absolute top-[20%] right-[12%] w-44 h-44 rounded-full -z-10 blur-2xl"
        style={{ background: "radial-gradient(circle, rgba(6,182,212,0.08) 0%, transparent 70%)" }}
      />
      {/* New orb — bottom-left warm accent */}
      <motion.div
        animate={shouldReduceMotion ? undefined : {
          y: [0, 20, 0],
          opacity: [0.1, 0.25, 0.1],
        }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 4 }}
        className="absolute bottom-[30%] left-[25%] w-40 h-40 rounded-full -z-10 blur-2xl"
        style={{ background: "radial-gradient(circle, rgba(168,85,247,0.08) 0%, transparent 70%)" }}
      />

      {/* ===== Main Content ===== */}
      <div className="container-max flex flex-col items-center text-center">
        {/* Pill tag */}
        <motion.div {...fadeUp(0)}>
          <span className="pill-tag">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] pulse-dot" />
            AI 驱动 · 产业数字化
          </span>
        </motion.div>

        {/* Main title — enhanced size + gradient */}
        <motion.h1
          {...fadeUp(0.2)}
          className="mt-8 text-center font-bold leading-tight"
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
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          {...fadeUp(0.4)}
          className="mt-6 max-w-2xl text-center leading-relaxed"
          style={{
            color: "var(--color-text-body)",
            fontSize: "clamp(1rem, 2.5vw, 1.25rem)",
            fontWeight: 400,
            lineHeight: 1.8,
          }}
        >
          为物流、跨境、制造、制药等行业提供可落地的 AI 解决方案
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          {...fadeUp(0.6)}
          className="mt-10 flex flex-col sm:flex-row gap-4"
        >
          <Link href="/contact" className="cta-primary">
            预约 AI 解决方案咨询
            <ArrowRight size={18} />
          </Link>
          <Link href="/cases/customs-document-ai" className="cta-secondary">
            查看案例
          </Link>
        </motion.div>

        {/* HUD Metrics Bar — 实时数据指标状态栏 */}
        <motion.div
          {...fadeUp(0.8)}
          className="mt-14 w-full max-w-2xl"
        >
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
        </motion.div>

        {/* Scroll down indicator */}
        <motion.div
          {...fadeUp(1.0)}
          className="mt-12 mb-8"
        >
          <ChevronDown
            size={24}
            className="scroll-indicator"
            style={{ color: "var(--color-text-muted)" }}
          />
        </motion.div>
      </div>

      {/* Bottom horizon glow transition */}
      <div className="absolute bottom-0 left-0 right-0 h-32 horizon-glow pointer-events-none" />
    </section>
  );
}
