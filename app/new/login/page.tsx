import { Suspense } from "react";
import AuthNav from "../_components/AuthNav";
import LoginForm from "./_components/LoginForm";
import styles from "./page.module.css";

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
