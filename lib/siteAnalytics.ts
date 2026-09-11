import fs from "node:fs";
import path from "node:path";

export type ContentType = "case" | "solution" | "blog" | "other";
export type AnalyticsEventName = "page_view" | "engaged_view" | "cta_click" | "contact_submit";

export interface AnalyticsEvent {
  eventId: string;
  name: AnalyticsEventName;
  path: string;
  contentType?: ContentType;
  sessionId?: string;
  source?: string;
  occurredAt: string;
  submissionId?: string;
}

export interface AttributionInput {
  analyticsSessionId?: unknown;
  landingPath?: unknown;
  landingReferrer?: unknown;
  landingUtmSource?: unknown;
  landingUtmMedium?: unknown;
  landingUtmCampaign?: unknown;
}

export interface NormalizedAttribution {
  analyticsSessionId?: string;
  landingPath?: string;
  landingReferrer?: string;
  landingUtmSource?: string;
  landingUtmMedium?: string;
  landingUtmCampaign?: string;
}

export interface DailyMetric {
  date: string;
  path: string;
  contentType: ContentType;
  source: string;
  slug?: string;
  visits: number;
  engagedViews: number;
  ctaClicks: number;
  inquiries: number;
}

export interface SourceMetric {
  periodStart: string;
  periodEnd: string;
  source: string;
  visits: number;
  engagedViews: number;
  ctaClicks: number;
  inquiries: number;
}

export interface ContentAction {
  id: string;
  path: string;
  action: "expand-case" | "add-faq-links" | "optimize-cta" | "optimize-intro" | "observe";
  owner: string;
  period: string;
  status: "planned" | "done" | "skipped";
  note?: string;
}

export interface SiteAnalyticsData {
  version: 1;
  updatedAt: string;
  daily: DailyMetric[];
  sources: SourceMetric[];
  actions: ContentAction[];
  dedupeKeys: Record<string, string>;
  inquiryKeys: Record<string, string>;
  health: {
    complete: boolean;
    incompleteEvents: number;
    lastErrorAt?: string;
  };
}

export interface PageMetricSummary {
  path: string;
  contentType: ContentType;
  visits: number;
  engagedViews: number;
  ctaClicks: number;
  inquiries: number;
  source: string;
}

export type DirectionStatus = "重点关注" | "优化 CTA/补证据" | "优化联系路径" | "数据不足" | "继续观察";

const PUBLIC_PATHS = ["/", "/cases", "/solutions", "/blog", "/about", "/contact"];
const SOURCE_NAMES = new Set(["google", "bing", "baidu", "chatgpt", "claude", "perplexity", "external", "direct"]);
const DAY_MS = 24 * 60 * 60 * 1000;
const LOCK_WAIT_MS = 2_000;
const EVENT_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SESSION_ID_PATTERN = EVENT_ID_PATTERN;

export function createEmptyAnalyticsData(): SiteAnalyticsData {
  return {
    version: 1,
    updatedAt: new Date(0).toISOString(),
    daily: [],
    sources: [],
    actions: [],
    dedupeKeys: {},
    inquiryKeys: {},
    health: { complete: true, incompleteEvents: 0 },
  };
}

export function normalizeSource(referrer: string | null | undefined): string {
  if (!referrer) return "direct";

  try {
    const host = new URL(referrer.includes("://") ? referrer : `https://${referrer}`).hostname.toLowerCase().replace(/^www\./, "");
    if (host === "google.com" || host.startsWith("google.")) return "google";
    if (host === "bing.com" || host.endsWith(".bing.com")) return "bing";
    if (host === "baidu.com" || host.endsWith(".baidu.com")) return "baidu";
    if (host === "chatgpt.com" || host === "chat.openai.com") return "chatgpt";
    if (host === "claude.ai") return "claude";
    if (host === "perplexity.ai") return "perplexity";
    return "external";
  } catch {
    return "direct";
  }
}

