"use client";

import NextLink from "next/link";
import { trackEvent } from "@/firebase/client";

/**
 * A link that fires a GA (Firebase Analytics) event before navigating, then
 * hands off to NextLink for client-side navigation so the async event reliably
 * flushes. Safe to render from server components — only this leaf is a client
 * component. Generalises the older SellCtaLink pattern for any CTA.
 */
export default function TrackedLink({
  event,
  params,
  href,
  className,
  target,
  rel,
  children,
}: {
  event: string;
  params?: Record<string, unknown>;
  href: string;
  className?: string;
  target?: string;
  rel?: string;
  children: React.ReactNode;
}) {
  return (
    <NextLink
      href={href}
      className={className}
      target={target}
      rel={rel}
      onClick={() => trackEvent(event, params)}
    >
      {children}
    </NextLink>
  );
}
