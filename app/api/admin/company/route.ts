import { NextRequest, NextResponse } from "next/server";
import { readData, writeData } from "@/lib/dataStore";
import { requireAuth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const authError = requireAuth(request);
  if (authError) return authError;
  const company = readData.company();
  const customers = readData.customers();
  const capabilities = readData.capabilities();
  const stats = readData.stats();
  const contacts = readData.contacts();
  return NextResponse.json({ company, customers, capabilities, stats, contacts });
}

export async function PUT(request: NextRequest) {
  const authError = requireAuth(request);
  if (authError) return authError;
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
        if (!isCapabilities(data)) return NextResponse.json({ error: "能力模块数据格式无效" }, { status: 400 });
        writeData.capabilities(data);
        break;
      case "stats":
        writeData.stats(data);
        break;
      case "contacts":
        writeData.contacts(data);
        break;
      default:
        return NextResponse.json({ error: "未知的数据类型" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "保存失败" }, { status: 500 });
  }
}

function isCapabilities(value: unknown): value is Array<{ module: string; products: string[]; scenarios: string; icon: string }> {
  return Array.isArray(value) && value.length > 0 && value.every((item) => {
    if (typeof item !== "object" || item === null || Array.isArray(item)) return false;
    const candidate = item as Record<string, unknown>;
    return typeof candidate.module === "string" && candidate.module.trim().length > 0
      && typeof candidate.scenarios === "string"
      && typeof candidate.icon === "string"
      && Array.isArray(candidate.products)
      && candidate.products.every((product) => typeof product === "string" && product.trim().length > 0);
  });
}
