import Link from "next/link";
import { ArrowRight, Mail, MessageCircle, Phone } from "lucide-react";
import { getCompany } from "@/lib/data";

export default function FinalCTA() {
  const company = getCompany();
  return (
    <section className="py-28 relative overflow-hidden" style={{ backgroundColor: "var(--color-bg-base)" }}>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 70% 50% at 50% 50%, rgba(99,102,241,0.1) 0%, transparent 60%),
            radial-gradient(ellipse 40% 30% at 30% 60%, rgba(139,92,246,0.06) 0%, transparent 50%)
          `,
        }}
      />
      <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />
      <div className="absolute inset-0 starfield pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 gradient-divider" />

      <div className="container-max text-center relative">
        <h2
          className="font-bold mb-4"
          style={{ color: "var(--color-text-primary)", fontSize: "clamp(2rem, 5vw, 3.5rem)" }}
        >
          <span
            className="bg-clip-text text-transparent"
            style={{
              backgroundImage: "linear-gradient(135deg, #F8FAFC 0%, #C7D2FE 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            人负责目标、边界和最终判断
          </span>
        </h2>

        <p className="max-w-2xl mx-auto mb-10 text-lg" style={{ color: "var(--color-text-body)" }}>
          不接无边界定制。不宣称已经是 AI Native 公司。
        </p>

        <Link href="/contact" className="cta-primary">
          谈可验收的业务闭环
          <ArrowRight size={18} />
        </Link>

        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6">
          <div className="glass-card hud-corners rounded-[var(--radius-md)] px-6 py-4 flex items-center gap-3">
            <MessageCircle size={18} style={{ color: "var(--color-accent-light)" }} />
            <div className="text-left">
              <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>微信咨询</p>
              <p className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>{company.wechat}</p>
            </div>
          </div>
          <div className="glass-card hud-corners rounded-[var(--radius-md)] px-6 py-4 flex items-center gap-3">
            <Mail size={18} style={{ color: "var(--color-accent-light)" }} />
            <div className="text-left">
              <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>邮件咨询</p>
              <p className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>{company.email}</p>
            </div>
          </div>
          {company.phone && company.phone !== "待填写" && (
            <div className="glass-card hud-corners rounded-[var(--radius-md)] px-6 py-4 flex items-center gap-3">
              <Phone size={18} style={{ color: "var(--color-accent-light)" }} />
              <div className="text-left">
                <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>电话咨询</p>
                <p className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>{company.phone}</p>
              </div>
            </div>
          )}
        </div>

        <p className="mt-14 text-sm" style={{ color: "var(--color-text-logo)" }}>{company.fullName}</p>
      </div>
    </section>
  );
}
