import type { Store } from "@/types";
import ShareButton from "./ShareButton";
import styles from "./StoreBreadcrumb.module.css";

export default function StoreBreadcrumb({ store }: { store: Store }) {
  const { storeName } = store;

  return (
    <div className={styles.crumbs}>
      <div className={styles.trail}>
        <a href="/">首頁</a>
        {" / "}
        <a href="/store-list">我要找店</a>
        {" / "}
        <b>{storeName}</b>
      </div>
      <div className={styles.actions}>
        <ShareButton />
      </div>
    </div>
  );
}
