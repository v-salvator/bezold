"use client";
import { useCallback, useEffect, useState } from "react";
import { authedFetch } from "@/lib/authedFetch";
import type { StoreAnalyticsRange, StoreAnalyticsResponse } from "@/types";
import useAdminAuth from "./useAdminAuth";

/**
 * Loads GET /api/admin/store-analytics for the signed-in admin. The previous
 * range's data stays in place while a new range loads, so tables don't flash.
 */
export default function useStoreAnalytics(range: StoreAnalyticsRange) {
  const { idToken } = useAdminAuth();
  const [data, setData] = useState<StoreAnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadCount, setReloadCount] = useState(0);

  useEffect(() => {
    if (!idToken) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    authedFetch(idToken, `/api/admin/store-analytics?range=${range}`)
      .then(async (response) => {
        const body = await response.json();
        if (!response.ok)
          throw new Error(body.error ?? "Analytics unavailable");
        return body as StoreAnalyticsResponse;
      })
      .then((analytics) => {
        if (!cancelled) setData(analytics);
      })
      .catch((fetchError: Error) => {
        if (cancelled) return;
        setData(null);
        setError(fetchError.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [idToken, range, reloadCount]);

  const refetch = useCallback(
    () => setReloadCount((previous) => previous + 1),
    [],
  );

  return { data, loading, error, refetch };
}
