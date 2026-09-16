import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { readData, writeData } from "@/lib/dataStore";
import type { CaseItem } from "@/lib/data";
import { requireAuth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const authError = requireAuth(request);
  if (authError) return authError;
  const cases = readData.cases();
  return NextResponse.json(cases);
}

export async function PUT(request: NextRequest) {
  const authError = requireAuth(request);
  if (authError) return authError;
  try {
    const data: unknown = await request.json();
    const validationError = validateCase(data);
    if (validationError) return NextResponse.json({ error: validationError }, { status: 400 });
    const caseItem = data as CaseItem;
    const cases = readData.cases() as CaseItem[];
    const now = new Date().toISOString();

    // 根据 slug 查找并更新
    const index = cases.findIndex((c) => c.slug === caseItem.slug);
    const nextCase = { ...caseItem, updatedAt: now } as CaseItem;
    if (index === -1) {
      // 新增
      cases.push(nextCase);
    } else {
      // 更新
      cases[index] = { ...cases[index], ...caseItem, updatedAt: now };
    }

    writeData.cases(cases);
    revalidatePath("/sitemap.xml");
    revalidatePath("/api/llms");
    revalidatePath("/cases");
    revalidatePath("/cases/[slug]", "page");
    return NextResponse.json({ success: true, data: cases[index] || nextCase });
  } catch {
    return NextResponse.json({ error: "保存失败" }, { status: 500 });
  }
}

function validateCase(value: unknown): string | null {
  if (!isRecord(value)) return "案例数据必须是对象";
  if (!isSlug(value.slug)) return "slug 只能使用小写字母、数字和连字符";
  for (const field of ["title", "industry", "oneLiner", "solution"]) {
    if (!isNonEmptyString(value[field])) return `${field} 不能为空`;
  }
  for (const field of ["relatedCustomers", "painPoints", "customerValue", "scenarios", "tags"]) {
    if (!isStringArray(value[field])) return `${field} 必须是字符串数组`;
  }
  if (value.metrics !== undefined && !isStringArray(value.metrics)) return "metrics 必须是字符串数组";
  if (typeof value.hasDetailPage !== "boolean") return "hasDetailPage 必须是布尔值";
  if (value.disclaimer !== undefined && typeof value.disclaimer !== "string") return "disclaimer 必须是字符串";
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
    const cases = readData.cases() as CaseItem[];
    const filtered = cases.filter((c) => c.slug !== slug);
    writeData.cases(filtered);
    revalidatePath("/sitemap.xml");
    revalidatePath("/cases");
    revalidatePath("/cases/[slug]", "page");
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "删除失败" }, { status: 500 });
  }
}
