"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { getAnalyticsContext } from "@/lib/analyticsContext";

type BrowserEvent = "page_view" | "engaged_view" | "cta_click";

function eventId(): string {
  return globalThis.crypto?.randomUUID?.() || "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === "x" ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export default function SiteAnalyticsTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin")) return;
    const context = getAnalyticsContext();
    if (!("analyticsSessionId" in context)) return;
    const sessionId = context.analyticsSessionId;
    const send = (name: BrowserEvent) => {
      const payload = [{
        eventId: eventId(),
        name,
        path: window.location.pathname,
        sessionId,
        referrer: context.landingReferrer,
        occurredAt: new Date().toISOString(),
      }];
      void fetch("/api/site-analytics/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        keepalive: true,
      }).catch(() => undefined);
    };

    send("page_view");
    let engaged = false;
    let visibleSince = document.visibilityState === "visible" ? Date.now() : 0;
    const timer = window.setInterval(() => {
      if (engaged || document.visibilityState !== "visible") return;
      if (!visibleSince) visibleSince = Date.now();
      if (Date.now() - visibleSince >= 20_000) {
        engaged = true;
        send("engaged_view");
      }
    }, 1_000);
    const visibility = () => { visibleSince = document.visibilityState === "visible" ? Date.now() : 0; };
    document.addEventListener("visibilitychange", visibility);
    const click = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const link = target?.closest("a,button");
      if (!link) return;
      const href = link instanceof HTMLAnchorElement ? link.getAttribute("href") || "" : "";
      if (href === "/contact" || href.startsWith("tel:") || href.startsWith("mailto:") || link.textContent?.includes("微信")) send("cta_click");
    };
    document.addEventListener("click", click);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", visibility);
      document.removeEventListener("click", click);
    };
  }, [pathname]);

  return null;
}
