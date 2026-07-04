import Link from "next/link";
import Logo from "./Logo";
import type { Contact } from "@/lib/data";

export default function Footer({ company, contacts }: { company: Record<string, string>; contacts: Contact[] }) {
  return (
    <footer
      className="border-t pt-16 pb-8"
      style={{
        backgroundColor: "var(--color-bg-footer)",
        borderColor: "rgba(255,255,255,0.06)",
      }}
    >
      <div className="container-max">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10 mb-12">
          {/* Brand — 占 2 列宽，最左侧 */}
          <div className="col-span-2 lg:col-span-2">
            <Logo size="footer" />
            <p
              className="mt-4 text-sm leading-relaxed"
              style={{ color: "var(--color-text-logo)" }}
            >
              {company.fullName}
            </p>
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
              <li>
                <Link
                  href="/solutions/customs"
                  className="text-sm cursor-pointer transition-colors hover:text-[var(--color-text-body)]"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  报关 AI 解决方案
                </Link>
              </li>
              <li>
                <Link
                  href="/solutions/cross-border-logistics"
                  className="text-sm cursor-pointer transition-colors hover:text-[var(--color-text-body)]"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  跨境物流 AI 解决方案
                </Link>
              </li>
              <li>
                <Link
                  href="/solutions/cross-border-ecommerce"
                  className="text-sm cursor-pointer transition-colors hover:text-[var(--color-text-body)]"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  跨境电商 AI 解决方案
                </Link>
              </li>
              <li>
                <Link
                  href="/solutions/supply-chain"
                  className="text-sm cursor-pointer transition-colors hover:text-[var(--color-text-body)]"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  供应链 AI 解决方案
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

        {/* Copyright + 描述 */}
        <div
          className="pt-6 border-t text-center"
          style={{
            borderColor: "rgba(255,255,255,0.06)",
          }}
        >
          <p className="text-xs" style={{ color: "var(--color-text-copyright)" }}>
            © {new Date().getFullYear()} {company.fullName}
          </p>
          {company.description && (
            <p className="mt-1.5 text-xs" style={{ color: "var(--color-text-copyright)" }}>
              {company.description}
            </p>
          )}
        </div>
      </div>
    </footer>
  );
}
