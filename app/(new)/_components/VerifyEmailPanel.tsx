"use client";

import { Mail } from "lucide-react";
import Button from "@/components/refactored/Button";
import type { EmailVerificationState } from "@/hooks/useEmailVerification";
import styles from "./VerifyEmailPanel.module.css";

const STEPS = ["建立帳號", "驗證信箱", "完成"];
const CURRENT_STEP = 1;

/**
 * "Check your inbox" content shared by /verify-email, the buyer club popup and
 * the listing gates. Purely presentational — state and actions come from
 * useEmailVerification() in the parent. Place it inside a Card (or the popup).
 */
export default function VerifyEmailPanel({
  verification,
  title = "請到信箱完成驗證",
  context,
  showSteps = false,
  headingAs: Heading = "h2",
  children,
}: {
  verification: EmailVerificationState;
  title?: string;
  // Why verification is needed here, e.g. 「驗證信箱後就能刊登你的店面」.
  context?: string;
  showSteps?: boolean;
  headingAs?: "h1" | "h2";
  // Extra actions under the buttons (e.g. the popup's 「先逛逛」).
  children?: React.ReactNode;
}) {
  const {
    user,
    cooldown,
    sending,
    checking,
    notYetVerified,
    error,
    resend,
    checkNow,
  } = verification;

  return (
    <div className={styles.panel}>
      {showSteps && (
        <ol className={styles.steps} aria-label="註冊進度">
          {STEPS.map((step, index) => (
            <li
              key={step}
              className={
                index < CURRENT_STEP
                  ? styles.stepDone
                  : index === CURRENT_STEP
                    ? styles.stepCurrent
                    : styles.step
              }
              aria-current={index === CURRENT_STEP ? "step" : undefined}
            >
              {index < CURRENT_STEP ? `✓ ${step}` : step}
            </li>
          ))}
        </ol>
      )}

      <div className={styles.badge} aria-hidden="true">
        <Mail size={26} strokeWidth={2} />
      </div>

      <Heading className={styles.heading}>{title}</Heading>
      {context && <p className={styles.context}>{context}</p>}

      <p className={styles.text}>
        驗證信已寄到 <strong>{user?.email}</strong>
        ，點擊信中的連結就完成註冊了。沒看到的話，請檢查垃圾郵件。
      </p>

      {notYetVerified && (
        <p className={styles.errorMsg}>
          還沒偵測到驗證完成，請確認已點擊信中的連結。
        </p>
      )}
      {error && <p className={styles.errorMsg}>{error}</p>}

      <div className={styles.actions}>
        <Button className="w-full" disabled={checking} onClick={checkNow}>
          {checking ? "確認中..." : "我已完成驗證"}
        </Button>
        <Button
          variant="ghost"
          className="w-full"
          disabled={cooldown > 0 || sending}
          onClick={resend}
        >
          {sending
            ? "寄送中..."
            : cooldown > 0
              ? `重新寄送（${cooldown} 秒）`
              : "重新寄送驗證信"}
        </Button>
      </div>

      {children}
    </div>
  );
}
