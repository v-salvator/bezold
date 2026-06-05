"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/firebase/client";
import Link from "next/link";
import Button from "@/components/refactored/Button";
import Card from "@/components/refactored/Card";
import FormField from "@/components/refactored/FormField";
import EyeIcon from "@/app/(new)/_components/EyeIcon";
import styles from "./LoginForm.module.css";

const AUTH_ERRORS: Record<string, string> = {
  "auth/invalid-credential": "電子信箱或密碼錯誤",
  "auth/user-not-found": "電子信箱或密碼錯誤",
  "auth/wrong-password": "電子信箱或密碼錯誤",
  "auth/invalid-email": "電子信箱格式不正確",
  "auth/too-many-requests": "嘗試次數過多，請稍後再試",
  "auth/user-disabled": "此帳號已被停用",
};

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get("redirect") ?? "/store-list";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push(redirectPath);
    } catch (err) {
      const code = (err as { code?: string }).code ?? "";
      setError(AUTH_ERRORS[code] ?? "發生未知錯誤，請再試一次");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-[400px]">
      <div className={styles.headingBlock}>
        <h1 className={styles.heading}>
          登入 <strong>Bezold</strong> 會員
        </h1>
        <p className={styles.subheading}>刊登店面，開始您的買賣旅程</p>
      </div>
      <form className={styles.form} onSubmit={handleSubmit}>
        <FormField
          id="email"
          label="電子信箱"
          type="email"
          placeholder="your@email.com"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <FormField
          id="password"
          label="密碼"
          type={showPassword ? "text" : "password"}
          placeholder="••••••••"
          autoComplete="current-password"
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
        <div className={styles.checkboxRow}>
          <input className={styles.checkbox} id="remember" type="checkbox" />
          <label htmlFor="remember">記住我</label>
        </div>
        {error && <p className={styles.errorMsg}>{error}</p>}
        <Button type="submit" className="w-full mt-2" disabled={loading}>
          {loading ? "登入中..." : "登入"}
        </Button>
      </form>
      <p className={styles.registerHint}>
        還不是會員？{" "}
        <Link className={styles.registerLink} href="/signup">
          立即免費註冊
        </Link>
      </p>
    </Card>
  );
}
