import { NextRequest, NextResponse } from "next/server";
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

    // 根据 slug 查找并更新
    const index = cases.findIndex((c) => c.slug === data.slug);
    if (index === -1) {
      // 新增
      cases.push(data as CaseItem);
    } else {
      // 更新
      cases[index] = { ...cases[index], ...data };
    }

    writeData.cases(cases);
    return NextResponse.json({ success: true, data: cases[index] || data });
  } catch {
    return NextResponse.json({ error: "保存失败" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { slug } = await request.json();
    const cases = readData.cases() as CaseItem[];
    const filtered = cases.filter((c) => c.slug !== slug);
    writeData.cases(filtered);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "删除失败" }, { status: 500 });
  }
}
