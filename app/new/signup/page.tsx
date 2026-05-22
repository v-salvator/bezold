import AuthNav from "../_components/AuthNav";
import SignupForm from "./_components/SignupForm";
import styles from "./page.module.css";

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
