import type {
  Store,
  StoreAnalyticsCounts,
  StoreAnalyticsEntry,
  StoreAnalyticsRange,
} from "@/types";

/** A store joined with its GA4 numbers, as shown on the admin analytics page. */
export interface StoreAnalyticsRow {
  store: Store;
  analytics: StoreAnalyticsEntry;
}

const emptyCounts = (): StoreAnalyticsCounts => ({
  views: 0,
  gateViews: 0,
  gateClicks: 0,
});

// Stores with no GA4 traffic are absent from the API response.
export const emptyStoreAnalytics = (
  days: StoreAnalyticsRange,
): StoreAnalyticsEntry => ({
  allTime: emptyCounts(),
  current: { ...emptyCounts(), visitors: 0, daily: Array(days).fill(0) },
  previous: emptyCounts(),
});

/** Relative change vs the previous period; null when there is nothing to compare. */
export const changeRatio = (current: number, previous: number) =>
  previous > 0 ? (current - previous) / previous : null;