export function normalizeReferrerHost(referrer: unknown): string | undefined {
  if (typeof referrer !== "string" || !referrer.trim()) return undefined;
  try {
    const host = new URL(referrer.includes("://") ? referrer : `https://${referrer}`).hostname.toLowerCase().replace(/^www\./, "");
    return host ? host.slice(0, 120) : undefined;
  } catch {
    return undefined;
  }
}

export function normalizeLandingPath(value: unknown): string | undefined {
  if (typeof value !== "string" || value.length > 200 || !value.startsWith("/")) return undefined;
  const cleanPath = value.split("?")[0].split("#")[0];
  return getContentType(cleanPath) ? cleanPath : undefined;
}

function normalizeUtm(value: unknown): string | undefined {
  if (typeof value !== "string" || value.length > 100 || !/^[a-zA-Z0-9_-]+$/.test(value)) return undefined;
  return value.toLowerCase();
}

export function normalizeAttribution(input: AttributionInput): NormalizedAttribution {
  const sessionId = typeof input.analyticsSessionId === "string" && SESSION_ID_PATTERN.test(input.analyticsSessionId)
    ? input.analyticsSessionId
    : undefined;
  return {
    analyticsSessionId: sessionId,
    landingPath: normalizeLandingPath(input.landingPath),
    landingReferrer: normalizeReferrerHost(input.landingReferrer),
    landingUtmSource: normalizeUtm(input.landingUtmSource),
    landingUtmMedium: normalizeUtm(input.landingUtmMedium),
    landingUtmCampaign: normalizeUtm(input.landingUtmCampaign),
  };
}

export function validateBrowserEvent(input: unknown, now = new Date()): AnalyticsEvent | null {
  if (!input || typeof input !== "object") return null;
  const event = input as Record<string, unknown>;
  if (event.name !== "page_view" && event.name !== "engaged_view" && event.name !== "cta_click") return null;
  if (typeof event.eventId !== "string" || !EVENT_ID_PATTERN.test(event.eventId)) return null;
  if (typeof event.path !== "string") return null;
  const cleanPath = event.path.split("?")[0].split("#")[0];
  if (!getContentType(cleanPath)) return null;
  if (typeof event.occurredAt !== "string") return null;
  const occurredAt = Date.parse(event.occurredAt);
  if (!Number.isFinite(occurredAt) || Math.abs(now.getTime() - occurredAt) > 48 * 60 * 60 * 1000) return null;
  const sessionId = typeof event.sessionId === "string" && SESSION_ID_PATTERN.test(event.sessionId)
    ? event.sessionId
    : undefined;
  return {
    eventId: event.eventId,
    name: event.name,
    path: cleanPath,
    contentType: getContentType(cleanPath)?.type,
    sessionId,
    source: normalizeSource(typeof event.referrer === "string" ? event.referrer : undefined),
    occurredAt: new Date(occurredAt).toISOString(),
  };
}

export function getContentType(inputPath: string): { type: ContentType; slug?: string } | null {
  const cleanPath = inputPath.split("?")[0].split("#")[0];
  const caseMatch = cleanPath.match(/^\/cases\/([^/]+)\/?$/);
  if (caseMatch) return { type: "case", slug: caseMatch[1] };
  const solutionMatch = cleanPath.match(/^\/solutions\/([^/]+)\/?$/);
  if (solutionMatch) return { type: "solution", slug: solutionMatch[1] };
  const blogMatch = cleanPath.match(/^\/blog\/([^/]+)\/?$/);
  if (blogMatch) return { type: "blog", slug: blogMatch[1] };
  if (PUBLIC_PATHS.includes(cleanPath)) return { type: "other" };
  return null;
}

