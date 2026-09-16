import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { readData, writeData } from "@/lib/dataStore";
import type { IndustrySolution } from "@/lib/data";
import { requireAuth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const authError = requireAuth(request);
  if (authError) return authError;
  const industries = readData.industries();
  return NextResponse.json(industries);
}

export async function PUT(request: NextRequest) {
  const authError = requireAuth(request);
  if (authError) return authError;
  try {
    const data: unknown = await request.json();
    const validationError = validateIndustry(data);
    if (validationError) return NextResponse.json({ error: validationError }, { status: 400 });
    const industry = data as IndustrySolution;
    const industries = readData.industries() as IndustrySolution[];
    const now = new Date().toISOString();

    const index = industries.findIndex((i) => i.slug === industry.slug);
    const nextIndustry = { ...industry, updatedAt: now } as IndustrySolution;
    if (index === -1) {
      industries.push(nextIndustry);
    } else {
      industries[index] = { ...industries[index], ...industry, updatedAt: now };
    }

    writeData.industries(industries);
    revalidatePath("/sitemap.xml");
    revalidatePath("/api/llms");
    revalidatePath("/solutions");
    revalidatePath("/solutions/[industry]", "page");
    return NextResponse.json({ success: true, data: industries[index] || nextIndustry });
  } catch {
    return NextResponse.json({ error: "保存失败" }, { status: 500 });
  }
}

function validateIndustry(value: unknown): string | null {
  if (!isRecord(value)) return "方案数据必须是对象";
  if (!isSlug(value.slug)) return "slug 只能使用小写字母、数字和连字符";
  for (const field of ["title", "subtitle", "solutionSummary"]) {
    if (!isNonEmptyString(value[field])) return `${field} 不能为空`;
  }
  if (!isStringArray(value.painPoints) || !isStringArray(value.relatedCases)) return "痛点和关联案例必须是字符串数组";
  if (!Array.isArray(value.faq) || !value.faq.every((item) => isRecord(item) && isNonEmptyString(item.q) && isNonEmptyString(item.a))) return "FAQ 必须包含问题和回答";
  for (const field of ["process", "deliverables", "measurement", "boundaries"]) {
    if (value[field] !== undefined && !isStringArray(value[field])) return `${field} 必须是字符串数组`;
  }
  if (value.servicePackages !== undefined) {
    if (!Array.isArray(value.servicePackages) || !value.servicePackages.every((item) => isRecord(item) && isNonEmptyString(item.title) && isNonEmptyString(item.description) && isStringArray(item.deliverables))) return "服务包必须包含名称、说明和交付物";
  }
  for (const field of ["shortTitle", "metaTitle", "metaDescription"]) {
    if (value[field] !== undefined && typeof value[field] !== "string") return `${field} 必须是字符串`;
  }
  return null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function isSlug(value: unknown): value is string {
  return typeof value === "string" && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
}

export async function DELETE(request: NextRequest) {
  const authError = requireAuth(request);
  if (authError) return authError;
  try {
    const { slug } = await request.json();
    const industries = readData.industries() as IndustrySolution[];
    const filtered = industries.filter((i) => i.slug !== slug);
    writeData.industries(filtered);
    revalidatePath("/sitemap.xml");
    revalidatePath("/solutions");
    revalidatePath("/solutions/[industry]", "page");
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "删除失败" }, { status: 500 });
  }
}
