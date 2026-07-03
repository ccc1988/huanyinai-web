import type { Metadata } from "next";
import { Space_Grotesk, DM_Sans } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/ui/Footer";
import { getOrganizationJsonLd } from "@/lib/geo";
import { company } from "@/lib/data";

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

export const metadata: Metadata = {
  title: {
    default: "寰引智能 — AI 驱动的企业数字化转型落地服务商",
    template: "%s | 寰引智能",
  },
  description:
    "寰引智能科技为物流、跨境、制造、制药等行业提供 AI 智能体、AI 文档处理、RPA 自动化和数据智能解决方案。已服务 10+ 企业客户，交付 11+ 智能化系统。",
  keywords: ["AI企业服务", "AI智能体", "RPA自动化", "AI数字化转型", "企业AI转型方案"],
  metadataBase: new URL(company.website),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "寰引智能 — AI 驱动的企业数字化转型落地服务商",
    description: "面向企业的 AI 转型落地服务商，提供 AI 智能体、AI 文档处理、RPA 自动化和数据智能解决方案。",
    siteName: "寰引智能",
    locale: "zh_CN",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" data-scroll-behavior="smooth" className={`${spaceGrotesk.variable} ${dmSans.variable}`}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(getOrganizationJsonLd()),
          }}
        />
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
