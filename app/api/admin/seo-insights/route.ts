import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { readData } from "@/lib/dataStore";
import type { CaseItem, IndustrySolution, BlogPost } from "@/lib/data";
import {
  getDirectionStatus,
  normalizeLandingPath,
  readAnalyticsData,
  saveContentAction,
  summarizePageMetrics,
  type ContentAction,
  type PageMetricSummary,
} from "@/lib/siteAnalytics";

const PERIODS = new Set([7, 30, 90]);

function periodDays(request: NextRequest): number {
  const value = Number(new URL(request.url).searchParams.get("days") || 30);
  return PERIODS.has(value) ? value : 30;
}

function contentCatalog() {
  const cases = readData.cases() as CaseItem[];
  const industries = readData.industries() as IndustrySolution[];
  const posts = readData.blogPosts() as BlogPost[];
  return [
    ...cases.filter((item) => item.hasDetailPage).map((item) => ({ path: `/cases/${item.slug}`, title: item.title, contentType: "case" as const, industry: item.industry })),
    ...industries.map((item) => ({ path: `/solutions/${item.slug}`, title: item.title, contentType: "solution" as const, industry: item.title })),
    ...posts.map((item) => ({ path: `/blog/${item.slug}`, title: item.title, contentType: "blog" as const, industry: item.category })),
  ];
}

function dateStart(days: number): number {
  return Date.now() - days * 24 * 60 * 60 * 1000;
}

export async function GET(request: NextRequest) {
  const authError = requireAuth(request);
  if (authError) return authError;
  const days = periodDays(request);
  const analytics = readAnalyticsData();
  const cutoff = dateStart(days);
  const daily = analytics.daily.filter((item) => Date.parse(`${item.date}T00:00:00.000Z`) >= cutoff);
  const observed = summarizePageMetrics(daily);
  const observedByPath = new Map(observed.map((item) => [item.path, item]));
  const catalog = contentCatalog();
  const content = catalog.map((item) => {
    const summary: PageMetricSummary = observedByPath.get(item.path) || {
      path: item.path, contentType: item.contentType, visits: 0, engagedViews: 0, ctaClicks: 0, inquiries: 0, source: "direct",
    };
    const sameType = observed.filter((candidate) => candidate.contentType === item.contentType);
    return { ...item, ...summary, status: getDirectionStatus(summary, sameType) };
  }).sort((a, b) => b.inquiries - a.inquiries || b.engagedViews - a.engagedViews || b.visits - a.visits || b.ctaClicks - a.ctaClicks);

  const sourceMap = new Map<string, { source: string; visits: number; pages: Set<string>; engagedViews: number; ctaClicks: number; inquiries: number; lastVisit: string }>();
  for (const item of daily) {
    const current = sourceMap.get(item.source) || { source: item.source, visits: 0, pages: new Set<string>(), engagedViews: 0, ctaClicks: 0, inquiries: 0, lastVisit: item.date };
    current.visits += item.visits;
    current.pages.add(item.path);
    current.engagedViews += item.engagedViews;
    current.ctaClicks += item.ctaClicks;
    current.inquiries += item.inquiries;
    if (item.date > current.lastVisit) current.lastVisit = item.date;
    sourceMap.set(item.source, current);
  }
  const sources = [...sourceMap.values()].map(({ pages, ...item }) => ({ ...item, pages: pages.size })).sort((a, b) => b.visits - a.visits);
  const totals = daily.reduce((result, item) => ({
    visits: result.visits + item.visits,
    engagedViews: result.engagedViews + item.engagedViews,
    ctaClicks: result.ctaClicks + item.ctaClicks,
    inquiries: result.inquiries + item.inquiries,
  }), { visits: 0, engagedViews: 0, ctaClicks: 0, inquiries: 0 });
  return NextResponse.json({ days, totals, content, sources, actions: analytics.actions, health: analytics.health, updatedAt: analytics.updatedAt });
}

export async function PUT(request: NextRequest) {
  const authError = requireAuth(request);
  if (authError) return authError;
  try {
    const input = await request.json() as Partial<ContentAction>;
    const path = normalizeLandingPath(input.path);
    if (!path || typeof input.id !== "string" || !input.id || typeof input.owner !== "string" || !input.owner.trim() || typeof input.period !== "string" || !input.period.trim()) {
      return NextResponse.json({ error: "请填写有效的内容动作" }, { status: 400 });
    }
    const action: ContentAction = {
      id: input.id.slice(0, 100),
      path,
      action: input.action && ["expand-case", "add-faq-links", "optimize-cta", "optimize-intro", "observe"].includes(input.action) ? input.action : "observe",
      owner: input.owner.trim().slice(0, 80),
      period: input.period.trim().slice(0, 40),
      status: input.status && ["planned", "done", "skipped"].includes(input.status) ? input.status : "planned",
      note: typeof input.note === "string" ? input.note.slice(0, 500) : "",
    };
    if (!saveContentAction(action)) return NextResponse.json({ error: "保存失败" }, { status: 503 });
    return NextResponse.json({ success: true, data: action });
  } catch {
    return NextResponse.json({ error: "保存失败" }, { status: 400 });
  }
}
