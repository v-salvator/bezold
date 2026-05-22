import AuthNav from "../_components/AuthNav";
import Button from "@/components/refactored/Button";
import Card from "@/components/refactored/Card";
import FormField from "@/components/refactored/FormField";
import styles from "./page.module.css";

export default function SignupPage() {
  return (
    <>
      <AuthNav variant="signup" />
      <main className={styles.wrapper}>
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
            />
            <FormField
              id="password"
              label="密碼"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
            />

            <div className={styles.strengthRow}>
              {[0, 1, 2, 3].map((i) => (
                <span key={i} className={styles.strengthSegment} />
              ))}
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
      </main>
    </>
  );
}
