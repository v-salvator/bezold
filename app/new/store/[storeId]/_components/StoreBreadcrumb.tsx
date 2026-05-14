import type { Store } from "@/types";
import styles from "./StoreBreadcrumb.module.css";

export default function StoreBreadcrumb({ store }: { store: Store }) {
  const { storeName } = store;

  return (
    <div className={styles.crumbs}>
      <div className={styles.trail}>
        <a href="/new">首頁</a>
        {" / "}
        <a href="/new/store-list">我要找店</a>
        {" / "}
        <b>{storeName}</b>
      </div>
      <div className={styles.actions}>
        <span>♡ 收藏物件</span>
        <span>📤 分享</span>
        <span>🖨 列印</span>
        <span className={styles.report}>⋯ 檢舉</span>
      </div>
    </div>
  );
}
