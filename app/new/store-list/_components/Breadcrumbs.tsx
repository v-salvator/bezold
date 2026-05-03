import styles from "./Breadcrumbs.module.css";

export default function Breadcrumbs() {
  return (
    <div className={styles.crumbs}>
      <div>
        <div className={styles.trail}>
          <a href="/new">首頁</a> / <a href="/new/store-list">我要找店</a> /
          台北市 · 餐飲
        </div>
        <h2 className={styles.title}>
          台北市 · 餐飲店面 <em>共 412 間</em>
        </h2>
      </div>
      <div className={styles.stat}>
        <b className={styles.statNum}>136</b>
        本月新上架
      </div>
    </div>
  );
}
