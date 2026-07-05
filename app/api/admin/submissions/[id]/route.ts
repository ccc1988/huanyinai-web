import { NextRequest, NextResponse } from "next/server";
import { readData, writeData } from "@/lib/dataStore";
import { requireAuth } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = requireAuth(request);
  if (authError) return authError;
  const { id } = await params;
  const submissions = readData.submissions();
  const submission = submissions.find((s) => s.id === id);

  if (!submission) {
    return NextResponse.json({ error: "未找到" }, { status: 404 });
  }
  return NextResponse.json(submission);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = requireAuth(request);
  if (authError) return authError;
  try {
    const { id } = await params;
    const body = await request.json();
    const submissions = readData.submissions();
    const idx = submissions.findIndex((s) => s.id === id);

    if (idx < 0) {
      return NextResponse.json({ error: "未找到" }, { status: 404 });
    }

    // 只允许更新这些字段
    const allowed = ["status", "category", "tags", "notes"];
    for (const key of allowed) {
      if (key in body) {
        (submissions[idx] as unknown as Record<string, unknown>)[key] = body[key];
      }
    }

    writeData.submissions(submissions);
    return NextResponse.json({ success: true, submission: submissions[idx] });
  } catch {
    return NextResponse.json({ error: "更新失败" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authError = requireAuth(request);
  if (authError) return authError;
  try {
    const { id } = await params;
    const submissions = readData.submissions();
    const filtered = submissions.filter((s) => s.id !== id);

    if (filtered.length === submissions.length) {
      return NextResponse.json({ error: "未找到" }, { status: 404 });
    }

    writeData.submissions(filtered);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "删除失败" }, { status: 500 });
  }
}
