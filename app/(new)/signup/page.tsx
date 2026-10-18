import type { Metadata } from "next";
import AuthNav from "../_components/AuthNav";
import SignupForm from "./_components/SignupForm";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "加入會員",
  robots: { index: false, follow: true },
};

export default function SignupPage() {
  return (
    <>
      <AuthNav variant="signup" />
      <main className={styles.wrapper}>
        <SignupForm />
      </main>
    </>
  );
}
