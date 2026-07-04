import Link from "next/link";
import Logo from "./Logo";
import type { Contact, StatItem, IndustrySolution } from "@/lib/data";

export default function Footer({ company, contacts, stats, industries }: { company: Record<string, string>; contacts: Contact[]; stats: StatItem[]; industries: IndustrySolution[] }) {
  return (
    <footer
      className="border-t pt-16 pb-8"
      style={{
        backgroundColor: "var(--color-bg-footer)",
        borderColor: "rgba(255,255,255,0.06)",
      }}
    >
      <div className="container-max">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 lg:gap-10 mb-12">
          {/* 品牌区 */}
          <div>
            <Logo size="footer" />
            <p
              className="mt-4 text-sm leading-relaxed"
              style={{ color: "var(--color-text-logo)" }}
            >
              {company.fullName}
            </p>
            {company.description && (
              <p className="mt-2 text-xs leading-relaxed max-w-xs" style={{ color: "var(--color-text-copyright)" }}>
                {company.description}
              </p>
            )}
            {/* 核心数据 — 信任背书 */}
            {stats.length > 0 && (
              <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2">
                {stats.map((stat, idx) => (
                  <div key={idx} className="flex items-baseline gap-1">
                    <span className="text-sm font-bold" style={{ color: "var(--color-accent-light)" }}>
                      {stat.value}{stat.suffix || ""}
                    </span>
                    <span className="text-xs" style={{ color: "var(--color-text-copyright)" }}>
                      {stat.label}
                    </span>
                    {idx < stats.length - 1 && (
                      <span className="ml-3 text-xs" style={{ color: "rgba(255,255,255,0.1)" }}>|</span>
                    )}
                  </div>
                ))}
              </div>
            )}
            {/* 地理位置 */}
            {company.location && (
              <div className="mt-4 flex items-center gap-1.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--color-text-copyright)" }}>
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <span className="text-xs" style={{ color: "var(--color-text-copyright)" }}>{company.location}</span>
              </div>
            )}
          </div>

          {/* 解决方案 */}
          <div>
            <h3
              className="text-sm font-semibold mb-4"
              style={{ color: "var(--color-text-muted)" }}
            >
              解决方案
            </h3>
            <ul className="space-y-3">
              {industries.filter((ind) => ind.slug !== "ecommerce-service").map((ind) => (
                <li key={ind.slug}>
                  <Link
                    href={`/solutions/${ind.slug}`}
                    className="text-sm cursor-pointer transition-colors hover:text-[var(--color-text-body)]"
                    style={{ color: "var(--color-text-muted)" }}
                  >
                    {ind.title}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/solutions"
                  className="text-sm cursor-pointer font-medium transition-colors inline-flex items-center gap-1"
                  style={{ color: "var(--color-accent-light)" }}
                >
                  查看全部
                  <span aria-hidden="true">→</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* 联系我们 + 二维码并排 */}
          <div>
            <h3
              className="text-sm font-semibold mb-4"
              style={{ color: "var(--color-text-muted)" }}
            >
              联系我们
            </h3>
            <ul className="space-y-3 text-sm" style={{ color: "var(--color-text-muted)" }}>
              <li className="flex flex-col gap-0.5">
                <span className="text-xs" style={{ color: "var(--color-text-copyright)" }}>邮箱</span>
                <a
                  href={`mailto:${company.email}`}
                  className="cursor-pointer transition-colors hover:text-[var(--color-text-primary)]"
                  style={{ color: "var(--color-text-body)" }}
                >
                  {company.email}
                </a>
              </li>
              <li className="flex flex-col gap-0.5">
                <span className="text-xs" style={{ color: "var(--color-text-copyright)" }}>微信</span>
                <span style={{ color: "var(--color-text-body)" }}>{company.wechat}</span>
              </li>
            </ul>
            {/* 联系人二维码 — 并排 */}
            {contacts.length > 0 && (
              <div className="mt-6 flex flex-row gap-4">
                {contacts.map((contact, idx) => (
                  <div key={idx} className="flex flex-col items-center">
                    <div
                      className="w-24 h-24 rounded-[var(--radius-md)] flex items-center justify-center overflow-hidden"
                      style={{ backgroundColor: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
                    >
                      {contact.qrCode ? (
                        <img src={contact.qrCode} alt={`${contact.name || "联系人"}二维码`} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xs text-center leading-relaxed px-1" style={{ color: "var(--color-text-copyright)" }}>
                          {contact.name || "微信"}<br />二维码
                        </span>
                      )}
                    </div>
                    {(contact.name || contact.role) && (
                      <span className="mt-1.5 text-xs text-center" style={{ color: "var(--color-text-copyright)" }}>
                        {contact.name}{contact.name && contact.role && " · "}{contact.role}
                      </span>
                    )}
                    {contact.phone && (
                      <span className="text-xs" style={{ color: "var(--color-text-copyright)" }}>{contact.phone}</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Copyright */}
        <div
          className="pt-6 border-t text-center"
          style={{
            borderColor: "rgba(255,255,255,0.06)",
          }}
        >
          <p className="text-xs" style={{ color: "var(--color-text-copyright)" }}>
            © {new Date().getFullYear()} {company.fullName}
          </p>
        </div>
      </div>
    </footer>
  );
}
