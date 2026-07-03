import type { Metadata } from "next";
import { company } from "./data";

const SITE_URL = company.website;

/** 生成基础 metadata */
export function createMetadata({
  title,
  description,
  path = "",
  keywords = [],
}: {
  title: string;
  description: string;
  path?: string;
  keywords?: string[];
}): Metadata {
  const url = `${SITE_URL}${path}`;
  return {
    title,
    description,
    keywords: keywords.length > 0 ? keywords : undefined,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: company.shortName,
      locale: "zh_CN",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

/** 首页 metadata */
export const homeMetadata: Metadata = createMetadata({
  title: "寰引智能 — AI 驱动的企业数字化转型落地服务商",
  description:
    "寰引智能科技为物流、跨境、制造、制药等行业提供 AI 智能体、AI 文档处理、RPA 自动化和数据智能解决方案。已服务 10+ 企业客户，交付 11+ 智能化系统。",
  path: "/",
  keywords: ["AI企业服务", "AI智能体", "RPA自动化", "AI数字化转型", "企业AI转型方案", "AI定制开发"],
});
