import Link from "next/link";
import { Briefcase, FileText, Globe, Building2, Settings, ArrowRight } from "lucide-react";
import { cases, blogPosts, industries, customers } from "@/lib/data";

export default function AdminDashboard() {
  const cards = [
    { label: "案例", count: cases.length, href: "/admin/cases", icon: Briefcase, desc: "管理所有案例" },
    { label: "博客", count: blogPosts.length, href: "/admin/blog", icon: FileText, desc: "管理博客文章" },
    { label: "行业方案", count: industries.length, href: "/admin/industries", icon: Globe, desc: "管理行业方案" },
    { label: "客户", count: customers.length, href: "/admin/company", icon: Building2, desc: "管理公司信息" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2" style={{ color: "var(--color-text-primary)" }}>
        仪表盘
      </h1>
      <p className="text-sm mb-8" style={{ color: "var(--color-text-muted)" }}>
        管理网站内容、SEO 和 GEO 配置
      </p>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.label}
              href={card.href}
              className="glass-card rounded-[var(--radius-lg)] p-6 cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: "rgba(99,102,241,0.15)" }}
                >
                  <Icon size={20} style={{ color: "var(--color-accent-light)" }} />
                </div>
                <ArrowRight
                  size={16}
                  className="transition-transform group-hover:translate-x-1"
                  style={{ color: "var(--color-text-muted)" }}
                />
              </div>
              <span
                className="block text-3xl font-bold mb-1"
                style={{ color: "var(--color-text-primary)" }}
              >
                {card.count}
              </span>
              <span className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                {card.label}
              </span>
            </Link>
          );
        })}
      </div>

      {/* Quick actions */}
      <h2 className="text-lg font-bold mb-4" style={{ color: "var(--color-text-primary)" }}>
        快捷入口
      </h2>
      <div className="space-y-2">
        {[
          { href: "/admin/cases", label: "编辑案例内容（痛点、方案、指标）" },
          { href: "/admin/blog", label: "发布或修改博客文章" },
          { href: "/admin/industries", label: "编辑行业方案和 FAQ" },
          { href: "/admin/company", label: "修改公司名称、联系方式" },
          { href: "/admin/settings", label: "配置 SEO 关键词和 GEO 描述" },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="glass-card rounded-[var(--radius-md)] p-4 flex items-center justify-between cursor-pointer group"
          >
            <span className="text-sm" style={{ color: "var(--color-text-body)" }}>
              {item.label}
            </span>
            <ArrowRight
              size={16}
              className="transition-transform group-hover:translate-x-1"
              style={{ color: "var(--color-text-muted)" }}
            />
          </Link>
        ))}
      </div>
    </div>
  );
}
