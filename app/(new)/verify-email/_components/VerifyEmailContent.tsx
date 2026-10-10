"use client";

import { useSearchParams } from "next/navigation";
import Card from "@/components/refactored/Card";
import VerifyEmailPanel from "@/app/(new)/_components/VerifyEmailPanel";
import { useEmailVerification } from "@/hooks/useEmailVerification";
import {
  RESEND_COOLDOWN_SECONDS,
  safeRedirectPath,
} from "@/lib/auth/verification";
import styles from "./VerifyEmailContent.module.css";

export default function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const redirectPath = safeRedirectPath(searchParams.get("redirect"));
  // ?sent=1 means an email went out moments ago (right after signup), so the
  // resend button starts cooling down instead of inviting an instant resend.
  const justSent = searchParams.get("sent") === "1";
  const verification = useEmailVerification({
    source: "verify_email_page",
    redirectPath,
    initialCooldown: justSent ? RESEND_COOLDOWN_SECONDS : 0,
  });
  const { authReady, user } = verification;

  if (!authReady || !user) {
    return <div className={styles.spinner} aria-label="載入中" />;
  }

  return (
    <Card className="w-full max-w-[440px]">
      <VerifyEmailPanel verification={verification} headingAs="h1" showSteps />
    </Card>
  );
}
