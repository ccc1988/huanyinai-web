import { NextRequest } from "next/server";
import { openOperationsDb } from "@/lib/operations/db";
import { mediaAssetResponse } from "@/lib/operations/media";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
type Context = { params: Promise<{ path: string[] }> };
export async function GET(_request: NextRequest, context: Context) { const { path } = await context.params; return mediaAssetResponse(openOperationsDb(), path); }
export async function HEAD(_request: NextRequest, context: Context) { const { path } = await context.params; return mediaAssetResponse(openOperationsDb(), path, true); }
