import { unstable_cache } from "next/cache";
import type { protos } from "@google-analytics/data";
import {
  ANALYTICS_CACHE_SECONDS,
  ANALYTICS_TIMEZONE,
  CONTACT_GATE_EVENTS,
  CONTACT_GATE_TRACKING_START,
  PAGE_VIEW_TRACKING_START,
  SELLER_CONTACT_EVENTS,
} from "@/constant/storeAnalytics";
import type { StoreAnalyticsRange, StoreAnalyticsResponse } from "@/types";
import { getGa4Client } from "./ga4Client";
import {
  buildDateRanges,
  buildStoreAnalytics,
  DATE_RANGE_NAME,
  type AnalyticsReportRow,
} from "./storeAnalyticsTransform";

type ReportRequest = protos.google.analytics.data.v1beta.IRunReportRequest;
type ReportResponse = protos.google.analytics.data.v1beta.IRunReportResponse;
type FilterExpression = protos.google.analytics.data.v1beta.IFilterExpression;

// Well above stores × days for a 90-day daily report.
const ROW_LIMIT = 100000;

// en-CA formats as YYYY-MM-DD.
const todayInPropertyTimezone = () =>
  new Intl.DateTimeFormat("en-CA", { timeZone: ANALYTICS_TIMEZONE }).format(
    new Date(),
  );

// localhost in dev, www.bezold.com.tw in production — keeps the two apart.
const analyticsHostname = () =>
  new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").hostname;

const storePageFilter = (
  hostname: string,
  ...extraFilters: FilterExpression[]
): FilterExpression => ({
  andGroup: {
    expressions: [
      {
        filter: {
          fieldName: "hostName",
          stringFilter: { matchType: "EXACT", value: hostname },
        },
      },
      {
        filter: {
          fieldName: "pagePath",
          stringFilter: { matchType: "BEGINS_WITH", value: "/store/" },
        },
      },
      ...extraFilters,
    ],
  },
});

// Locked-gate events (logged-out visitors) and contact-button taps
// (signed-in members) share one report per window.
const contactEventFilter: FilterExpression = {
  filter: {
    fieldName: "eventName",
    inListFilter: {
      values: [
        CONTACT_GATE_EVENTS.VIEW,
        CONTACT_GATE_EVENTS.CLICK,
        ...Object.values(SELLER_CONTACT_EVENTS),
      ],
    },
  },
};

// GA4 rows are positional; key them by header name for the transform. With
// several date ranges GA4 appends a `dateRange` dimension value to each row.
const toReportRows = (response: ReportResponse): AnalyticsReportRow[] => {
  const dimensionNames = (response.dimensionHeaders ?? []).map(
    (header) => header.name ?? "",
  );
  const metricNames = (response.metricHeaders ?? []).map(
    (header) => header.name ?? "",
  );
  return (response.rows ?? []).map((row) => {
    const dimensions: Record<string, string> = {};
    (row.dimensionValues ?? []).forEach((dimensionValue, index) => {
      dimensions[dimensionNames[index] ?? "dateRange"] =
        dimensionValue.value ?? "";
    });
    const metrics: Record<string, number> = {};
    (row.metricValues ?? []).forEach((metricValue, index) => {
      metrics[metricNames[index]] = Number(metricValue.value ?? 0);
    });
    return { dimensions, metrics };
  });
};

async function fetchStoreAnalytics(
  days: StoreAnalyticsRange,
): Promise<StoreAnalyticsResponse> {
  const dateRanges = buildDateRanges(days, todayInPropertyTimezone());
  const yesterday = dateRanges.current.endDate;
  const hostname = analyticsHostname();
  const periodDateRanges = [
    { ...dateRanges.current, name: DATE_RANGE_NAME.CURRENT },
    { ...dateRanges.previous, name: DATE_RANGE_NAME.PREVIOUS },
  ];

  // Order matters: responses come back in the same order.
  const requests: ReportRequest[] = [
    {
      dateRanges: [dateRanges.current],
      dimensions: [{ name: "pagePath" }, { name: "date" }],
      metrics: [{ name: "screenPageViews" }],
      dimensionFilter: storePageFilter(hostname),
    },
    {
      dateRanges: periodDateRanges,
      dimensions: [{ name: "pagePath" }],
      metrics: [{ name: "screenPageViews" }, { name: "activeUsers" }],
      dimensionFilter: storePageFilter(hostname),
    },
    {
      dateRanges: periodDateRanges,
      dimensions: [{ name: "pagePath" }, { name: "eventName" }],
      metrics: [{ name: "eventCount" }],
      dimensionFilter: storePageFilter(hostname, contactEventFilter),
    },
    {
      dateRanges: [{ startDate: PAGE_VIEW_TRACKING_START, endDate: yesterday }],
      dimensions: [{ name: "pagePath" }],
      metrics: [{ name: "screenPageViews" }],
      dimensionFilter: storePageFilter(hostname),
    },
    {
      dateRanges: [
        { startDate: CONTACT_GATE_TRACKING_START, endDate: yesterday },
      ],
      dimensions: [{ name: "pagePath" }, { name: "eventName" }],
      metrics: [{ name: "eventCount" }],
      dimensionFilter: storePageFilter(hostname, contactEventFilter),
    },
  ];

  const [response] = await getGa4Client().batchRunReports({
    property: `properties/${process.env.GA4_PROPERTY_ID}`,
    requests: requests.map((request) => ({ ...request, limit: ROW_LIMIT })),
  });
  const [
    dailyViews,
    periodViews,
    periodContactEvents,
    allTimeViews,
    allTimeContactEvents,
  ] = (response.reports ?? []).map(toReportRows);

  return buildStoreAnalytics({
    reports: {
      dailyViews: dailyViews ?? [],
      periodViews: periodViews ?? [],
      periodContactEvents: periodContactEvents ?? [],
      allTimeViews: allTimeViews ?? [],
      allTimeContactEvents: allTimeContactEvents ?? [],
    },
    days,
    dateRanges,
    generatedAt: new Date().toISOString(),
  });
}

// Cached per range (unstable_cache keys on the arguments). Thrown errors are
// not cached, so a GA4 outage recovers on the next request.
export const getCachedStoreAnalytics = unstable_cache(
  fetchStoreAnalytics,
  ["store-analytics"],
  { revalidate: ANALYTICS_CACHE_SECONDS },
);
