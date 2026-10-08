import { NextRequest } from "next/server";
import { openOperationsDb } from "@/lib/operations/db";
import { requireAdmin, adminResponse } from "@/lib/operations/admin";
import { errorResponse, requestId } from "@/lib/operations/http";
import { OperationsError } from "@/lib/operations/core";
import { getMedia, mediaRequestMutation, readMediaUpload, readMediaJson, replaceMedia, updateMediaMetadata, softDeleteMedia } from "@/lib/operations/media";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
type Context = { params: Promise<{ id: string }> };
export async function GET(request: NextRequest, context: Context) {
  const denied = requireAdmin(request); if (denied) return denied;
  try { const { id } = await context.params, item = getMedia(openOperationsDb(), id); if (!item) throw new OperationsError(404, "not_found"); return adminResponse(request, item); }
  catch (error) { return errorResponse(error, requestId(request)); }
}
export async function PUT(request: NextRequest, context: Context) {
  const denied = requireAdmin(request, true); if (denied) return denied;
  try { const { id } = await context.params, db = openOperationsDb(), input = await readMediaUpload(request, db, { actorType: "admin", actorId: "session" }); return adminResponse(request, await replaceMedia(db, id, input)); }
  catch (error) { return errorResponse(error, requestId(request)); }
}
export async function PATCH(request: NextRequest, context: Context) {
  const denied = requireAdmin(request, true); if (denied) return denied;
  try { const { id } = await context.params, input = mediaRequestMutation(request, { actorType: "admin", actorId: "session" }), body = await readMediaJson(request); return adminResponse(request, updateMediaMetadata(openOperationsDb(), id, body, input)); }
  catch (error) { return errorResponse(error, requestId(request)); }
}
export async function DELETE(request: NextRequest, context: Context) {
  const denied = requireAdmin(request, true); if (denied) return denied;
  try { const { id } = await context.params, input = mediaRequestMutation(request, { actorType: "admin", actorId: "session" }); return adminResponse(request, softDeleteMedia(openOperationsDb(), id, input)); }
  catch (error) { return errorResponse(error, requestId(request)); }
}
