import type { MetadataRoute } from "next";
import { getCompany, getIndustries, getCases, getBlogPosts } from "@/lib/data";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function getLastModified(updatedAt?: string, fallback?: string): Date | undefined {
  for (const value of [updatedAt, fallback]) {
    if (!value) continue;
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) return date;
  }
  return undefined;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const company = getCompany();
  const industries = getIndustries();
  const cases = getCases();
  const blogPosts = getBlogPosts();
  const baseUrl = company.website;
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, changeFrequency: "weekly", priority: 1.0 },
    { url: `${baseUrl}/about`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/contact`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/blog`, changeFrequency: "weekly", priority: 0.8 },
  ];

  const solutionPages: MetadataRoute.Sitemap = industries.map((ind) => ({
    url: `${baseUrl}/solutions/${ind.slug}`,
    lastModified: getLastModified(ind.updatedAt),
    changeFrequency: "monthly" as const,
    priority: 0.9,
  }));

  const casePages: MetadataRoute.Sitemap = cases
    .filter((c) => c.hasDetailPage)
    .map((c) => ({
      url: `${baseUrl}/cases/${c.slug}`,
      lastModified: getLastModified(c.updatedAt),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    }));

  const blogDetailPages: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: getLastModified(post.updatedAt, post.date),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...solutionPages, ...casePages, ...blogDetailPages];
}
