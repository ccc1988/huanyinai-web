import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { company } from "@/lib/data";

export default function FinalCTA() {
  return (
    <section
      className="py-24 relative"
      style={{ backgroundColor: "var(--color-bg-base)" }}
    >
      {/* Top divider */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{ background: "rgba(99,102,241,0.2)" }}
      />

      <div className="container-max text-center">
        <h2
          className="font-bold mb-4"
          style={{
            color: "var(--color-text-primary)",
            fontSize: "clamp(2rem, 4vw, 3rem)",
          }}
        >
          让 AI 为你的企业创造价值
        </h2>

        <p
          className="max-w-2xl mx-auto mb-8 text-lg"
          style={{ color: "var(--color-text-body)" }}
        >
          告诉我们你的业务场景，我们给出可落地的 AI 方案
        </p>

        <Link href="/contact" className="cta-primary">
          预约免费咨询
          <ArrowRight size={18} />
        </Link>

        <p className="mt-6 text-sm" style={{ color: "var(--color-text-muted)" }}>
          微信咨询：{company.wechat}
        </p>

        <p className="mt-12 text-sm" style={{ color: "var(--color-text-logo)" }}>
          {company.fullName}
        </p>
      </div>
    </section>
  );
}
