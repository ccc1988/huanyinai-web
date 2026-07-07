import type { MetadataRoute } from "next";
import { getCompany } from "@/lib/data";

export default function robots(): MetadataRoute.Robots {
  const company = getCompany();
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
      },
      {
        userAgent: "GPTBot",
        allow: "/",
      },
      {
        userAgent: "OAI-SearchBot",
        allow: "/",
      },
      {
        userAgent: "ChatGPT-User",
        allow: "/",
      },
    ],
    sitemap: `${company.website}/sitemap.xml`,
  };
}
