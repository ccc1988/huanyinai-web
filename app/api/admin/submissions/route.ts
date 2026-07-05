import { NextRequest, NextResponse } from "next/server";
import { readData } from "@/lib/dataStore";
import { requireAuth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const authError = requireAuth(request);
  if (authError) return authError;
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const category = searchParams.get("category");

  let submissions = readData.submissions();

  if (status && status !== "all") {
    submissions = submissions.filter((s) => s.status === status);
  }
  if (category && category !== "all") {
    submissions = submissions.filter((s) => s.category === category);
  }

  return NextResponse.json(submissions);
}
