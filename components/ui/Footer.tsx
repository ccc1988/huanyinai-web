import Link from "next/link";
import Logo from "./Logo";
import { company } from "@/lib/data";

export default function Footer() {
  return (
    <footer
      className="border-t pt-16 pb-8"
      style={{
        backgroundColor: "var(--color-bg-footer)",
        borderColor: "rgba(255,255,255,0.06)",
      }}
    >
      <div className="container-max">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Brand */}
          <div>
            <Logo size="footer" />
            <p
              className="mt-4 text-sm leading-relaxed"
              style={{ color: "var(--color-text-logo)" }}
            >
              {company.fullName}
            </p>
          </div>

          {/* Links */}
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
                  className="text-sm transition-colors hover:text-[var(--color-text-body)]"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  AI 智能体
                </Link>
              </li>
              <li>
                <Link
                  href="/solutions/cross-border-logistics"
                  className="text-sm transition-colors hover:text-[var(--color-text-body)]"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  AI 文档处理
                </Link>
              </li>
              <li>
                <Link
                  href="/solutions/cross-border-ecommerce"
                  className="text-sm transition-colors hover:text-[var(--color-text-body)]"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  RPA 自动化
                </Link>
              </li>
              <li>
                <Link
                  href="/solutions/supply-chain"
                  className="text-sm transition-colors hover:text-[var(--color-text-body)]"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  数据智能
                </Link>
              </li>
            </ul>

            <h3
              className="text-sm font-semibold mb-4 mt-6"
              style={{ color: "var(--color-text-muted)" }}
            >
              公司
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/about"
                  className="text-sm transition-colors hover:text-[var(--color-text-body)]"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  关于我们
                </Link>
              </li>
              <li>
                <Link
                  href="/cases/customs-document-ai"
                  className="text-sm transition-colors hover:text-[var(--color-text-body)]"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  案例
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="text-sm transition-colors hover:text-[var(--color-text-body)]"
                  style={{ color: "var(--color-text-muted)" }}
                >
                  博客
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3
              className="text-sm font-semibold mb-4"
              style={{ color: "var(--color-text-muted)" }}
            >
              联系我们
            </h3>
            <div
              className="space-y-3 text-sm"
              style={{ color: "var(--color-text-muted)" }}
            >
              <p>
                邮箱：<span style={{ color: "var(--color-text-body)" }}>{company.email}</span>
              </p>
              <p>
                电话：<span style={{ color: "var(--color-text-body)" }}>{company.phone}</span>
              </p>
              <p>
                微信：<span style={{ color: "var(--color-text-body)" }}>{company.wechat}</span>
              </p>
              <div className="flex items-center gap-3 mt-4">
                <div
                  className="w-20 h-20 rounded-[var(--radius-md)] flex items-center justify-center"
                  style={{
                    backgroundColor: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.08)",
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
            © 2025 {company.fullName}
          </p>
        </div>
      </div>
    </footer>
  );
}
