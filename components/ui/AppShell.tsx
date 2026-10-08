"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";
import type { PageFields } from "@/lib/content/pageFields";
import type { Settings, Contact, StatItem, IndustrySolution, CaseItem } from "@/lib/data";
import SiteAnalyticsTracker from "@/components/analytics/SiteAnalyticsTracker";

export default function AppShell({
  children,
  navItems,
  company,
  contacts,
  stats,
  industries,
  cases,
  chrome,
}: {
  children: React.ReactNode;
  navItems: Settings["navItems"];
  company: Record<string, string>;
  contacts: Contact[];
  stats: StatItem[];
  industries: IndustrySolution[];
  cases: CaseItem[];
  chrome: { navbar: PageFields<"site-navbar">; footer: PageFields<"site-footer">; navbarEnabled: boolean; footerEnabled: boolean };
}) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <SiteAnalyticsTracker />
      <Navbar navItems={navItems} copy={chrome.navbar} enabled={chrome.navbarEnabled} />
      <main className="min-h-screen">{children}</main>
      <Footer copy={chrome.footer} enabled={chrome.footerEnabled} company={company} contacts={contacts} stats={stats} industries={industries} cases={cases} />
    </>
  );
}
