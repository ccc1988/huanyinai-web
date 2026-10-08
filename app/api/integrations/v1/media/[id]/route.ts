import { NextRequest, NextResponse } from "next/server";
import { openOperationsDb } from "@/lib/operations/db";
import { requireIntegration, guardScope, errorResponse, rateHeaders } from "@/lib/operations/http";
import { OperationsError } from "@/lib/operations/core";
import { getMedia, mediaRequestMutation, readMediaUpload, readMediaJson, replaceMedia, updateMediaMetadata, softDeleteMedia, guardMediaGrant } from "@/lib/operations/media";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
type Context = { params: Promise<{ id: string }> };
async function handle(request: NextRequest, context: Context, method: "GET" | "PUT" | "PATCH" | "DELETE") {
  const db = openOperationsDb(), auth = requireIntegration(request, db); if (auth instanceof NextResponse) return auth;
  try {
    guardScope(auth.context, method === "GET" ? "media:read" : "media:write"); const { id } = await context.params; guardMediaGrant(auth.context, id);
    const actor = { actorType: "client" as const, actorId: auth.context.clientId };
    let result;
    if (method === "GET") { result = getMedia(db, id); if (!result) throw new OperationsError(404, "not_found"); }
    else if (method === "PUT") result = await replaceMedia(db, id, await readMediaUpload(request, db, actor));
    else if (method === "PATCH") { const input = mediaRequestMutation(request, actor); result = updateMediaMetadata(db, id, await readMediaJson(request), input); }
    else result = softDeleteMedia(db, id, mediaRequestMutation(request, actor));
    return NextResponse.json(result, { headers: { "X-Request-Id": auth.requestId, "Cache-Control": "no-store", ...rateHeaders(auth.context) } });
  } catch (error) { return errorResponse(error, auth.requestId); }
}
export async function GET(request: NextRequest, context: Context) { return handle(request, context, "GET"); }
export async function PUT(request: NextRequest, context: Context) { return handle(request, context, "PUT"); }
export async function PATCH(request: NextRequest, context: Context) { return handle(request, context, "PATCH"); }
export async function DELETE(request: NextRequest, context: Context) { return handle(request, context, "DELETE"); }
