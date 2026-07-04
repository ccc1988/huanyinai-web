"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";
import Footer from "./Footer";
import type { Settings, Contact } from "@/lib/data";

export default function AppShell({
  children,
  navItems,
  company,
  contacts,
}: {
  children: React.ReactNode;
  navItems: Settings["navItems"];
  company: Record<string, string>;
  contacts: Contact[];
}) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar navItems={navItems} />
      <main className="min-h-screen">{children}</main>
      <Footer company={company} contacts={contacts} />
    </>
  );
}