export function dateKey(value: string | Date): string {
  const date = value instanceof Date ? value : new Date(value);
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function sourceKey(value: string | undefined): string {
  return value && SOURCE_NAMES.has(value) ? value : "direct";
}

function metricFor(data: SiteAnalyticsData, event: AnalyticsEvent): DailyMetric {
  const date = dateKey(event.occurredAt);
  const content = getContentType(event.path) || { type: event.contentType || "other" as ContentType };
  const source = sourceKey(event.source);
  const existing = data.daily.find(
    (item) => item.date === date && item.path === event.path && item.source === source
  );
  if (existing) return existing;

  const metric: DailyMetric = {
    date,
    path: event.path,
    contentType: content.type,
    source,
    slug: content.slug,
    visits: 0,
    engagedViews: 0,
    ctaClicks: 0,
    inquiries: 0,
  };
  data.daily.push(metric);
  return metric;
}

function updateSourceMetric(data: SiteAnalyticsData, event: AnalyticsEvent, metric: DailyMetric): void {
  const date = dateKey(event.occurredAt);
  const source = metric.source;
  let sourceMetric = data.sources.find((item) => item.periodStart === date && item.source === source);
  if (!sourceMetric) {
    sourceMetric = {
      periodStart: date,
      periodEnd: date,
      source,
      visits: 0,
      engagedViews: 0,
      ctaClicks: 0,
      inquiries: 0,
    };
    data.sources.push(sourceMetric);
  }

  if (event.name === "page_view") sourceMetric.visits += 1;
  if (event.name === "engaged_view") sourceMetric.engagedViews += 1;
  if (event.name === "cta_click") sourceMetric.ctaClicks += 1;
  if (event.name === "contact_submit") sourceMetric.inquiries += 1;
}

function pruneKeys(data: SiteAnalyticsData, now: Date): void {
  const sevenDaysAgo = now.getTime() - 7 * DAY_MS;
  const yearAgo = now.getTime() - 365 * DAY_MS;
  for (const [key, timestamp] of Object.entries(data.dedupeKeys)) {
    if (Date.parse(timestamp) < sevenDaysAgo) delete data.dedupeKeys[key];
  }
  for (const [key, timestamp] of Object.entries(data.inquiryKeys)) {
    if (Date.parse(timestamp) < yearAgo) delete data.inquiryKeys[key];
  }
  const cutoff = now.getTime() - 365 * DAY_MS;
  data.daily = data.daily.filter((item) => Date.parse(`${item.date}T00:00:00.000Z`) >= cutoff);
  data.sources = data.sources.filter((item) => Date.parse(`${item.periodStart}T00:00:00.000Z`) >= cutoff);
}

export function applyAnalyticsEvents(
  input: SiteAnalyticsData,
  events: AnalyticsEvent[],
  now = new Date()
): { data: SiteAnalyticsData; accepted: number } {
  const data = structuredClone(input);
  pruneKeys(data, now);
  let accepted = 0;

  for (const event of events) {
    if (!event.eventId || !event.path || !getContentType(event.path)) continue;

    if (event.name === "contact_submit") {
      if (!event.submissionId || data.inquiryKeys[event.submissionId]) continue;
      data.inquiryKeys[event.submissionId] = event.occurredAt;
    } else {
      if (data.dedupeKeys[event.eventId]) continue;
      if (event.name === "engaged_view") {
        const engagedKey = `engaged:${event.sessionId || "anonymous"}:${event.path}:${dateKey(event.occurredAt)}`;
        if (data.dedupeKeys[engagedKey]) continue;
      }
      data.dedupeKeys[event.eventId] = event.occurredAt;
    }

    const metric = metricFor(data, event);
    if (event.name === "page_view") metric.visits += 1;
    if (event.name === "engaged_view") {
      const engagedKey = `engaged:${event.sessionId || "anonymous"}:${event.path}:${dateKey(event.occurredAt)}`;
      data.dedupeKeys[engagedKey] = event.occurredAt;
      metric.engagedViews += 1;
    }
    if (event.name === "cta_click") metric.ctaClicks += 1;
    if (event.name === "contact_submit") metric.inquiries += 1;
    updateSourceMetric(data, event, metric);
    accepted += 1;
  }

  data.updatedAt = now.toISOString();
  return { data, accepted };
}

export function summarizePageMetrics(daily: DailyMetric[]): PageMetricSummary[] {
  const grouped = new Map<string, PageMetricSummary & { sourceVisits: Map<string, number> }>();
  for (const metric of daily) {
    const current = grouped.get(metric.path) || {
      path: metric.path,
      contentType: metric.contentType,
      visits: 0,
      engagedViews: 0,
      ctaClicks: 0,
      inquiries: 0,
      source: metric.source,
      sourceVisits: new Map<string, number>(),
    };
    current.visits += metric.visits;
    current.engagedViews += metric.engagedViews;
    current.ctaClicks += metric.ctaClicks;
    current.inquiries += metric.inquiries;
    current.sourceVisits.set(metric.source, (current.sourceVisits.get(metric.source) || 0) + metric.visits);
    grouped.set(metric.path, current);
  }

  return [...grouped.values()].map(({ sourceVisits, ...summary }) => {
    const source = [...sourceVisits.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || "direct";
    return { ...summary, source };
  });
}

export function getDirectionStatus(summary: PageMetricSummary, sameType: PageMetricSummary[]): DirectionStatus {
  if (sameType.length < 2 || (summary.visits < 20 && summary.engagedViews < 5)) return "数据不足";
  const sorted = sameType.map((item) => item.visits).sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)] || 0;
  const hasVolume = summary.visits >= 20 || summary.engagedViews >= 5;
  if (!hasVolume) return "数据不足";
  if (summary.inquiries > 0 && (summary.visits >= median || summary.engagedViews >= 5)) return "重点关注";
  if (summary.visits > 0 && summary.ctaClicks === 0) return "优化 CTA/补证据";
  if (summary.ctaClicks > 0 && summary.inquiries === 0) return "优化联系路径";
  return "继续观察";
}

