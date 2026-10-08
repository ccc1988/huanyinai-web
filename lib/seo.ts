import type { Metadata } from "next";
import { getCompany, getSettings } from "./data";

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
  const company = getCompany();
  const settings=getSettings();
  const url = `${settings.canonicalBase || company.website}${path}`;
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
