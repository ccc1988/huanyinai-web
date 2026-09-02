"use client";

const STORAGE_KEY = "huanyin_analytics_context";
const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

export interface AnalyticsContext {
  analyticsSessionId: string;
  landingPath: string;
  landingReferrer?: string;
  landingUtmSource?: string;
  landingUtmMedium?: string;
  landingUtmCampaign?: string;
}

function uuid(): string {
  return globalThis.crypto?.randomUUID?.() || "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === "x" ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function cleanUtm(value: string | null): string | undefined {
  return value && /^[a-zA-Z0-9_-]{1,100}$/.test(value) ? value.toLowerCase() : undefined;
}

function referrerHost(): string | undefined {
  if (!document.referrer) return undefined;
  try { return new URL(document.referrer).hostname.toLowerCase().replace(/^www\./, "").slice(0, 120); } catch { return undefined; }
}

function currentContext(): AnalyticsContext {
  const params = new URLSearchParams(window.location.search);
  return {
    analyticsSessionId: uuid(),
    landingPath: window.location.pathname,
    landingReferrer: referrerHost(),
    landingUtmSource: cleanUtm(params.get("utm_source")),
    landingUtmMedium: cleanUtm(params.get("utm_medium")),
    landingUtmCampaign: cleanUtm(params.get("utm_campaign")),
  };
}

export function getAnalyticsContext(): AnalyticsContext | Record<string, never> {
  if (typeof window === "undefined") return {};
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null") as (AnalyticsContext & { expiresAt?: number }) | null;
    if (saved && saved.expiresAt && saved.expiresAt > Date.now() && saved.analyticsSessionId && saved.landingPath) {
      const { expiresAt: _expiresAt, ...context } = saved;
      return context;
    }
    const context = currentContext();
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...context, expiresAt: Date.now() + MAX_AGE_MS }));
    return context;
  } catch {
    return {};
  }
}

export function clearAnalyticsContext(): void {
  try { localStorage.removeItem(STORAGE_KEY); } catch { /* privacy tools may block storage */ }
}
