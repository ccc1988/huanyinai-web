import { NextRequest } from "next/server";
import { openOperationsDb } from "@/lib/operations/db";
import { requireAdmin, adminResponse } from "@/lib/operations/admin";
import { errorResponse, requestId } from "@/lib/operations/http";
import { listMedia, mediaListOptions, readMediaUpload, saveMedia } from "@/lib/operations/media";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(request: NextRequest) {
  const denied = requireAdmin(request); if (denied) return denied;
  try { return adminResponse(request, { items: listMedia(openOperationsDb(), mediaListOptions(request.url)) }); }
  catch (error) { return errorResponse(error, requestId(request)); }
}
export async function POST(request: NextRequest) {
  const denied = requireAdmin(request, true); if (denied) return denied;
  try { const db = openOperationsDb(); const input = await readMediaUpload(request, db, { actorType: "admin", actorId: "session" }); return adminResponse(request, await saveMedia(db, input), 201); }
  catch (error) { return errorResponse(error, requestId(request)); }
}
