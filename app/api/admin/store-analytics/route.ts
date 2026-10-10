import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken } from "@/lib/verifyAdminToken";
import { getCachedStoreAnalytics } from "@/lib/analytics/fetchStoreAnalytics";
import { DEFAULT_RANGE, RANGE_OPTIONS } from "@/constant/storeAnalytics";
import type { StoreAnalyticsRange } from "@/types";

export async function GET(req: NextRequest) {
  const { error } = await verifyAdminToken(req);
  if (error) return error;

  const range = Number(
    new URL(req.url).searchParams.get("range") ?? DEFAULT_RANGE,
  );
  if (!RANGE_OPTIONS.includes(range as StoreAnalyticsRange)) {
    return NextResponse.json({ error: "Invalid range" }, { status: 400 });
  }
  if (!process.env.GA4_PROPERTY_ID) {
    return NextResponse.json(
      { error: "Analytics not configured" },
      { status: 503 },
    );
  }

  try {
    const analytics = await getCachedStoreAnalytics(
      range as StoreAnalyticsRange,
    );
    return NextResponse.json(analytics);
  } catch (fetchError) {
    console.error("[store-analytics] GA4 request failed", fetchError);
    return NextResponse.json(
      { error: "Analytics unavailable" },
      { status: 502 },
    );
  }
}
