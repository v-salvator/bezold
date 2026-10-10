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

export const emptyStoreAnalyticsCounts = (): StoreAnalyticsCounts => ({
  views: 0,
  gateViews: 0,
  gateClicks: 0,
  memberContacts: { phone: 0, line: 0, threads: 0 },
});

export const memberContactTotal = ({ memberContacts }: StoreAnalyticsCounts) =>
  memberContacts.phone + memberContacts.line + memberContacts.threads;

// Stores with no GA4 traffic are absent from the API response.
export const emptyStoreAnalytics = (
  days: StoreAnalyticsRange,
): StoreAnalyticsEntry => ({
  allTime: emptyStoreAnalyticsCounts(),
  current: {
    ...emptyStoreAnalyticsCounts(),
    visitors: 0,
    daily: Array(days).fill(0),
  },
  previous: emptyStoreAnalyticsCounts(),
});

/** Relative change vs the previous period; null when there is nothing to compare. */
export const changeRatio = (current: number, previous: number) =>
  previous > 0 ? (current - previous) / previous : null;
