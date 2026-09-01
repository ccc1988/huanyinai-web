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
    const data = await request.json();
    const industries = readData.industries() as IndustrySolution[];
    const now = new Date().toISOString();

    const index = industries.findIndex((i) => i.slug === data.slug);
    const nextIndustry = { ...data, updatedAt: now } as IndustrySolution;
    if (index === -1) {
      industries.push(nextIndustry);
    } else {
      industries[index] = { ...industries[index], ...data, updatedAt: now };
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
