// ============================================================
// 寰引智能官网 — 集中数据管理
// 数据源：/data/*.json（可通过管理后台在线编辑）
// ============================================================

import companyData from "../data/company.json";
import customersData from "../data/customers.json";
import capabilitiesData from "../data/capabilities.json";
import statsData from "../data/stats.json";
import casesData from "../data/cases.json";
import industriesData from "../data/industries.json";
import blogPostsData from "../data/blog-posts.json";
import settingsData from "../data/settings.json";

// ===== 核心类型定义 =====

export interface CaseItem {
  slug: string;
  title: string;
  industry: string;
  relatedCustomers: string[];
  oneLiner: string;
  painPoints: string[];
  solution: string;
  customerValue: string[];
  metrics?: string[];
  scenarios: string[];
  tags: string[];
  hasDetailPage: boolean;
}

export interface IndustrySolution {
  slug: string;
  title: string;
  subtitle: string;
  painPoints: string[];
  solutionSummary: string;
  relatedCases: string[];
  faq: { q: string; a: string }[];
}

export interface Customer {
  name: string;
  industry: string;
  solutions: string[];
}

export interface CapabilityItem {
  module: string;
  products: string[];
  scenarios: string;
  icon: string;
}

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  tags: string[];
  date: string;
  author: string;
  sections: { heading: string; body: string }[];
}

export interface StatItem {
  value: number;
  suffix?: string;
  label: string;
}

// ===== 导出数据 =====

export const company = companyData as Record<string, string>;

export const customers = customersData as Customer[];

export const capabilities = capabilitiesData as CapabilityItem[];

export const stats = statsData as StatItem[];

export const cases = casesData as CaseItem[];

export const industries = industriesData as IndustrySolution[];

export const blogPosts = blogPostsData as BlogPost[];

export const settings = settingsData as {
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string[];
  ogTitle: string;
  ogDescription: string;
  llmsTxtDescription: string;
  navItems: { label: string; href: string }[];
};

export const navItems = settings.navItems;

// ===== 辅助函数 =====

export function getCaseBySlug(slug: string): CaseItem | undefined {
  return cases.find((c) => c.slug === slug);
}

export function getCasesByIndustry(industrySlug: string): CaseItem[] {
  const industry = industries.find((i) => i.slug === industrySlug);
  if (!industry) return [];
  return industry.relatedCases
    .map((slug) => cases.find((c) => c.slug === slug))
    .filter(Boolean) as CaseItem[];
}

export function getIndustryBySlug(slug: string): IndustrySolution | undefined {
  return industries.find((i) => i.slug === slug);
}

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug);
}
