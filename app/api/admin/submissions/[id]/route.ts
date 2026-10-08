import { NextRequest, NextResponse } from "next/server";
import { readData } from "@/lib/dataStore";
import {updateSubmission,deleteSubmission} from "@/lib/submissionsStore";
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
    const current = readData.submissions().find((item) => item.id === id);
    if (!current) return NextResponse.json({ error: "未找到" }, { status: 404 });
    const allowed = ["status", "category", "tags", "notes"];
    const patch = Object.fromEntries(allowed.filter((key) => key in body).map((key) => [key, body[key]]));
    const updated = updateSubmission(id, patch);
    if (!updated) return NextResponse.json({ error: "未找到" }, { status: 404 });
    return NextResponse.json({ success: true, submission: updated });
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
    if (!deleteSubmission(id)) {
      return NextResponse.json({ error: "未找到" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "删除失败" }, { status: 500 });
  }
}
