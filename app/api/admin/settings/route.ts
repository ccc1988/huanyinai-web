import { NextRequest, NextResponse } from "next/server";
import { readData, writeData } from "@/lib/dataStore";

export async function GET() {
  const settings = readData.settings();
  return NextResponse.json(settings);
}

export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();
    writeData.settings(data);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "保存失败" }, { status: 500 });
  }
}
