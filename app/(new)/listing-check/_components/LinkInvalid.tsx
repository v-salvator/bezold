import NextLink from "next/link";
import styles from "./ListingCheck.module.css";

const LOGIN_TO_MY_LISTINGS = `/login?${new URLSearchParams({
  redirect: "/my-listings",
}).toString()}`;

// * one message for every failure (unknown, used, expired, store no longer
// * approved) — it reveals nothing about which one it was
export default function LinkInvalid() {
  return (
    <div className={styles.panel}>
      <div className={styles.markGray} aria-hidden>
        !
      </div>
      <h1 className={styles.title}>此連結已失效</h1>
      <p className={styles.lead}>
        連結可能已經使用過、超過 30
        天，或刊登狀態已經改變。您可以登入後在「我的刊登管理」查看和更新刊登。
      </p>
      <div className={styles.actions}>
        <NextLink href={LOGIN_TO_MY_LISTINGS} className={styles.primaryLink}>
          登入後到我的刊登管理
        </NextLink>
      </div>
      <p className={styles.fine}>有問題嗎？LINE 客服：bezoldtw</p>
    </div>
  );
}
