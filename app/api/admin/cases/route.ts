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
    const data = await request.json();
    const cases = readData.cases() as CaseItem[];
    const now = new Date().toISOString();

    // 根据 slug 查找并更新
    const index = cases.findIndex((c) => c.slug === data.slug);
    const nextCase = { ...data, updatedAt: now } as CaseItem;
    if (index === -1) {
      // 新增
      cases.push(nextCase);
    } else {
      // 更新
      cases[index] = { ...cases[index], ...data, updatedAt: now };
    }

    writeData.cases(cases);
    revalidatePath("/sitemap.xml");
    revalidatePath("/cases");
    revalidatePath("/cases/[slug]", "page");
    return NextResponse.json({ success: true, data: cases[index] || nextCase });
  } catch {
    return NextResponse.json({ error: "保存失败" }, { status: 500 });
  }
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
