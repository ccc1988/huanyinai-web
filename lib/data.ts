// ============================================================
// 寰引智能官网 — 集中数据管理
// 数据源：/data/*.json（可通过管理后台在线编辑）
// 注意：生产环境使用 fs 运行时读取，确保后台修改即时生效
// ============================================================

import fs from "fs";
import path from "path";

const dataDir = path.join(process.cwd(), "data");

function loadJson<T>(filename: string): T {
  const filePath = path.join(dataDir, filename);
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as T;
}

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

export interface Settings {
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string[];
  ogTitle: string;
  ogDescription: string;
  llmsTxtDescription: string;
  navItems: { label: string; href: string }[];
}

// ===== 运行时读取数据 =====

export const company = loadJson<Record<string, string>>("company.json");

export const customers = loadJson<Customer[]>("customers.json");

export const capabilities = loadJson<CapabilityItem[]>("capabilities.json");

export const stats = loadJson<StatItem[]>("stats.json");

export const cases = loadJson<CaseItem[]>("cases.json");

export const industries = loadJson<IndustrySolution[]>("industries.json");

export const blogPosts = loadJson<BlogPost[]>("blog-posts.json");

export const settings = loadJson<Settings>("settings.json");

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
