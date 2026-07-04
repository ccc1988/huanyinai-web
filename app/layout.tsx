import type { Metadata } from "next";
import { Space_Grotesk, DM_Sans } from "next/font/google";
import "./globals.css";
import AppShell from "@/components/ui/AppShell";
import { getOrganizationJsonLd } from "@/lib/geo";
import { getCompany, getNavItems, getSettings, getContacts, getStats, getIndustries, getCases } from "@/lib/data";

// 强制动态渲染，确保后台修改即时生效
export const dynamic = "force-dynamic";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-heading",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export function generateMetadata(): Metadata {
  const company = getCompany();
  const settings = getSettings();
  return {
    title: {
      default: settings.seoTitle,
      template: `%s | ${company.shortName}`,
    },
    description: settings.seoDescription,
    keywords: settings.seoKeywords,
    metadataBase: new URL(company.website),
    alternates: {
      canonical: "/",
    },
    openGraph: {
      title: settings.ogTitle,
      description: settings.ogDescription,
      siteName: company.shortName,
      locale: "zh_CN",
      type: "website",
      images: [{ url: "/og/default.svg", width: 1200, height: 630, alt: company.shortName }],
    },
    icons: {
      icon: "/favicon.svg",
      shortcut: "/favicon.svg",
      apple: "/favicon.svg",
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const company = getCompany();
  const navItems = getNavItems();
  const contacts = getContacts();
  const stats = getStats();
  const industries = getIndustries();
  const cases = getCases();
  return (
    <html lang="zh-CN" data-scroll-behavior="smooth" className={`${spaceGrotesk.variable} ${dmSans.variable}`}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(getOrganizationJsonLd()),
          }}
        />
        <AppShell navItems={navItems} company={company} contacts={contacts} stats={stats} industries={industries} cases={cases}>{children}</AppShell>
      </body>
    </html>
  );
}
