import { NextRequest, NextResponse } from "next/server";
import { recordAnalyticsEvents, validateBrowserEvent, type AnalyticsEvent } from "@/lib/siteAnalytics";

const rateBuckets = new Map<string, { startedAt: number; count: number }>();
const WINDOW_MS = 60_000;
const MAX_EVENTS_PER_WINDOW = 60;

function rateLimitKey(request: NextRequest): string {
  return (request.headers.get("x-forwarded-for") || request.headers.get("cf-connecting-ip") || "anonymous").split(",")[0].trim().slice(0, 80);
}

export async function POST(request: NextRequest) {
  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > 64 * 1024) return NextResponse.json({ success: false, accepted: 0 });

  const key = rateLimitKey(request);
  const now = Date.now();
  for (const [bucketKey, value] of rateBuckets) {
    if (now - value.startedAt >= WINDOW_MS) rateBuckets.delete(bucketKey);
  }
  const bucket = rateBuckets.get(key);
  if (!bucket || now - bucket.startedAt >= WINDOW_MS) rateBuckets.set(key, { startedAt: now, count: 1 });
  else if (bucket.count >= MAX_EVENTS_PER_WINDOW) return NextResponse.json({ success: false, accepted: 0 });
  else bucket.count += 1;

  try {
    const payload = await request.json();
    const inputs = Array.isArray(payload) ? payload : payload?.events;
    if (!Array.isArray(inputs) || inputs.length === 0 || inputs.length > 20) return NextResponse.json({ success: false, accepted: 0 });
    const events = inputs.map((item) => validateBrowserEvent(item)).filter((item): item is AnalyticsEvent => item !== null);
    if (events.length === 0) return NextResponse.json({ success: false, accepted: 0 });
    const result = recordAnalyticsEvents(events);
    return NextResponse.json({ success: true, accepted: result.accepted, complete: result.complete });
  } catch {
    return NextResponse.json({ success: false, accepted: 0 });
  }
}
