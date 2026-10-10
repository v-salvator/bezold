"use client";

import { useEffect } from "react";
import NextLink from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Check } from "lucide-react";
import Button from "@/components/refactored/Button";
import Card from "@/components/refactored/Card";
import VerifyEmailPanel from "@/app/(new)/_components/VerifyEmailPanel";
import { useEmailVerification } from "@/hooks/useEmailVerification";
import {
  RESEND_COOLDOWN_SECONDS,
  safeRedirectPath,
} from "@/lib/auth/verification";
import styles from "./VerifyEmailContent.module.css";

const REDIRECT_DELAY_MS = 3000;

export default function VerifyEmailContent() {
  const router = useRouter();
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
  const { authReady, user, isVerified } = verification;

  useEffect(() => {
    if (!isVerified) return;
    const timer = setTimeout(
      () => router.replace(redirectPath),
      REDIRECT_DELAY_MS,
    );
    return () => clearTimeout(timer);
  }, [isVerified, redirectPath, router]);

  if (!authReady) {
    return <div className={styles.spinner} aria-label="載入中" />;
  }

  // The link was opened in a browser without a session (another device, or
  // after signing out). Firebase has already verified the address by now —
  // signing in is all that is left.
  if (!user) {
    const loginParams = new URLSearchParams({ redirect: redirectPath });
    return (
      <Card className="w-full max-w-[440px]">
        <div className={styles.result}>
          <h1 className={styles.heading}>請登入以繼續</h1>
          <p className={styles.text}>
            如果你剛點了驗證信中的連結，信箱已經驗證完成，登入後就能繼續使用。
          </p>
          <NextLink
            href={`/login?${loginParams.toString()}`}
            className={styles.fullLink}
          >
            <Button className="w-full">前往登入</Button>
          </NextLink>
        </div>
      </Card>
    );
  }

  if (isVerified) {
    return (
      <Card className="w-full max-w-[440px]">
        <div className={styles.result}>
          <div className={styles.okBadge} aria-hidden="true">
            <Check size={28} strokeWidth={2.5} />
          </div>
          <h1 className={styles.heading}>信箱驗證完成</h1>
          <p className={styles.text} role="status">
            歡迎正式加入 Bezold！3 秒後會帶你回到剛剛的頁面。
          </p>
          <Button
            variant="sage"
            className="w-full"
            onClick={() => router.replace(redirectPath)}
          >
            立即前往
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-[440px]">
      <VerifyEmailPanel verification={verification} headingAs="h1" showSteps />
    </Card>
  );
}
