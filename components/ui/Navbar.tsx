"use client";

import { PAGE_FIELDS, type PageFields } from "@/lib/content/pageFields";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import Logo from "./Logo";
import type { Settings } from "@/lib/data";

export default function Navbar({ navItems, enabled = true, copy = PAGE_FIELDS["site-navbar"].props }: { navItems: Settings["navItems"] ; enabled?: boolean; copy?: PageFields<"site-navbar"> }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  if (!enabled) return null;

  return (
    <nav
      className="fixed top-4 left-4 right-4 z-50 transition-all duration-300"
      style={{
        borderRadius: "var(--radius-md)",
      }}
    >
      <div
        className="flex items-center justify-between px-6 py-3 transition-all duration-300"
        style={{
          backgroundColor: scrolled
            ? "rgba(15,17,23,0.95)"
            : "rgba(15,17,23,0.8)",
          backdropFilter: scrolled ? "blur(20px)" : "blur(12px)",
          WebkitBackdropFilter: scrolled ? "blur(20px)" : "blur(12px)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "var(--radius-md)",
        }}
      >
        {/* Logo */}
        <Link href={copy.homeHref} className="flex items-center shrink-0">
          <Logo />
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium transition-colors hover:text-[var(--color-text-primary)]"
                style={{
                  color: isActive ? "var(--color-text-primary)" : "var(--color-text-muted)",
                  borderBottom: isActive ? "2px solid var(--color-accent)" : "2px solid transparent",
                  paddingBottom: "2px",
                }}
              >
                {item.label}
              </Link>
            );
          })}
          <Link href={copy.desktopCtaHref} className="cta-primary text-sm">{copy.desktopCtaLabel}</Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden cursor-pointer p-2"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={copy.menuAriaLabel}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? (
            <X size={24} style={{ color: "var(--color-text-primary)" }} />
          ) : (
            <Menu size={24} style={{ color: "var(--color-text-primary)" }} />
          )}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div
          className="md:hidden mt-2 p-6 rounded-[var(--radius-md)] flex flex-col gap-4"
          style={{
            backgroundColor: "rgba(15,17,23,0.98)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-base font-medium transition-colors hover:text-[var(--color-text-primary)]"
              style={{ color: "var(--color-text-body)" }}
            >
              {item.label}
            </Link>
          ))}
          <Link
            href={copy.mobileCtaHref}
            className="cta-primary text-sm justify-center"
          >{copy.mobileCtaLabel}</Link>
        </div>
      )}
    </nav>
  );
}
