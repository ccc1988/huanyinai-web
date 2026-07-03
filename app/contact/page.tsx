import type { Metadata } from "next";
import { Mail, Phone, MessageCircle, MapPin } from "lucide-react";
import { createMetadata } from "@/lib/seo";
import { company } from "@/lib/data";
import ContactForm from "@/components/shared/ContactForm";

export const metadata: Metadata = createMetadata({
  title: "联系我们",
  description: `联系${company.shortName}，预约 AI 解决方案咨询。微信号 ${company.wechat}，邮箱 ${company.email}。`,
  path: "/contact",
});

export default function ContactPage() {
  return (
    <div className="pt-24">
      {/* Hero */}
      <section className="py-20" style={{ backgroundColor: "var(--color-bg-base)" }}>
        <div className="container-max text-center">
          <span className="pill-tag mb-4">联系我们</span>
          <h1
            className="font-bold mb-4"
            style={{
              color: "var(--color-text-primary)",
              fontSize: "clamp(2rem, 4vw, 3rem)",
            }}
          >
            让 AI 为你的企业创造价值
          </h1>
          <p
            className="max-w-2xl mx-auto text-lg"
            style={{ color: "var(--color-text-body)" }}
          >
            告诉我们你的业务场景，我们给出可落地的 AI 方案
          </p>
        </div>
      </section>

      {/* Contact info + form */}
      <section className="py-20" style={{ backgroundColor: "var(--color-bg-elevated)" }}>
        <div className="container-max">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact info */}
            <div>
              <h2
                className="text-2xl font-bold mb-8"
                style={{ color: "var(--color-text-primary)" }}
              >
                联系方式
              </h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                    style={{ backgroundColor: "rgba(99,102,241,0.15)" }}
                  >
                    <MessageCircle size={20} style={{ color: "var(--color-accent-light)" }} />
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1" style={{ color: "var(--color-text-muted)" }}>
                      微信咨询
                    </p>
                    <p className="text-base" style={{ color: "var(--color-text-body)" }}>
                      {company.wechat}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                    style={{ backgroundColor: "rgba(99,102,241,0.15)" }}
                  >
                    <Mail size={20} style={{ color: "var(--color-accent-light)" }} />
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1" style={{ color: "var(--color-text-muted)" }}>
                      邮箱
                    </p>
                    <p className="text-base" style={{ color: "var(--color-text-body)" }}>
                      {company.email}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                    style={{ backgroundColor: "rgba(99,102,241,0.15)" }}
                  >
                    <Phone size={20} style={{ color: "var(--color-accent-light)" }} />
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1" style={{ color: "var(--color-text-muted)" }}>
                      电话
                    </p>
                    <p className="text-base" style={{ color: "var(--color-text-body)" }}>
                      {company.phone}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                    style={{ backgroundColor: "rgba(99,102,241,0.15)" }}
                  >
                    <MapPin size={20} style={{ color: "var(--color-accent-light)" }} />
                  </div>
                  <div>
                    <p className="text-sm font-medium mb-1" style={{ color: "var(--color-text-muted)" }}>
                      公司地址
                    </p>
                    <p className="text-base" style={{ color: "var(--color-text-body)" }}>
                      {company.location}
                    </p>
                    <p className="text-sm mt-1" style={{ color: "var(--color-text-logo)" }}>
                      {company.fullName}
                    </p>
                  </div>
                </div>
              </div>

              {/* Wechat QR placeholder */}
              <div className="mt-8">
                <div
                  className="w-32 h-32 rounded-[var(--radius-md)] flex items-center justify-center"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.05)",
                    border: "1px solid var(--color-border-default)",
                  }}
                >
                  <span className="text-xs text-center" style={{ color: "var(--color-text-logo)" }}>
                    微信二维码
                    <br />
                    (占位)
                  </span>
                </div>
              </div>
            </div>

            {/* Contact form */}
            <div>
              <h2
                className="text-2xl font-bold mb-8"
                style={{ color: "var(--color-text-primary)" }}
              >
                预约咨询
              </h2>
              <ContactForm />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
