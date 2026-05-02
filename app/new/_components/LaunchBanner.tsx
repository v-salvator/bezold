import styles from "./LaunchBanner.module.css";

export default function LaunchBanner() {
  return (
    <div className={styles.launch}>
      <span className={styles.tag}>EARLY BIRD</span>
      <b>開站慶 · 前 3 個月免費刊登</b>
      <span className={styles.soft}>— 早鳥用戶享連續優惠 ·</span>
      <a>了解 →</a>
    </div>
  );
}
