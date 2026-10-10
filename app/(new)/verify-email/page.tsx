import { Suspense } from "react";
import type { Metadata } from "next";
import AuthNav from "../_components/AuthNav";
import VerifyEmailContent from "./_components/VerifyEmailContent";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "驗證信箱 — Bezold 頂讓必售",
};

export default function VerifyEmailPage() {
  return (
    <>
      <AuthNav variant="verify" />
      <main className={styles.wrapper}>
        <Suspense>
          <VerifyEmailContent />
        </Suspense>
      </main>
    </>
  );
}
