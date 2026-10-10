import type { StoreAnalyticsRange } from "@/types";

export const RANGE_OPTIONS: StoreAnalyticsRange[] = [7, 30, 90];
export const DEFAULT_RANGE: StoreAnalyticsRange = 30;

// First days the events existed (AnalyticsTracker page views, then the seller
// contact gate). All-time totals start here — earlier dates hold no data.
export const PAGE_VIEW_TRACKING_START = "2026-07-04";
export const CONTACT_GATE_TRACKING_START = "2026-09-19";

export const CONTACT_GATE_EVENTS = {
  VIEW: "contact_gate_view",
  CLICK: "contact_gate_click",
} as const;

// GA4 reports are cached server-side; the data itself already lags 24–48h.
export const ANALYTICS_CACHE_SECONDS = 60 * 60;

// Must match the GA4 property's reporting timezone.
export const ANALYTICS_TIMEZONE = "Asia/Taipei";
