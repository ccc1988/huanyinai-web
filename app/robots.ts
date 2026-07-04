import type { MetadataRoute } from "next";
import { getCompany } from "@/lib/data";

export default function robots(): MetadataRoute.Robots {
  const company = getCompany();
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${company.website}/sitemap.xml`,
  };
}
