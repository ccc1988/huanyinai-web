import type { Metadata } from "next";
import { company, settings } from "./data";

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
  title: settings.seoTitle,
  description: settings.seoDescription,
  path: "/",
  keywords: settings.seoKeywords,
});
