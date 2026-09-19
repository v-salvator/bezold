"use client";

import { useEffect, useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/firebase/client";
import Button from "@/components/refactored/Button";
import FormField from "@/components/refactored/FormField";
import { maskEmail } from "@/utils/string";
import styles from "./ForgotPasswordPanel.module.css";

const RESEND_COOLDOWN_SECONDS = 60;

const RESET_ERRORS: Record<string, string> = {
  "auth/invalid-email": "電子信箱格式不正確",
  "auth/missing-email": "請輸入電子信箱",
  "auth/too-many-requests": "寄送次數過多，請稍後再試",
  "auth/network-request-failed": "網路連線異常，請再試一次",
};

export default function ForgotPasswordPanel({
  email,
  onEmailChange,
  onBack,
}: {
  email: string;
  onEmailChange: (email: string) => void;
  onBack: () => void;
}) {
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((seconds) => seconds - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  async function sendResetEmail() {
    const trimmedEmail = email.trim();
    setError(null);
    setLoading(true);
    try {
      auth.languageCode = "zh-TW";
      await sendPasswordResetEmail(auth, trimmedEmail, {
        url: `${window.location.origin}/login?reset=done`,
      });
      setSentTo(trimmedEmail);
      setCooldown(RESEND_COOLDOWN_SECONDS);
    } catch (err) {
      const code = (err as { code?: string }).code ?? "";
      setError(RESET_ERRORS[code] ?? "發生未知錯誤，請再試一次");
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    sendResetEmail();
  }

  function handleUseOtherEmail() {
    setSentTo(null);
    setError(null);
  }

  if (sentTo) {
    return (
      <div className={styles.sent}>
        <div className={styles.checkBadge} aria-hidden="true">
          ✓
        </div>
        <h1 className={styles.heading}>請查看信箱</h1>
        <p className={styles.subheading}>
          若 <strong>{maskEmail(sentTo)}</strong>{" "}
          已註冊，您將在幾分鐘內收到重設密碼的連結。沒看到的話，請檢查垃圾郵件。
        </p>
        {error && <p className={styles.errorMsg}>{error}</p>}
        <Button
          variant="ghost"
          className="w-full"
          disabled={cooldown > 0 || loading}
          onClick={sendResetEmail}
        >
          {loading
            ? "寄送中..."
            : cooldown > 0
              ? `重新寄送（${cooldown} 秒）`
              : "重新寄送"}
        </Button>
        <div className="flex gap-4">
          <button className={styles.textBtn} type="button" onClick={onBack}>
            ← 返回登入
          </button>
          <button
            className={styles.textBtn}
            type="button"
            onClick={handleUseOtherEmail}
          >
            換一個信箱
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <button className={styles.textBtn} type="button" onClick={onBack}>
        ← 返回登入
      </button>
      <div className={styles.headingBlock}>
        <h1 className={styles.heading}>
          重設 <strong>密碼</strong>
        </h1>
        <p className={styles.subheading}>
          輸入註冊時的電子信箱，我們會寄一封重設密碼的連結給您。
        </p>
      </div>
      <form className={styles.form} onSubmit={handleSubmit}>
        <FormField
          id="reset-email"
          label="電子信箱"
          type="email"
          placeholder="your@email.com"
          autoComplete="email"
          value={email}
          onChange={(event) => onEmailChange(event.target.value)}
        />
        {error && <p className={styles.errorMsg}>{error}</p>}
        <Button type="submit" className="w-full mt-2" disabled={loading}>
          {loading ? "寄送中..." : "寄送重設信"}
        </Button>
      </form>
    </>
  );
}
