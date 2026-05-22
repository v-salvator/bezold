import AuthNav from "../_components/AuthNav";
import Button from "@/components/refactored/Button";
import Card from "@/components/refactored/Card";
import FormField from "@/components/refactored/FormField";
import styles from "./page.module.css";

export default function LoginPage() {
  return (
    <>
      <AuthNav variant="login" />
      <main className={styles.wrapper}>
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
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
            />
            <div className={styles.checkboxRow}>
              <input
                className={styles.checkbox}
                id="remember"
                type="checkbox"
              />
              <label htmlFor="remember">記住我</label>
            </div>
            <Button type="submit" className="w-full mt-2">
              登入
            </Button>
          </form>
        </Card>
      </main>
    </>
  );
}
