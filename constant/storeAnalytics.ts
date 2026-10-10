import type { SellerContactChannel, StoreAnalyticsRange } from "@/types";

export const RANGE_OPTIONS: StoreAnalyticsRange[] = [7, 30, 90];
export const DEFAULT_RANGE: StoreAnalyticsRange = 30;

// First days the events existed (AnalyticsTracker page views, then the seller
// contact gate). All-time totals start here — earlier dates hold no data.
export const PAGE_VIEW_TRACKING_START = "2026-07-04";
export const CONTACT_GATE_TRACKING_START = "2026-09-19";
// seller_contact_* events shipped with PR #78 (merged 2026-10-10).
export const MEMBER_CONTACT_TRACKING_START = "2026-10-10";

export const CONTACT_GATE_EVENTS = {
  VIEW: "contact_gate_view",
  CLICK: "contact_gate_click",
} as const;

// One event per channel (rather than one event + a `channel` param) so the
// admin report can split by channel without a GA4 custom dimension.
export const SELLER_CONTACT_EVENTS: Record<SellerContactChannel, string> = {
  phone: "seller_contact_phone",
  line: "seller_contact_line",
  threads: "seller_contact_threads",
};

export const SELLER_CONTACT_LABEL: Record<SellerContactChannel, string> = {
  phone: "電話",
  line: "LINE",
  threads: "Threads",
};

// GA4 reports are cached server-side; the data itself already lags 24–48h.
export const ANALYTICS_CACHE_SECONDS = 60 * 60;

// Must match the GA4 property's reporting timezone.
export const ANALYTICS_TIMEZONE = "Asia/Taipei";
