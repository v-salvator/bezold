// Pure GA4-rows → StoreAnalyticsResponse conversion. No SDK types here: the
// fetch layer flattens each GA4 row into header-keyed records first.
import { CONTACT_GATE_EVENTS } from "@/constant/storeAnalytics";
import type {
  StoreAnalyticsCounts,
  StoreAnalyticsEntry,
  StoreAnalyticsRange,
  StoreAnalyticsResponse,
} from "@/types";

export interface AnalyticsReportRow {
  /** Keyed by GA4 dimension name, e.g. { pagePath: "/store/abc", date: "20261009" } */
  dimensions: Record<string, string>;
  /** Keyed by GA4 metric name, e.g. { screenPageViews: 12 } */
  metrics: Record<string, number>;
}

export interface StoreAnalyticsReports {
  /** pagePath + date → screenPageViews, current period only */
  dailyViews: AnalyticsReportRow[];
  /** pagePath + dateRange → screenPageViews, activeUsers */
  periodViews: AnalyticsReportRow[];
  /** pagePath + eventName + dateRange → eventCount */
  periodGateEvents: AnalyticsReportRow[];
  /** pagePath → screenPageViews since page-view tracking started */
  allTimeViews: AnalyticsReportRow[];
  /** pagePath + eventName → eventCount since contact-gate tracking started */
  allTimeGateEvents: AnalyticsReportRow[];
}

export interface DateRange {
  startDate: string;
  endDate: string;
}

export interface AnalyticsDateRanges {
  current: DateRange;
  previous: DateRange;
}

// Names given to the GA4 date ranges; they come back as the `dateRange` dimension.
export const DATE_RANGE_NAME = {
  CURRENT: "current",
  PREVIOUS: "previous",
} as const;

const STORE_PATH_PATTERN = /^\/store\/([^/]+)\/?$/;
const DAY_MS = 24 * 60 * 60 * 1000;

export const storeIdFromPath = (pagePath: string) =>
  STORE_PATH_PATTERN.exec(pagePath)?.[1] ?? null;

// YYYY-MM-DD arithmetic in UTC so the host's local timezone never shifts a day.
const toUtcTime = (isoDate: string) => Date.parse(`${isoDate}T00:00:00Z`);
const shiftDate = (isoDate: string, days: number) =>
  new Date(toUtcTime(isoDate) + days * DAY_MS).toISOString().slice(0, 10);

/**
 * `today` is the current date in the GA4 property timezone. The current period
 * ends yesterday (today's data is incomplete); the previous period is the
 * same-length window right before it.
 */
export function buildDateRanges(
  days: StoreAnalyticsRange,
  today: string,
): AnalyticsDateRanges {
  const endDate = shiftDate(today, -1);
  const startDate = shiftDate(endDate, -(days - 1));
  const previousEndDate = shiftDate(startDate, -1);
  return {
    current: { startDate, endDate },
    previous: {
      startDate: shiftDate(previousEndDate, -(days - 1)),
      endDate: previousEndDate,
    },
  };
}

const emptyCounts = (): StoreAnalyticsCounts => ({
  views: 0,
  gateViews: 0,
  gateClicks: 0,
});

const addGateEvent = (
  counts: StoreAnalyticsCounts,
  eventName: string,
  eventCount: number,
) => {
  if (eventName === CONTACT_GATE_EVENTS.VIEW) counts.gateViews += eventCount;
  if (eventName === CONTACT_GATE_EVENTS.CLICK) counts.gateClicks += eventCount;
};

export function buildStoreAnalytics({
  reports,
  days,
  dateRanges,
  generatedAt,
}: {
  reports: StoreAnalyticsReports;
  days: StoreAnalyticsRange;
  dateRanges: AnalyticsDateRanges;
  generatedAt: string;
}): StoreAnalyticsResponse {
  const stores: Record<string, StoreAnalyticsEntry> = {};

  // Paths that differ only by a trailing slash resolve to the same store and
  // are summed. activeUsers can slightly overcount in that case, which is fine
  // for an admin overview.
  const entryFor = (pagePath: string) => {
    const storeId = storeIdFromPath(pagePath);
    if (!storeId) return null;
    stores[storeId] ??= {
      allTime: emptyCounts(),
      current: { ...emptyCounts(), visitors: 0, daily: Array(days).fill(0) },
      previous: emptyCounts(),
    };
    return stores[storeId];
  };

  const periodOf = (entry: StoreAnalyticsEntry, dateRangeName: string) =>
    dateRangeName === DATE_RANGE_NAME.PREVIOUS ? entry.previous : entry.current;

  const currentStartTime = toUtcTime(dateRanges.current.startDate);

  reports.dailyViews.forEach(({ dimensions, metrics }) => {
    const entry = entryFor(dimensions.pagePath);
    if (!entry) return;
    // GA4 `date` is YYYYMMDD.
    const isoDate = `${dimensions.date.slice(0, 4)}-${dimensions.date.slice(4, 6)}-${dimensions.date.slice(6, 8)}`;
    const dayIndex = Math.round(
      (toUtcTime(isoDate) - currentStartTime) / DAY_MS,
    );
    if (dayIndex < 0 || dayIndex >= days) return;
    entry.current.daily[dayIndex] += metrics.screenPageViews ?? 0;
  });

  reports.periodViews.forEach(({ dimensions, metrics }) => {
    const entry = entryFor(dimensions.pagePath);
    if (!entry) return;
    const period = periodOf(entry, dimensions.dateRange);
    period.views += metrics.screenPageViews ?? 0;
    if (period === entry.current) {
      entry.current.visitors += metrics.activeUsers ?? 0;
    }
  });

  reports.periodGateEvents.forEach(({ dimensions, metrics }) => {
    const entry = entryFor(dimensions.pagePath);
    if (!entry) return;
    addGateEvent(
      periodOf(entry, dimensions.dateRange),
      dimensions.eventName,
      metrics.eventCount ?? 0,
    );
  });

  reports.allTimeViews.forEach(({ dimensions, metrics }) => {
    const entry = entryFor(dimensions.pagePath);
    if (!entry) return;
    entry.allTime.views += metrics.screenPageViews ?? 0;
  });

  reports.allTimeGateEvents.forEach(({ dimensions, metrics }) => {
    const entry = entryFor(dimensions.pagePath);
    if (!entry) return;
    addGateEvent(entry.allTime, dimensions.eventName, metrics.eventCount ?? 0);
  });

  return {
    range: { days, ...dateRanges.current },
    generatedAt,
    stores,
  };
}
