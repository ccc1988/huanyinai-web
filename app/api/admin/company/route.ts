import { NextRequest, NextResponse } from "next/server";
import { readData, writeData } from "@/lib/dataStore";

export async function GET() {
  const company = readData.company();
  const customers = readData.customers();
  const capabilities = readData.capabilities();
  const stats = readData.stats();
  return NextResponse.json({ company, customers, capabilities, stats });
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, data } = body;

    switch (type) {
      case "company":
        writeData.company(data);
        break;
      case "customers":
        writeData.customers(data);
        break;
      case "capabilities":
        writeData.capabilities(data);
        break;
      case "stats":
        writeData.stats(data);
        break;
      default:
        return NextResponse.json({ error: "未知的数据类型" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "保存失败" }, { status: 500 });
  }
}
