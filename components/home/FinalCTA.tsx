import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function FinalCTA() {
  return (
    <section
      className="py-16 relative overflow-hidden"
      style={{ backgroundColor: "var(--color-bg-base)" }}
    >
      {/* 保留轻量背景层，让咨询收口与 Hero 保持层级差异 */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 70% 55% at 50% 100%, rgba(99,102,241,0.07) 0%, transparent 62%)",
        }}
      />
      <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
      <div className="absolute inset-0 starfield pointer-events-none" />

      {/* Top divider */}
      <div className="absolute top-0 left-0 right-0 gradient-divider" />

      <div className="container-max relative text-center">
        <h2
          className="text-balance font-bold"
          style={{
            color: "var(--color-text-primary)",
            fontSize: "clamp(2rem, 4vw, 3rem)",
          }}
        >
          把 AI 用在关键业务上
        </h2>

        <p
          className="mx-auto mt-4 max-w-xl text-base leading-7"
          style={{ color: "var(--color-text-body)" }}
        >
          从内部提效到 AI 搜索增长，告诉我们你的场景，我们给出可执行的方案。
        </p>

        <Link href="/contact" className="cta-primary mt-8 justify-center">
          预约 AI 方案咨询
          <ArrowRight size={18} />
        </Link>
      </div>
    </section>
  );
}
