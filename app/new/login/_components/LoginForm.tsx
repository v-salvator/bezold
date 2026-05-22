"use client";

import { useState } from "react";
import Button from "@/components/refactored/Button";
import Card from "@/components/refactored/Card";
import FormField from "@/components/refactored/FormField";
import EyeIcon from "@/app/new/_components/EyeIcon";
import styles from "./LoginForm.module.css";

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <Card className="w-full max-w-[400px]">
      <h1 className={styles.heading}>
        歡迎<strong>回來</strong>
      </h1>
      <form className={styles.form}>
        <FormField
          id="email"
          label="電子信箱"
          type="email"
          placeholder="your@email.com"
          autoComplete="email"
        />
        <FormField
          id="password"
          label="密碼"
          type={showPassword ? "text" : "password"}
          placeholder="••••••••"
          autoComplete="current-password"
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
        <div className={styles.checkboxRow}>
          <input className={styles.checkbox} id="remember" type="checkbox" />
          <label htmlFor="remember">記住我</label>
        </div>
        <Button type="submit" className="w-full mt-2">
          登入
        </Button>
      </form>
    </Card>
  );
}
