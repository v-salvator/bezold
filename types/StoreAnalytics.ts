// Response contract of GET /api/admin/store-analytics (see SPEC.md).

export type StoreAnalyticsRange = 7 | 30 | 90;

export interface StoreAnalyticsCounts {
  views: number;
  gateViews: number;
  gateClicks: number;
}

export interface StoreAnalyticsEntry {
  allTime: StoreAnalyticsCounts;
  current: StoreAnalyticsCounts & {
    visitors: number;
    /** Daily page views, oldest → newest, zero-filled to `range.days` entries. */
    daily: number[];
  };
  previous: StoreAnalyticsCounts;
}

export interface StoreAnalyticsResponse {
  range: {
    days: StoreAnalyticsRange;
    /** YYYY-MM-DD in the GA4 property timezone (Asia/Taipei). */
    startDate: string;
    endDate: string;
  };
  /** ISO timestamp of the (cached) GA4 fetch. */
  generatedAt: string;
  /** Keyed by storeId. A store without any traffic is absent. */
  stores: Record<string, StoreAnalyticsEntry>;
}
