// ============================================================
// 寰引智能官网 — 集中数据管理
// 数据源：/data/*.json（可通过管理后台在线编辑）
// 注意：生产环境使用 fs 运行时读取，确保后台修改即时生效
// ============================================================

import fs from "fs";
import path from "path";

const dataDir = process.env.DATA_DIR || path.join(process.cwd(), "data");

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
  updatedAt?: string;
  disclaimer?: string;
}

export interface ServicePackage {
  title: string;
  description: string;
  deliverables: string[];
}

export interface IndustrySolution {
  slug: string;
  title: string;
  shortTitle?: string;
  metaTitle?: string;
  metaDescription?: string;
  subtitle: string;
  painPoints: string[];
  solutionSummary: string;
  relatedCases: string[];
  faq: { q: string; a: string }[];
  updatedAt?: string;
  servicePackages?: ServicePackage[];
  process?: string[];
  deliverables?: string[];
  measurement?: string[];
  boundaries?: string[];
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
  updatedAt?: string;
  sources?: { title: string; url: string; accessedAt: string }[];
  reviewStatus?: "draft" | "reviewed";
  reviewedAt?: string;
  reviewer?: string;
}

export interface StatItem {
  value: number;
  suffix?: string;
  label: string;
}

export interface Contact {
  name: string;
  role: string;
  phone: string;
  wechat: string;
  qrCode: string; // base64 data URL
}

export interface AiSearchGrowthContent {
  eyebrow: string;
  title: string;
  description: string;
  flow: string[];
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
}

export interface Settings {
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string[];
  ogTitle: string;
  ogDescription: string;
  llmsTxtDescription: string;
  navItems: { label: string; href: string }[];
  aiSearchGrowth: AiSearchGrowthContent;
}

export const defaultAiSearchGrowthContent: AiSearchGrowthContent = {
  eyebrow: "新增服务 · AI 搜索增长 · GEO / AEO",
  title: "让 AI 搜索，成为企业新的获客入口",
  description: "当客户向 ChatGPT、豆包、DeepSeek、Gemini 等 AI 询问“哪家公司靠谱、哪个方案适合我”，围绕真实客户问题，优化企业官网、案例、内容和品牌信源，让品牌更容易被发现、被理解、被引用，并进入客户的比较与决策过程。",
  flow: ["AI 曝光", "品牌理解", "内容引用", "推荐候选", "高意向咨询"],
  primaryCtaLabel: "了解 AI 搜索增长方案",
  primaryCtaHref: "/solutions/ai-geo-aeo",
  secondaryCtaLabel: "申请 AI 可见性诊断",
  secondaryCtaHref: "/contact?service=ai-geo-aeo",
};

export function normalizeSettings(settings: Partial<Settings>): Settings {
  const growth = settings.aiSearchGrowth;
  return {
    ...settings,
    seoTitle: settings.seoTitle || "",
    seoDescription: settings.seoDescription || "",
    seoKeywords: settings.seoKeywords || [],
    ogTitle: settings.ogTitle || "",
    ogDescription: settings.ogDescription || "",
    llmsTxtDescription: settings.llmsTxtDescription || "",
    navItems: settings.navItems || [],
    aiSearchGrowth: {
      ...defaultAiSearchGrowthContent,
      ...(growth || {}),
      flow: growth?.flow || [...defaultAiSearchGrowthContent.flow],
    },
  };
}

// ===== 预约咨询相关类型 =====

export interface Submission {
  id: string;
  name: string;
  company: string;
  phone: string;
  email: string;
  message: string;
  ip: string;
  userAgent: string;
  createdAt: string;
  status: "unread" | "read";
  category: string;
  tags: string[];
  notes: string;
  emailSent: boolean;
  emailSentAt: string | null;
  analyticsSessionId?: string;
  landingPath?: string;
  landingReferrer?: string;
  landingUtmSource?: string;
  landingUtmMedium?: string;
  landingUtmCampaign?: string;
}

export interface SmtpConfig {
  enabled: boolean;
  host: string;
  port: number;
  secure: boolean;
  username: string;
  encryptedPassword: string | null;
  fromName: string;
  fromEmail: string;
  recipients: string[];
  subjectTemplate: string;
}

export interface AdminConfig {
  passwordHash: string | null;
  passwordSalt: string | null;
  updatedAt: string | null;
}

// ===== 运行时读取数据（每次调用读磁盘，确保后台修改即时生效） =====

export function getCompany() {
  return loadJson<Record<string, string>>("company.json");
}

export function getCustomers() {
  return loadJson<Customer[]>("customers.json");
}

export function getCapabilities() {
  return loadJson<CapabilityItem[]>("capabilities.json");
}

export function getStats() {
  return loadJson<StatItem[]>("stats.json");
}

export function getContacts() {
  return loadJson<Contact[]>("contacts.json");
}

export function getCases() {
  return loadJson<CaseItem[]>("cases.json");
}

export function getPublicCases() {
  return getCases().filter((item) => item.hasDetailPage);
}

export function getIndustries() {
  return loadJson<IndustrySolution[]>("industries.json");
}

export function getBlogPosts() {
  return loadJson<BlogPost[]>("blog-posts.json");
}

/** Public content excludes explicitly marked drafts while preserving legacy posts. */
export function getPublicBlogPosts() {
  return getBlogPosts().filter((post) => post.reviewStatus !== "draft");
}

export function getSettings() {
  return normalizeSettings(loadJson<Partial<Settings>>("settings.json"));
}

export function getSubmissions() {
  try {
    return loadJson<Submission[]>("submissions.json");
  } catch {
    return [];
  }
}

export function getSmtpConfig() {
  try {
    return loadJson<SmtpConfig>("smtp-config.json");
  } catch {
    return {
      enabled: false,
      host: "",
      port: 465,
      secure: true,
      username: "",
      encryptedPassword: null,
      fromName: "寰引智能官网",
      fromEmail: "",
      recipients: [],
      subjectTemplate: "【新咨询】{company} - {name}",
    } as SmtpConfig;
  }
}

export function getNavItems() {
  return getSettings().navItems;
}

// ===== 辅助函数 =====

export function getCaseBySlug(slug: string): CaseItem | undefined {
  return getCases().find((c) => c.slug === slug);
}

export function getPublicCaseBySlug(slug: string): CaseItem | undefined {
  return getPublicCases().find((c) => c.slug === slug);
}

export function getCasesByIndustry(industrySlug: string): CaseItem[] {
  const industry = getIndustries().find((i) => i.slug === industrySlug);
  if (!industry) return [];
  return industry.relatedCases
    .map((slug) => getPublicCases().find((c) => c.slug === slug))
    .filter(Boolean) as CaseItem[];
}

export function getIndustryBySlug(slug: string): IndustrySolution | undefined {
  return getIndustries().find((i) => i.slug === slug);
}

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return getBlogPosts().find((p) => p.slug === slug);
}

export function getPublicBlogPostBySlug(slug: string): BlogPost | undefined {
  return getPublicBlogPosts().find((p) => p.slug === slug);
}
