"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Button from "@/components/refactored/Button";
import Card from "@/components/refactored/Card";
import FormField from "@/components/refactored/FormField";
import EyeIcon from "@/app/(new)/_components/EyeIcon";
import {
  signup,
  AUTH_ERRORS,
  getStrength,
  isValidEmail,
  strengthColors,
  strengthLabels,
} from "@/lib/auth/signup";
import styles from "./SignupForm.module.css";

export default function SignupForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [terms, setTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const strength = getStrength(password);
  const emailHint =
    emailTouched && email.length > 0 && !isValidEmail(email)
      ? "請輸入有效的電子信箱格式"
      : undefined;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!terms) {
      setError("請先同意服務條款與隱私政策");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await signup({ name, email, password });
      router.push("/store-list");
    } catch (err) {
      const code = (err as { code?: string }).code ?? "";
      setError(AUTH_ERRORS[code] ?? "發生未知錯誤，請再試一次");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative w-full max-w-[440px]">
      {loading && (
        <div className={styles.loadingOverlay}>
          <div className={styles.spinner} />
          <p className={styles.loadingText}>建立帳號中，請稍候...</p>
        </div>
      )}
      <Card className="w-full">
        <h1 className={styles.heading}>
          加入<strong>Bezold</strong>
        </h1>
        <form className={styles.form} onSubmit={handleSubmit}>
          <FormField
            id="name"
            label="姓名"
            placeholder="請輸入姓名"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          <FormField
            id="email"
            label="電子信箱"
            type="email"
            placeholder="your@email.com"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            onBlur={() => setEmailTouched(true)}
            hint={emailHint}
          />
          <FormField
            id="password"
            label="密碼"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            suffix={
              <button
                className={styles.eyeBtn}
                type="button"
                aria-label={showPassword ? "隱藏密碼" : "顯示密碼"}
                onClick={() => setShowPassword((v) => !v)}
              >
                <EyeIcon visible={showPassword} />
              </button>
            }
          />

          <div className={styles.strengthRow}>
            <div className={styles.strengthBar}>
              {[0, 1, 2, 3].map((index) => (
                <span
                  key={index}
                  className={styles.strengthSegment}
                  style={{
                    background:
                      index < strength ? strengthColors[strength] : undefined,
                  }}
                />
              ))}
            </div>
            {password.length > 0 && (
              <span
                className={styles.strengthLabel}
                style={{ color: strengthColors[strength] }}
              >
                {strengthLabels[strength]}
              </span>
            )}
          </div>

          <div className={styles.checkboxRow}>
            <input
              className={styles.checkbox}
              id="terms"
              type="checkbox"
              checked={terms}
              onChange={(event) => setTerms(event.target.checked)}
            />
            <label htmlFor="terms">
              我同意{" "}
              <Link className={styles.termsLink} href="/terms">
                服務條款
              </Link>{" "}
              與{" "}
              <Link className={styles.termsLink} href="/privacy">
                隱私政策
              </Link>
            </label>
          </div>

          {error && <p className={styles.errorMsg}>{error}</p>}

          <Button type="submit" className="w-full mt-2" disabled={loading}>
            {loading ? "建立中..." : "建立帳號"}
          </Button>

          <p className={styles.lineCta}>
            不想註冊？想要專業代刊嗎？{" "}
            <a
              className={styles.lineLink}
              href="https://line.me/ti/p/~bezoldtw"
              target="_blank"
              rel="noopener noreferrer"
            >
              聯絡 LINE
            </a>
          </p>
        </form>
        <p className={styles.loginHint}>
          已經有帳號？{" "}
          <Link className={styles.loginLink} href="/login">
            由此登入
          </Link>
        </p>
      </Card>
    </div>
  );
}
