"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  FileText,
  Briefcase,
  Building2,
  Globe,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  X,
  Inbox,
  Bell,
} from "lucide-react";

const menuItems = [
  { label: "仪表盘", href: "/admin", icon: LayoutDashboard },
  { label: "预约咨询", href: "/admin/submissions", icon: Inbox },
  { label: "案例管理", href: "/admin/cases", icon: Briefcase },
  { label: "博客管理", href: "/admin/blog", icon: FileText },
  { label: "行业方案", href: "/admin/industries", icon: Globe },
  { label: "公司信息", href: "/admin/company", icon: Building2 },
  { label: "邮件通知", href: "/admin/notifications", icon: Bell },
  { label: "站点设置", href: "/admin/settings", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // 登录页不使用管理布局
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
  };

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "var(--color-bg-base)" }}>
      {/* Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-64 z-50 transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
        style={{
          backgroundColor: "var(--color-bg-elevated)",
          borderRight: "1px solid var(--color-border-default)",
        }}
      >
        <div className="p-6">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-8">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: "rgba(99,102,241,0.15)" }}
            >
              <span className="text-sm font-bold" style={{ color: "var(--color-accent-light)" }}>寰</span>
            </div>
            <span className="font-bold" style={{ color: "var(--color-text-primary)" }}>管理后台</span>
          </div>

          {/* Nav */}
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-[var(--radius-sm)] text-sm transition-colors cursor-pointer"
                  style={{
                    backgroundColor: isActive ? "rgba(99,102,241,0.15)" : "transparent",
                    color: isActive ? "var(--color-accent-light)" : "var(--color-text-body)",
                    fontWeight: isActive ? 600 : 400,
                  }}
                >
                  <Icon size={18} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Bottom links */}
          <div className="mt-8 pt-8 border-t" style={{ borderColor: "var(--color-border-default)" }}>
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-3 px-4 py-2.5 rounded-[var(--radius-sm)] text-sm transition-colors"
              style={{ color: "var(--color-text-muted)" }}
            >
              <ExternalLink size={18} />
              查看官网
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-2.5 rounded-[var(--radius-sm)] text-sm transition-colors w-full cursor-pointer"
              style={{ color: "var(--color-text-muted)" }}
            >
              <LogOut size={18} />
              退出登录
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 min-w-0">
        {/* Mobile header */}
        <header
          className="lg:hidden flex items-center justify-between p-4 sticky top-0 z-30"
          style={{
            backgroundColor: "var(--color-bg-elevated)",
            borderBottom: "1px solid var(--color-border-default)",
          }}
        >
          <button onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X size={24} style={{ color: "var(--color-text-primary)" }} /> : <Menu size={24} style={{ color: "var(--color-text-primary)" }} />}
          </button>
          <span className="text-sm font-medium" style={{ color: "var(--color-text-primary)" }}>
            管理后台
          </span>
        </header>

        {/* Content */}
        <main className="p-6 lg:p-8 max-w-6xl">
          {children}
        </main>
      </div>
    </div>
  );
}
