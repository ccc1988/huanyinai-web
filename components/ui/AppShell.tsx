"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";
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
}: {
  children: React.ReactNode;
  navItems: Settings["navItems"];
  company: Record<string, string>;
  contacts: Contact[];
  stats: StatItem[];
  industries: IndustrySolution[];
  cases: CaseItem[];
}) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <SiteAnalyticsTracker />
      <Navbar navItems={navItems} />
      <main className="min-h-screen">{children}</main>
      <Footer company={company} contacts={contacts} stats={stats} industries={industries} cases={cases} />
    </>
  );
}
