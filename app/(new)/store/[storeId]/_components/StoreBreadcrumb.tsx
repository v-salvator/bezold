import type { Store } from "@/types";
import { isDigitalAsset } from "@/utils/store";
import ShareButton from "./ShareButton";
import styles from "./StoreBreadcrumb.module.css";

export default function StoreBreadcrumb({ store }: { store: Store }) {
  const { storeName } = store;

  return (
    <div className={styles.crumbs}>
      <div className={styles.trail}>
        <a href="/">首頁</a>
        {" / "}
        {isDigitalAsset(store) ? (
          <a href="/digital-assets">數位資產</a>
        ) : (
          <a href="/store-list">我要找店</a>
        )}
        {" / "}
        <b>{storeName}</b>
      </div>
      <div className={styles.actions}>
        <ShareButton />
      </div>
    </div>
  );
}
