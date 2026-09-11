import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  applyAnalyticsEvents,
  createEmptyAnalyticsData,
  dateKey,
  getContentType,
  normalizeSource,
  normalizeAttribution,
  recordAnalyticsEvents,
  summarizePageMetrics,
  type AnalyticsEvent,
} from "../lib/siteAnalytics.ts";

test("groups event dates by China Standard Time", () => {
  assert.equal(dateKey("2026-09-10T16:30:00.000Z"), "2026-09-11");
  assert.equal(dateKey("2026-09-11T15:59:59.000Z"), "2026-09-11");
});

test("normalizes referrer into a source category without query data", () => {
  assert.equal(normalizeSource("https://www.google.com/search?q=secret"), "google");
  assert.equal(normalizeSource("https://chatgpt.com/c/123?x=1"), "chatgpt");
  assert.equal(normalizeSource("https://example.com/path?phone=13800000000"), "external");
  assert.equal(normalizeSource(""), "direct");
});

test("classifies only supported public content routes", () => {
  assert.equal(getContentType("/cases/customs-document-ai")?.type, "case");
  assert.equal(getContentType("/solutions/customs")?.type, "solution");
  assert.equal(getContentType("/blog/ai-trends")?.type, "blog");
  assert.equal(getContentType("/admin/cases"), null);
  assert.equal(getContentType("/_next/static/chunk.js"), null);
});

test("deduplicates browser events and engaged views", () => {
  const data = createEmptyAnalyticsData();
  const events: AnalyticsEvent[] = [
    { eventId: "page-1", name: "page_view", path: "/cases/demo", sessionId: "session-1", source: "google", occurredAt: "2026-09-02T10:00:00.000Z" },
    { eventId: "page-1", name: "page_view", path: "/cases/demo", sessionId: "session-1", source: "google", occurredAt: "2026-09-02T10:00:01.000Z" },
    { eventId: "engaged-1", name: "engaged_view", path: "/cases/demo", sessionId: "session-1", source: "google", occurredAt: "2026-09-02T10:00:20.000Z" },
    { eventId: "engaged-2", name: "engaged_view", path: "/cases/demo", sessionId: "session-1", source: "google", occurredAt: "2026-09-02T10:00:21.000Z" },
  ];

  const result = applyAnalyticsEvents(data, events, new Date("2026-09-02T12:00:00.000Z"));
  assert.equal(result.accepted, 2);
  assert.equal(result.data.daily[0].visits, 1);
  assert.equal(result.data.daily[0].engagedViews, 1);
  assert.equal(Object.keys(result.data.dedupeKeys).length, 3);
});

test("records a persisted consultation once and keeps page source dimensions", () => {
  const data = createEmptyAnalyticsData();
  const event: AnalyticsEvent = {
    eventId: "submission-1",
    name: "contact_submit",
    path: "/cases/demo",
    sessionId: "session-1",
    source: "chatgpt",
    occurredAt: "2026-09-02T10:00:00.000Z",
    submissionId: "sub-1",
  };

  const first = applyAnalyticsEvents(data, [event], new Date("2026-09-02T12:00:00.000Z"));
  const second = applyAnalyticsEvents(first.data, [event], new Date("2026-09-02T12:00:00.000Z"));
  assert.equal(first.accepted, 1);
  assert.equal(second.accepted, 0);
  assert.equal(second.data.daily[0].inquiries, 1);
  assert.equal(second.data.inquiryKeys["sub-1"], "2026-09-02T10:00:00.000Z");

  const summary = summarizePageMetrics(second.data.daily);
  assert.equal(summary[0].path, "/cases/demo");
  assert.equal(summary[0].source, "chatgpt");
});

test("normalizes attribution and persists only accepted browser events", () => {
  const sessionId = "11111111-1111-4111-8111-111111111111";
  const attribution = normalizeAttribution({
    analyticsSessionId: sessionId,
    landingPath: "/cases/demo?secret=1",
    landingReferrer: "https://chatgpt.com/c/secret",
    landingUtmSource: "AI_CHAT",
    landingUtmMedium: "bad value",
  });
  assert.deepEqual(attribution, {
    analyticsSessionId: sessionId,
    landingPath: "/cases/demo",
    landingReferrer: "chatgpt.com",
    landingUtmSource: "ai_chat",
    landingUtmMedium: undefined,
    landingUtmCampaign: undefined,
  });

  const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), "huanyin-analytics-"));
  try {
    const result = recordAnalyticsEvents([{
      eventId: "22222222-2222-4222-8222-222222222222",
      name: "page_view",
      path: "/cases/demo",
      sessionId,
      source: "chatgpt",
      occurredAt: new Date().toISOString(),
    }], dataDir);
    assert.deepEqual(result, { accepted: 1, complete: true });
    const saved = JSON.parse(fs.readFileSync(path.join(dataDir, "site-analytics.json"), "utf8"));
    assert.equal(saved.daily[0].visits, 1);
    assert.equal(saved.daily[0].source, "chatgpt");
  } finally {
    fs.rmSync(dataDir, { recursive: true, force: true });
  }
});
