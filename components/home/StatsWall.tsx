"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";
import { Building2, Monitor, Globe, TrendingUp } from "lucide-react";
import type { StatItem } from "@/lib/data";

/* 为每个指标分配图标 */
const statIcons = [Building2, Monitor, Globe, TrendingUp];

function CountUp({ value, suffix }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const [display, setDisplay] = useState(0);
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    if (animated) return;
    if (!inView) {
      // Fallback: if IO doesn't trigger within 3s, show final value
      const timer = setTimeout(() => {
        if (!animated) {
          setDisplay(value);
          setAnimated(true);
        }
      }, 3000);
      return () => clearTimeout(timer);
    }
    setAnimated(true);
    const duration = 1500;
    const start = Date.now();
    const animate = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.floor(eased * value));
      if (progress < 1) requestAnimationFrame(animate);
      else setDisplay(value);
    };
    requestAnimationFrame(animate);
  }, [inView, value, animated]);

  return (
    <span
      ref={ref}
      className="font-[family-name:var(--font-heading)] font-bold text-[clamp(2.5rem,5vw,3.5rem)]"
      style={{
        color: "var(--color-text-primary)",
        background: "linear-gradient(135deg, #F8FAFC 0%, #C7D2FE 100%)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
      }}
    >
      {display}
      {suffix}
    </span>
  );
}

export default function StatsWall({ stats }: { stats: StatItem[] }) {
  return (
    <section className="py-24 relative overflow-hidden" style={{ backgroundColor: "var(--color-bg-elevated)" }}>
      {/* 背景装饰层 */}
      <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at 50% 50%, rgba(99,102,241,0.06) 0%, transparent 60%)",
        }}
      />

      <div className="container-max relative">
        {/* 标题 */}
        <div className="text-center mb-14">
          <h2
            className="text-[clamp(1.75rem,4vw,2.5rem)] font-bold"
            style={{ color: "var(--color-text-primary)" }}
          >
            用数据证明实力
          </h2>
          <p className="mt-3 text-base" style={{ color: "var(--color-text-muted)" }}>
            持续为企业创造可量化的 AI 价值
          </p>
        </div>

        {/* 数据卡片网格 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, idx) => {
            const Icon = statIcons[idx % statIcons.length];
            return (
              <div
                key={stat.label}
                className="glass-card hud-corners rounded-[var(--radius-lg)] p-8 text-center flex flex-col items-center gap-3"
              >
                {/* 图标 */}
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-2"
                  style={{
                    background: "linear-gradient(135deg, rgba(99,102,241,0.15), rgba(99,102,241,0.05))",
                    border: "1px solid rgba(99,102,241,0.15)",
                  }}
                >
                  <Icon size={22} style={{ color: "var(--color-accent-light)" }} />
                </div>

                {/* 数字 */}
                <CountUp value={stat.value} suffix={stat.suffix} />

                {/* 标签 */}
                <p
                  className="text-sm font-medium"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  {stat.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 顶部和底部分隔线 */}
      <div className="absolute top-0 left-0 right-0 gradient-divider" />
      <div className="absolute bottom-0 left-0 right-0 gradient-divider" />
    </section>
  );
}
