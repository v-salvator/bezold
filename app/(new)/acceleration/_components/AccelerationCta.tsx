"use client";

import { trackEvent } from "@/firebase/client";
import { ACCELERATION_FORM_URL } from "@/constant/acceleration";
import Button from "@/components/refactored/Button";
import type { ButtonVariant } from "@/components/refactored/Button";

/**
 * Shared CTA for the acceleration page + banner. Every entry point opens the
 * same Google Form in a new tab and logs which button was clicked via `plan`.
 */
export default function AccelerationCta({
  plan,
  children,
  variant = "default",
  className,
}: {
  plan: "hero" | "basic" | "hot" | "urgent" | "banner";
  children: React.ReactNode;
  variant?: ButtonVariant;
  className?: string;
}) {
  function handleClick() {
    trackEvent("acceleration_cta_click", { plan });
    window.open(ACCELERATION_FORM_URL, "_blank", "noopener,noreferrer");
  }

  return (
    <Button variant={variant} className={className} onClick={handleClick}>
      {children}
    </Button>
  );
}
