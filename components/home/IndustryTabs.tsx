"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";
import SectionTitle from "@/components/ui/SectionTitle";
import { industries } from "@/lib/data";
import { getIndustryIcon } from "@/lib/industryIcons";

export default function IndustryTabs() {
  const [activeIndex, setActiveIndex] = useState(0);
  const shouldReduceMotion = useReducedMotion();
  const active = industries[activeIndex];

  return (
    <section className="py-24" style={{ backgroundColor: "var(--color-bg-elevated)" }}>
      <div className="container-max">
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
                className="rounded-[var(--radius-lg)] p-8"
                style={{
                  backgroundColor: "rgba(255,255,255,0.03)",
                  border: "1px solid var(--color-border-default)",
                }}
              >
                <h3
                  className="text-sm font-semibold mb-4"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  客户痛点
                </h3>
                <ul className="space-y-3">
                  {active.painPoints.map((point, i) => (
                    <li
                      key={i}
                      className="text-base flex items-start gap-2"
                      style={{ color: "var(--color-text-body)" }}
                    >
                      <span style={{ color: "var(--color-text-muted)" }}>·</span>
                      {point}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Solution */}
              <div
                className="rounded-[var(--radius-lg)] p-8"
                style={{
                  backgroundColor: "rgba(255,255,255,0.03)",
                  border: "1px solid var(--color-border-default)",
                }}
              >
                <h3
                  className="text-sm font-semibold mb-4"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  解决方案
                </h3>
                <p
                  className="text-base leading-relaxed"
                  style={{ color: "var(--color-text-body)" }}
                >
                  {active.solutionSummary}
                </p>
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
