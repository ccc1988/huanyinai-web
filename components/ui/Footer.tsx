import Link from "next/link";
import Logo from "./Logo";

export default function Footer({ company }: { company: Record<string, string> }) {
  return (
    <footer
      className="border-t pt-16 pb-8"
      style={{
        backgroundColor: "var(--color-bg-footer)",
        borderColor: "rgba(255,255,255,0.06)",
      }}
    >
      <div className="container-max">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10 mb-12">
          {/* Brand — 占 2 列宽，内容更充实 */}
          <div className="col-span-2 lg:col-span-2">
            <Logo size="footer" />
            <p
              className="mt-4 text-sm leading-relaxed"
              style={{ color: "var(--color-text-logo)" }}
            >
              {company.fullName}
            </p>
            {company.description && (
              <p
                className="mt-2 text-sm leading-relaxed max-w-xs"
                style={{ color: "var(--color-text-copyright)" }}
              >
                {company.description}
              </p>
            )}
          </div>

          {/* 解决方案 — 独立一列 */}
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

          {/* 公司 — 独立一列 */}
          <div>
            <h3
              className="text-sm font-semibold mb-4"
              style={{ color: "var(--color-text-muted)" }}
            >
              公司
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/"
                  className="text-sm cursor-pointer transition-colors hover:text-[var(--color-text-body)]"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  首页
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-sm cursor-pointer transition-colors hover:text-[var(--color-text-body)]"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  关于我们
                </Link>
              </li>
              <li>
                <Link
                  href="/cases/customs-document-ai"
                  className="text-sm cursor-pointer transition-colors hover:text-[var(--color-text-body)]"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  案例
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="text-sm cursor-pointer transition-colors hover:text-[var(--color-text-body)]"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  博客
                </Link>
              </li>
            </ul>
          </div>

          {/* 联系我们 — 独立一列 */}
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
            <div
              className="mt-6 w-24 h-24 rounded-[var(--radius-md)] flex items-center justify-center"
              style={{
                backgroundColor: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <span className="text-xs text-center leading-relaxed" style={{ color: "var(--color-text-copyright)" }}>
                微信
                <br />
                二维码
              </span>
            </div>
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