export function analyticsDataPath(dataDir = process.env.DATA_DIR || path.join(process.cwd(), "data")): string {
  return path.join(dataDir, "site-analytics.json");
}

export function analyticsHealthPath(dataDir = process.env.DATA_DIR || path.join(process.cwd(), "data")): string {
  return path.join(dataDir, "site-analytics-health.json");
}

export class AnalyticsWriteError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AnalyticsWriteError";
  }
}

function parseAnalyticsFile(dataDir: string): SiteAnalyticsData {
  const filePath = analyticsDataPath(dataDir);
  if (!fs.existsSync(filePath)) return createEmptyAnalyticsData();
  try {
    const parsed = JSON.parse(fs.readFileSync(filePath, "utf-8")) as SiteAnalyticsData;
    if (parsed?.version !== 1 || !Array.isArray(parsed.daily) || !Array.isArray(parsed.sources)) {
      throw new Error("invalid analytics data");
    }
    const empty = createEmptyAnalyticsData();
    return {
      ...empty,
      ...parsed,
      actions: Array.isArray(parsed.actions) ? parsed.actions : [],
      dedupeKeys: parsed.dedupeKeys || {},
      inquiryKeys: parsed.inquiryKeys || {},
      health: parsed.health || empty.health,
    };
  } catch (error) {
    throw new AnalyticsWriteError(`invalid analytics data: ${String(error)}`);
  }
}

function sleepBriefly(): void {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 25);
}

function withAnalyticsLock<T>(dataDir: string, operation: () => T): T {
  fs.mkdirSync(dataDir, { recursive: true });
  const lockPath = analyticsDataPath(dataDir) + ".lock";
  const startedAt = Date.now();
  let handle: number | undefined;
  try {
    while (Date.now() - startedAt < LOCK_WAIT_MS) {
      try {
        handle = fs.openSync(lockPath, "wx");
        break;
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error;
        sleepBriefly();
      }
    }
    if (handle === undefined) throw new AnalyticsWriteError("analytics lock timeout");
    return operation();
  } finally {
    if (handle !== undefined) fs.closeSync(handle);
    try { fs.unlinkSync(lockPath); } catch { /* another process may have cleaned it */ }
  }
}

