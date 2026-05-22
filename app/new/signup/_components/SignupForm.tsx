"use client";

import { useState } from "react";
import Button from "@/components/refactored/Button";
import Card from "@/components/refactored/Card";
import FormField from "@/components/refactored/FormField";
import EyeIcon from "@/app/new/_components/EyeIcon";
import styles from "./SignupForm.module.css";

function getStrength(password: string): number {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

const strengthColors = [
  "",
  "var(--accent)",
  "var(--accent-3)",
  "var(--accent-3)",
  "var(--accent-2)",
];
const strengthLabels = ["", "弱", "普通", "良好", "強"];

export default function SignupForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);

  const strength = getStrength(password);
  const emailHint =
    emailTouched && email.length > 0 && !isValidEmail(email)
      ? "請輸入有效的電子信箱格式"
      : undefined;

  return (
    <Card className="w-full max-w-[440px]">
      <h1 className={styles.heading}>
        加入<strong>Bezold</strong>
      </h1>
      <form className={styles.form}>
        <FormField id="name" label="姓名" placeholder="請輸入姓名" />
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
          <input className={styles.checkbox} id="terms" type="checkbox" />
          <label htmlFor="terms">
            我同意{" "}
            <a className={styles.termsLink} href="#">
              服務條款
            </a>{" "}
            與{" "}
            <a className={styles.termsLink} href="#">
              隱私政策
            </a>
          </label>
        </div>

        <Button type="submit" className="w-full mt-2">
          建立帳號
        </Button>

        <p className={styles.lineCta}>
          不想註冊？想要專業代刊嗎？{" "}
          <a
            className={styles.lineLink}
            href="https://line.me/ti/p/~@ding-rang"
            target="_blank"
            rel="noopener noreferrer"
          >
            聯絡 LINE
          </a>
        </p>
      </form>
    </Card>
  );
}
