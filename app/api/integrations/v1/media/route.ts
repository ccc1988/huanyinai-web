import { NextRequest, NextResponse } from "next/server";
import { openOperationsDb } from "@/lib/operations/db";
import { requireIntegration, guardScope, errorResponse, rateHeaders } from "@/lib/operations/http";
import { listMediaForIntegration, mediaListOptions, readMediaUpload, saveMedia, guardMediaGrant } from "@/lib/operations/media";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET(request: NextRequest) {
  const db = openOperationsDb(), auth = requireIntegration(request, db); if (auth instanceof NextResponse) return auth;
  try { guardScope(auth.context, "media:read"); guardMediaGrant(auth.context); return NextResponse.json({ items: listMediaForIntegration(db, auth.context, mediaListOptions(request.url)) }, { headers: { "X-Request-Id": auth.requestId, "Cache-Control": "no-store", ...rateHeaders(auth.context) } }); }
  catch (error) { return errorResponse(error, auth.requestId); }
}
export async function POST(request: NextRequest) {
  const db = openOperationsDb(), auth = requireIntegration(request, db); if (auth instanceof NextResponse) return auth;
  try { guardScope(auth.context, "media:write"); guardMediaGrant(auth.context, undefined, true); const input = await readMediaUpload(request, db, { actorType: "client", actorId: auth.context.clientId }); return NextResponse.json(await saveMedia(db, input), { status: 201, headers: { "X-Request-Id": auth.requestId, "Cache-Control": "no-store", ...rateHeaders(auth.context) } }); }
  catch (error) { return errorResponse(error, auth.requestId); }
}
