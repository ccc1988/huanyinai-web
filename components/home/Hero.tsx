"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { customers } from "@/lib/data";

const heroLogos = customers.slice(0, 6);

export default function Hero() {
  const shouldReduceMotion = useReducedMotion();

  const fadeUp = (delay: number) =>
    shouldReduceMotion
      ? { initial: { opacity: 1, y: 0 }, animate: { opacity: 1, y: 0 } }
      : {
          initial: { opacity: 0, y: 20 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.6, ease: "easeOut" as const, delay },
        };

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-24">
      {/* Background layers */}
      <div className="absolute inset-0 -z-10" style={{ backgroundColor: "var(--color-bg-base)" }} />
      <div className="absolute inset-0 -z-10 accent-glow" />
      <div className="absolute inset-0 -z-10 grid-bg" />

      <div className="container-max flex flex-col items-center text-center">
        {/* Pill tag */}
        <motion.div {...fadeUp(0)}>
          <span className="pill-tag">AI 驱动 · 产业数字化</span>
        </motion.div>

        {/* Main title */}
        <motion.h1
          {...fadeUp(0.2)}
          className="mt-8 text-center font-bold leading-tight"
          style={{
            color: "var(--color-text-primary)",
            fontSize: "clamp(2.5rem, 6vw, 4rem)",
          }}
        >
          AI 智能体 与 RPA 自动化
          <br />
          重构企业每一个业务环节
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          {...fadeUp(0.4)}
          className="mt-6 max-w-2xl text-center"
          style={{
            color: "var(--color-text-body)",
            fontSize: "clamp(1rem, 2.5vw, 1.5rem)",
            fontWeight: 400,
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

        {/* Client logos preview */}
        <motion.div
          {...fadeUp(1.0)}
          className="mt-20 w-full"
        >
          <p
            className="text-center text-sm mb-6"
            style={{ color: "var(--color-text-logo)" }}
          >
            ─ ─ ─ 已合作企业 ─ ─ ─
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
            {heroLogos.map((customer) => (
              <span
                key={customer.name}
                className="text-sm font-medium transition-colors duration-200 hover:text-[var(--color-text-body)] cursor-default"
                style={{ color: "var(--color-text-logo)" }}
              >
                {customer.name}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
