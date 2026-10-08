import { NextRequest } from "next/server";
import { openOperationsDb } from "@/lib/operations/db";
import { requireAdmin, adminResponse } from "@/lib/operations/admin";
import { errorResponse, requestId } from "@/lib/operations/http";
import { restoreMedia, mediaRequestMutation } from "@/lib/operations/media";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const denied = requireAdmin(request, true); if (denied) return denied;
  try { const { id } = await context.params, input = mediaRequestMutation(request, { actorType: "admin", actorId: "session" }); return adminResponse(request, restoreMedia(openOperationsDb(), id, input)); }
  catch (error) { return errorResponse(error, requestId(request)); }
}
