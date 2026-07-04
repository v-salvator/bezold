"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { logEvent } from "firebase/analytics";
import { getAnalyticsClient } from "@/firebase/client";

// Route prefixes that should never be tracked (admin dashboard, etc.).
const UNTRACKED_PREFIXES = ["/admin"];

const isUntracked = (pathname: string) =>
  UNTRACKED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

/**
 * Fires a GA4 `page_view` on every client-side route change. The App Router does
 * not emit page views automatically, so this must be mounted once in the root
 * layout (inside a <Suspense> boundary, since useSearchParams opts into CSR).
 *
 * Admin routes are excluded — we never send analytics for them.
 */
export default function AnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (isUntracked(pathname)) return;

    const query = searchParams.toString();
    const pagePath = query ? `${pathname}?${query}` : pathname;

    getAnalyticsClient().then((client) => {
      if (!client) return;
      logEvent(client, "page_view", {
        page_path: pagePath,
        page_location: window.location.href,
        page_title: document.title,
      });
    });
  }, [pathname, searchParams]);

  return null;
}
