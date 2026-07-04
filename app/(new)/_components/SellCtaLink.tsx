"use client";

import NextLink from "next/link";
import { trackEvent } from "@/firebase/client";

/**
 * Link for the "free listing" CTAs that fires a `sell_cta_click` analytics
 * event before navigating. Uses NextLink for client-side navigation (no full
 * unload), so the async event reliably fires. Use for plain-link CTAs (including
 * inside server components); button-based CTAs call trackEvent from their
 * onClick handler.
 */
export default function SellCtaLink({
  ctaLocation,
  href = "/sell",
  className,
  children,
}: {
  ctaLocation: string;
  href?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <NextLink
      href={href}
      className={className}
      onClick={() =>
        trackEvent("sell_cta_click", { cta_location: ctaLocation })
      }
    >
      {children}
    </NextLink>
  );
}
