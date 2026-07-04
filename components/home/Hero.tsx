"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { customers } from "@/lib/data";
import { getCustomerIcon } from "@/lib/customerIcons";

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

      {/* Floating orbs */}
      <motion.div
        animate={shouldReduceMotion ? undefined : { y: [0, -20, 0], opacity: [0.3, 0.5, 0.3] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/4 left-[10%] w-64 h-64 rounded-full -z-10"
        style={{ background: "radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)" }}
      />
      <motion.div
        animate={shouldReduceMotion ? undefined : { y: [0, 30, 0], opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute bottom-1/4 right-[10%] w-80 h-80 rounded-full -z-10"
        style={{ background: "radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)" }}
      />

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
          <div className="flex flex-wrap items-center justify-center gap-6">
            {heroLogos.map((customer) => {
              const { icon: Icon, color } = getCustomerIcon(customer.name);
              return (
                <div
                  key={customer.name}
                  className="flex items-center gap-2 transition-all duration-200 hover:scale-105 cursor-default"
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${color}1A`, border: `1px solid ${color}25` }}
                  >
                    <Icon size={16} style={{ color }} />
                  </div>
                  <span
                    className="text-sm font-medium transition-colors duration-200 hover:text-[var(--color-text-body)]"
                    style={{ color: "var(--color-text-logo)" }}
                  >
                    {customer.name}
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
