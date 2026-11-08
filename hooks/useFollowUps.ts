"use client";
import { useCallback, useEffect, useState } from "react";
import { authedFetch } from "@/lib/authedFetch";
import type { FollowUpSummary } from "@/types";
import useAdminAuth from "./useAdminAuth";

const EMPTY_SUMMARY: FollowUpSummary = {
  sentCount: 0,
  lastSentTime: null,
  lastAnswer: null,
  lastAnswerTime: null,
  paused: false,
  lastError: "",
};

/**
 * Loads GET /api/admin/follow-ups (keyed by storeId) and drives the
 * 「自動寄送追蹤信」 switch. A store with no follow-up doc yet reads as never
 * emailed and not paused.
 */
export default function useFollowUps() {
  const { idToken } = useAdminAuth();
  const [followUps, setFollowUps] = useState<Record<
    string,
    FollowUpSummary
  > | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!idToken) return;
    let cancelled = false;
    setLoading(true);
    authedFetch(idToken, "/api/admin/follow-ups")
      .then(async (response) => {
        if (!response.ok) throw new Error(`follow-ups ${response.status}`);
        return (await response.json()).followUps as Record<
          string,
          FollowUpSummary
        >;
      })
      .then((summaries) => {
        if (!cancelled) setFollowUps(summaries);
      })
      .catch(() => {
        if (!cancelled) setFollowUps(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [idToken]);

  const followUpOf = useCallback(
    (storeId: string) => followUps?.[storeId] ?? EMPTY_SUMMARY,
    [followUps],
  );

  // * throws on failure so the caller can show an error
  const setPaused = useCallback(
    async (storeId: string, paused: boolean) => {
      if (!idToken) throw new Error("not signed in");
      const response = await authedFetch(
        idToken,
        `/api/admin/follow-ups/${storeId}`,
        {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ paused }),
        },
      );
      if (!response.ok) throw new Error(`pause ${response.status}`);
      setFollowUps((previous) => ({
        ...previous,
        [storeId]: { ...(previous?.[storeId] ?? EMPTY_SUMMARY), paused },
      }));
    },
    [idToken],
  );

  return { loaded: followUps !== null, loading, followUpOf, setPaused };
}
