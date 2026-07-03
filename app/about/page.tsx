import Link from "next/link";
import { ArrowRight, Building2, Award, Users, Briefcase } from "lucide-react";
import type { Metadata } from "next";
import { createMetadata } from "@/lib/seo";
import { company, stats, customers, industries } from "@/lib/data";

export const metadata: Metadata = createMetadata({
  title: "关于我们",
  description: `${company.fullName}，面向企业的 AI 转型落地服务商。已服务 ${stats[0].value}+ 企业客户，交付 ${stats[1].value}+ 智能化系统，覆盖 ${stats[2].value} 大行业解决方案。`,
  path: "/about",
});

export default function AboutPage() {
  return (
    <div className="pt-24">
      {/* Hero */}
      <section className="py-20" style={{ backgroundColor: "var(--color-bg-base)" }}>
        <div className="container-max">
          <span className="pill-tag mb-4">关于寰引智能</span>
          <h1
            className="font-bold mb-6 max-w-4xl"
            style={{
              color: "var(--color-text-primary)",
              fontSize: "clamp(2rem, 4vw, 3rem)",
            }}
          >
            不是喊 AI 口号，是真正交付过
          </h1>
          <p
            className="text-xl max-w-3xl leading-relaxed"
            style={{ color: "var(--color-text-body)" }}
          >
            {company.fullName}，定位为面向企业的 AI 转型落地服务商。
            我们拥有 {stats[0].value} 家真实企业客户、{stats[1].value} 个落地案例、{stats[2].value} 大行业解决方案，
            核心竞争优势是有实际交付能力。
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16" style={{ backgroundColor: "var(--color-bg-elevated)" }}>
        <div className="container-max">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <span
                  className="font-[family-name:var(--font-heading)] font-bold text-[clamp(2.5rem,5vw,3.5rem)]"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  {stat.value}{stat.suffix}
                </span>
                <p className="mt-2 text-sm" style={{ color: "var(--color-text-muted)" }}>
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core advantages */}
      <section className="py-20" style={{ backgroundColor: "var(--color-bg-base)" }}>
        <div className="container-max">
          <h2
            className="text-3xl font-bold mb-12 text-center"
            style={{ color: "var(--color-text-primary)" }}
          >
            我们的能力边界
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Building2, title: "AI 智能体", desc: "客服智能体、订单智能体、报价智能体、质检智能体" },
              { icon: Award, title: "AI 文档处理", desc: "报关文件 AI、商品 AI 生产、财务凭证生成" },
              { icon: Users, title: "RPA 自动化", desc: "表格录入、模板转换、电子签章、流程衔接" },
              { icon: Briefcase, title: "数据智能", desc: "物流轨迹追踪、商品采集监控、异常预警、经营看板" },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="glass-card rounded-[var(--radius-lg)] p-8">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center mb-6"
                    style={{ backgroundColor: "rgba(99,102,241,0.15)" }}
                  >
                    <Icon size={24} style={{ color: "var(--color-accent-light)" }} />
                  </div>
                  <h3
                    className="text-xl font-bold mb-3"
                    style={{ color: "var(--color-text-primary)" }}
                  >
                    {item.title}
                  </h3>
                  <p className="text-sm" style={{ color: "var(--color-text-body)" }}>
                    {item.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Industry coverage */}
      <section className="py-20" style={{ backgroundColor: "var(--color-bg-elevated)" }}>
        <div className="container-max">
          <h2
            className="text-3xl font-bold mb-8"
            style={{ color: "var(--color-text-primary)" }}
          >
            行业覆盖
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {industries.map((ind) => (
              <Link
                key={ind.slug}
                href={`/solutions/${ind.slug}`}
                className="glass-card rounded-[var(--radius-md)] p-6 group cursor-pointer"
              >
                <h3
                  className="font-bold mb-2"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  {ind.title.replace(/ AI 解决方案.*/, "")}
                </h3>
                <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                  {ind.subtitle}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Trust signals */}
      <section className="py-20" style={{ backgroundColor: "var(--color-bg-base)" }}>
        <div className="container-max">
          <h2
            className="text-3xl font-bold mb-4"
            style={{ color: "var(--color-text-primary)" }}
          >
            客户信任
          </h2>
          <p className="mb-8" style={{ color: "var(--color-text-muted)" }}>
            {customers.length} 家真实企业客户选择寰引智能
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {customers.map((customer) => (
              <div
                key={customer.name}
                className="glass-card rounded-[var(--radius-md)] p-4 text-center"
              >
                <p
                  className="text-sm font-medium"
                  style={{ color: "var(--color-text-body)" }}
                >
                  {customer.name}
                </p>
                <p className="text-xs mt-1" style={{ color: "var(--color-text-logo)" }}>
                  {customer.industry}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 text-center" style={{ backgroundColor: "var(--color-bg-base)" }}>
        <div className="container-max">
          <Link href="/contact" className="cta-primary">
            预约免费咨询
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
}
