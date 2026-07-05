import { NextRequest, NextResponse } from "next/server";
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

    const index = industries.findIndex((i) => i.slug === data.slug);
    if (index === -1) {
      industries.push(data as IndustrySolution);
    } else {
      industries[index] = { ...industries[index], ...data };
    }

    writeData.industries(industries);
    return NextResponse.json({ success: true, data: industries[index] || data });
  } catch {
    return NextResponse.json({ error: "保存失败" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { slug } = await request.json();
    const industries = readData.industries() as IndustrySolution[];
    const filtered = industries.filter((i) => i.slug !== slug);
    writeData.industries(filtered);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "删除失败" }, { status: 500 });
  }
}
