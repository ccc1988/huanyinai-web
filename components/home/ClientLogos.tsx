"use client";

import { useRef, useState, useCallback } from "react";
import type { Customer } from "@/lib/data";
import { getCustomerIcon } from "@/lib/customerIcons";

/* 第二行用逆序排列，增加视觉层次 */
function makeReverse(items: Customer[]) {
  return [...items].reverse();
}

/* 单个 Logo 卡片 */
function LogoCard({ name }: { name: string }) {
  const { icon: Icon, color } = getCustomerIcon(name);
  return (
    <div className="logo-cloud-item group flex items-center gap-2.5 px-4 py-2.5 rounded-xl cursor-pointer shrink-0">
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
        style={{ backgroundColor: `${color}1A`, border: `1px solid ${color}30` }}
      >
        <Icon size={16} style={{ color }} />
      </div>
      <span
        className="logo-cloud-name text-sm font-medium whitespace-nowrap transition-colors duration-300"
        style={{ color: "var(--color-text-logo)" }}
      >
        {name}
      </span>
    </div>
  );
}

export default function ClientLogos({ customers }: { customers: Customer[] }) {
  /* 提取去重后的行业标签 */
  const industryTags = [...new Set(customers.map((c) => c.industry))];
  const rowReverse = makeReverse(customers);

  const sectionRef = useRef<HTMLElement>(null);
  const [spotlight, setSpotlight] = useState({ x: -500, y: -500, active: false });
  const [paused, setPaused] = useState(false);

  /* 鼠标移动 — 更新光斑位置 */
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = sectionRef.current?.getBoundingClientRect();
    if (!rect) return;
    setSpotlight({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      active: true,
    });
  }, []);

  return (
    <section
      ref={sectionRef}
      className="section-decor py-16 overflow-hidden"
      style={{ backgroundColor: "var(--color-bg-elevated)" }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => {
        setSpotlight((s) => ({ ...s, active: false }));
        setPaused(false);
      }}
    >
      {/* 鼠标跟随光斑 */}
      <div
        className="pointer-events-none absolute inset-0 z-10 transition-opacity duration-500"
        style={{
          opacity: spotlight.active ? 1 : 0,
          background: `radial-gradient(circle 320px at ${spotlight.x}px ${spotlight.y}px, rgba(99,102,241,0.12) 0%, rgba(139,92,246,0.05) 35%, transparent 70%)`,
        }}
      />

      {/* 标题区 */}
      <div className="container-max relative z-20">
        <div className="text-center mb-10">
          <p className="text-sm font-medium" style={{ color: "var(--color-text-muted)" }}>
            跨行业信赖 — 已为 {customers.length} 家企业提供 AI 转型服务
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
            {industryTags.map((tag) => (
              <span
                key={tag}
                className="text-xs px-3 py-1 rounded-full"
                style={{
                  backgroundColor: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  color: "var(--color-text-muted)",
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 动态滚动 Logo 云 */}
      <div className="relative z-20 space-y-4">
        {/* 第一行 — 向左滚动 */}
        <div className="marquee-mask overflow-hidden">
          <div className={`flex gap-4 marquee-track-left ${paused ? "marquee-paused" : ""}`}>
            {[...customers, ...customers].map((c, i) => (
              <LogoCard key={`row1-${i}`} name={c.name} />
            ))}
          </div>
        </div>

        {/* 第二行 — 向右滚动（逆序） */}
        <div className="marquee-mask overflow-hidden">
          <div className={`flex gap-4 marquee-track-right ${paused ? "marquee-paused" : ""}`}>
            {[...rowReverse, ...rowReverse].map((c, i) => (
              <LogoCard key={`row2-${i}`} name={c.name} />
            ))}
          </div>
        </div>
      </div>

      {/* 底部分隔线 */}
      <div className="container-max relative z-20">
        <div className="gradient-divider mt-12" />
      </div>
    </section>
  );
}
