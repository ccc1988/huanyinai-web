import { NextRequest, NextResponse } from "next/server";
import { readData, writeData } from "@/lib/dataStore";
import { requireAuth } from "@/lib/auth";

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
    const data = await request.json();
    writeData.settings(data);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "保存失败" }, { status: 500 });
  }
}
