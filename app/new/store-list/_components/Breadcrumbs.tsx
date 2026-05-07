import styles from "./Breadcrumbs.module.css";

export default function Breadcrumbs({ count }: { count: number }) {
  return (
    <div className={styles.crumbs}>
      <div>
        <div className={styles.trail}>
          <a href="/new">首頁</a> / <a href="/new/store-list">我要找店</a>
        </div>
        <h2 className={styles.title}>
          我要找店 <em>共 {count} 間</em>
        </h2>
      </div>
    </div>
  );
}
