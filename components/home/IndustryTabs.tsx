"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import { ArrowRight, AlertTriangle, Lightbulb } from "lucide-react";
import SectionTitle from "@/components/ui/SectionTitle";
import type { IndustrySolution } from "@/lib/data";
import { getIndustryIcon } from "@/lib/industryIcons";

export default function IndustryTabs({ industries }: { industries: IndustrySolution[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const shouldReduceMotion = useReducedMotion();
  const active = industries[activeIndex];

  return (
    <section className="section-decor py-24 relative" style={{ backgroundColor: "var(--color-bg-elevated)" }}>
      {/* 背景网格 */}
      <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
      <div className="container-max relative">
        <SectionTitle>行业解决方案</SectionTitle>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {industries.map((ind, idx) => {
            const Icon = getIndustryIcon(ind.slug);
            return (
            <button
              key={ind.slug}
              onClick={() => setActiveIndex(idx)}
              className="cursor-pointer px-5 py-2.5 text-sm font-medium transition-all duration-300 relative flex items-center gap-2 rounded-full"
              style={{
                color: idx === activeIndex
                  ? "var(--color-text-primary)"
                  : "var(--color-text-muted)",
                backgroundColor: idx === activeIndex
                  ? "rgba(99,102,241,0.1)"
                  : "transparent",
                border: idx === activeIndex
                  ? "1px solid rgba(99,102,241,0.3)"
                  : "1px solid transparent",
              }}
            >
              <Icon size={16} />
              {ind.title.replace(/ AI 解决方案.*/, "")}
              {idx === activeIndex && (
                <motion.span
                  layoutId={!shouldReduceMotion ? "active-tab" : undefined}
                  className="absolute -bottom-0.5 left-0 right-0 h-0.5"
                  style={{ backgroundColor: "var(--color-accent)" }}
                />
              )}
            </button>
            );
          })}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={active.slug}
            initial={shouldReduceMotion ? undefined : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={shouldReduceMotion ? undefined : { opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="grid md:grid-cols-2 gap-8">
              {/* Pain points */}
              <div
                className="rounded-[var(--radius-lg)] p-8 relative"
                style={{
                  backgroundColor: "rgba(255,255,255,0.03)",
                  border: "1px solid var(--color-border-default)",
                }}
              >
                {/* 标题区带图标 */}
                <div className="flex items-center gap-2 mb-5">
                  <AlertTriangle size={16} style={{ color: "var(--color-text-muted)" }} />
                  <h3
                    className="text-sm font-semibold uppercase tracking-wider"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    客户痛点
                  </h3>
                </div>
                <ul className="space-y-4">
                  {active.painPoints.map((point, i) => (
                    <li
                      key={i}
                      className="text-base flex items-start gap-3"
                      style={{ color: "var(--color-text-body)" }}
                    >
                      <span
                        className="mt-0.5 w-5 h-5 rounded-md flex items-center justify-center shrink-0 text-xs font-mono font-bold"
                        style={{
                          backgroundColor: "rgba(255,255,255,0.05)",
                          color: "var(--color-text-muted)",
                        }}
                      >
                        {i + 1}
                      </span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Solution */}
              <div
                className="rounded-[var(--radius-lg)] p-8 relative"
                style={{
                  backgroundColor: "rgba(255,255,255,0.03)",
                  border: "1px solid var(--color-border-default)",
                }}
              >
                {/* 标题区带图标 */}
                <div className="flex items-center gap-2 mb-5">
                  <Lightbulb size={16} style={{ color: "var(--color-accent-light)" }} />
                  <h3
                    className="text-sm font-semibold uppercase tracking-wider"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    解决方案
                  </h3>
                </div>
                <p
                  className="text-base leading-relaxed"
                  style={{ color: "var(--color-text-body)" }}
                >
                  {active.solutionSummary}
                </p>
                {/* 关联案例标签 */}
                {active.relatedCases.length > 0 && (
                  <div
                    className="mt-6 pt-4 flex flex-wrap gap-2"
                    style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}
                  >
                    {active.relatedCases.map((slug) => (
                      <span
                        key={slug}
                        className="text-xs px-2.5 py-1 rounded-full"
                        style={{
                          backgroundColor: "rgba(99,102,241,0.1)",
                          color: "var(--color-accent-light)",
                        }}
                      >
                        {slug.replace(/-/g, " ")}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Link */}
            <div className="mt-6 text-center">
              <Link
                href={`/solutions/${active.slug}`}
                className="inline-flex items-center gap-1 text-sm font-medium transition-colors"
                style={{ color: "var(--color-accent-light)" }}
              >
                查看全部案例
                <ArrowRight size={14} />
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
