export const dynamic="force-dynamic";
import type { MetadataRoute } from "next";
import { getCompany, getSettings } from "@/lib/data";

export default function robots(): MetadataRoute.Robots {
  const company = getCompany();
  const settings=getSettings();
  if(settings.robotsIndex===false)return {rules:[{userAgent:"*",disallow:"/"}],sitemap:`${settings.canonicalBase||company.website}/sitemap.xml`};
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
    sitemap: `${settings.canonicalBase||company.website}/sitemap.xml`,
  };
}
