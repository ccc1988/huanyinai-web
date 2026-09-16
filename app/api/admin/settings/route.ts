import { NextRequest, NextResponse } from "next/server";
import { readData, writeData } from "@/lib/dataStore";
import { requireAuth } from "@/lib/auth";
import { normalizeSettings, type Settings } from "@/lib/data";

export async function GET(request: NextRequest) {
  const authError = requireAuth(request);
  if (authError) return authError;
  const settings = readData.settings();
  return NextResponse.json(settings);
}

export async function PUT(request: NextRequest) {
  const authError = requireAuth(request);
  if (authError) return authError;
  try {
    const data: unknown = await request.json();
    const error = validateSettings(data);
    if (error) return NextResponse.json({ error }, { status: 400 });
    writeData.settings(normalizeSettings(data as Partial<Settings>));
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "保存失败，设置未修改" }, { status: 500 });
  }
}

function validateSettings(value: unknown): string | null {
  if (!isRecord(value)) return "设置数据必须是对象";
  for (const field of ["seoTitle", "seoDescription", "ogTitle", "ogDescription", "llmsTxtDescription"]) {
    if (!isNonEmptyString(value[field])) return `${field} 不能为空`;
  }
  if (!Array.isArray(value.seoKeywords) || !value.seoKeywords.every((item) => typeof item === "string")) {
    return "seoKeywords 必须是字符串数组";
  }
  if (!Array.isArray(value.navItems)) return "navItems 必须是数组";
  const hrefs = new Set<string>();
  for (const item of value.navItems) {
    if (!isRecord(item) || !isNonEmptyString(item.label) || !isNonEmptyString(item.href)) return "导航项必须包含名称和链接";
    if (!isInternalPath(item.href)) return "导航链接只能使用站内路径";
    if (hrefs.has(item.href)) return "导航链接不能重复";
    hrefs.add(item.href);
  }
  const growth = value.aiSearchGrowth;
  if (growth === undefined) return null;
  if (!isRecord(growth)) return "AI 搜索增长模块必须是对象";
  const textLimits: Record<string, number> = { eyebrow: 60, title: 80, description: 400, primaryCtaLabel: 40, secondaryCtaLabel: 40 };
  for (const [field, limit] of Object.entries(textLimits)) {
    if (!isNonEmptyString(growth[field])) return `${field} 不能为空`;
    if (growth[field].length > limit) return `${field} 超出长度限制`;
  }
  if (!Array.isArray(growth.flow) || growth.flow.length === 0 || !growth.flow.every((item) => typeof item === "string" && item.trim().length > 0 && item.length <= 30)) {
    return "flow 必须是 1-5 个不超过 30 字的非空标签";
  }
  if (growth.flow.length > 5) return "flow 最多 5 个标签";
  if (!isNonEmptyString(growth.primaryCtaHref) || !isInternalPath(growth.primaryCtaHref)) return "主按钮链接只能使用站内路径";
  if (!isNonEmptyString(growth.secondaryCtaHref) || !isInternalPath(growth.secondaryCtaHref)) return "次按钮链接只能使用站内路径";
  if (growth.secondaryCtaHref !== "/contact?service=ai-geo-aeo") return "次按钮必须指向 AI 搜索增长咨询入口";
  return null;
}

function isRecord(value: unknown): value is Record<string, any> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isInternalPath(value: string): boolean {
  return value.startsWith("/") && !value.startsWith("//") && !value.includes("://");
}
