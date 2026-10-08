import { NextRequest, NextResponse } from "next/server";
import { openOperationsDb } from "@/lib/operations/db";
import { requireIntegration, guardScope, errorResponse, rateHeaders } from "@/lib/operations/http";
import { restoreMedia, mediaRequestMutation, guardMediaGrant } from "@/lib/operations/media";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const db = openOperationsDb(), auth = requireIntegration(request, db); if (auth instanceof NextResponse) return auth;
  try { guardScope(auth.context, "media:write"); const { id } = await context.params; guardMediaGrant(auth.context, id); const input = mediaRequestMutation(request, { actorType: "client", actorId: auth.context.clientId }); return NextResponse.json(restoreMedia(db, id, input), { headers: { "X-Request-Id": auth.requestId, "Cache-Control": "no-store", ...rateHeaders(auth.context) } }); }
  catch (error) { return errorResponse(error, auth.requestId); }
}