function writeAnalyticsFile(dataDir: string, data: SiteAnalyticsData): void {
  const filePath = analyticsDataPath(dataDir);
  const tmpPath = `${filePath}.${process.pid}.tmp`;
  fs.writeFileSync(tmpPath, JSON.stringify(data, null, 2), "utf-8");
  fs.renameSync(tmpPath, filePath);
}

function recordHealthFailure(dataDir: string): void {
  try {
    const healthPath = analyticsHealthPath(dataDir);
    let current = { incompleteEvents: 0, lastErrorAt: "" };
    try { current = JSON.parse(fs.readFileSync(healthPath, "utf-8")); } catch { /* first failure */ }
    const tmpPath = `${healthPath}.${process.pid}.tmp`;
    fs.writeFileSync(tmpPath, JSON.stringify({ incompleteEvents: (current.incompleteEvents || 0) + 1, lastErrorAt: new Date().toISOString() }), "utf-8");
    fs.renameSync(tmpPath, healthPath);
  } catch { /* analytics must never affect the website */ }
}

export function recordAnalyticsEvents(
  events: AnalyticsEvent[],
  dataDir = process.env.DATA_DIR || path.join(process.cwd(), "data")
): { accepted: number; complete: boolean } {
  try {
    return withAnalyticsLock(dataDir, () => {
      const currentData = parseAnalyticsFile(dataDir);
      const result = applyAnalyticsEvents(currentData, events);
      const data = result.data;
      let sidecar = { incompleteEvents: 0, lastErrorAt: undefined as string | undefined };
      try { sidecar = JSON.parse(fs.readFileSync(analyticsHealthPath(dataDir), "utf-8")); } catch { /* no sidecar */ }
      data.health = {
        complete: data.health.complete && !sidecar.incompleteEvents,
        incompleteEvents: (data.health.incompleteEvents || 0) + (sidecar.incompleteEvents || 0),
        lastErrorAt: sidecar.lastErrorAt || data.health.lastErrorAt,
      };
      writeAnalyticsFile(dataDir, data);
      try { fs.unlinkSync(analyticsHealthPath(dataDir)); } catch { /* already absent */ }
      return { accepted: result.accepted, complete: data.health.complete };
    });
  } catch {
    recordHealthFailure(dataDir);
    return { accepted: 0, complete: false };
  }
}

export function recordAnalyticsEvent(
  event: AnalyticsEvent,
  dataDir = process.env.DATA_DIR || path.join(process.cwd(), "data")
): { accepted: number; complete: boolean } {
  return recordAnalyticsEvents([event], dataDir);
}

export function saveContentAction(
  action: ContentAction,
  dataDir = process.env.DATA_DIR || path.join(process.cwd(), "data")
): boolean {
  try {
    return withAnalyticsLock(dataDir, () => {
      const data = parseAnalyticsFile(dataDir);
      const index = data.actions.findIndex((item) => item.id === action.id);
      if (index === -1) data.actions.unshift(action);
      else data.actions[index] = action;
      data.updatedAt = new Date().toISOString();
      writeAnalyticsFile(dataDir, data);
      return true;
    });
  } catch {
    recordHealthFailure(dataDir);
    return false;
  }
}

export function readAnalyticsData(dataDir?: string): SiteAnalyticsData {
  const resolvedDataDir = dataDir || process.env.DATA_DIR || path.join(process.cwd(), "data");
  try {
    const data = parseAnalyticsFile(resolvedDataDir);
    try {
      const sidecar = JSON.parse(fs.readFileSync(analyticsHealthPath(resolvedDataDir), "utf-8"));
      data.health = { complete: false, incompleteEvents: sidecar.incompleteEvents || 0, lastErrorAt: sidecar.lastErrorAt };
    } catch { /* complete */ }
    return data;
  } catch {
    return { ...createEmptyAnalyticsData(), health: { complete: false, incompleteEvents: 1, lastErrorAt: new Date().toISOString() } };
  }
}
