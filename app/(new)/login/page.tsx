import type { Metadata } from "next";
import { Suspense } from "react";
import AuthNav from "../_components/AuthNav";
import LoginForm from "./_components/LoginForm";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "登入",
  robots: { index: false, follow: true },
};

export default function LoginPage() {
  return (
    <>
      <AuthNav variant="login" />
      <main className={styles.wrapper}>
        <Suspense>
          <LoginForm />
        </Suspense>
      </main>
    </>
  );
}
