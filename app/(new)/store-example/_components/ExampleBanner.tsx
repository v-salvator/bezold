import styles from "./ExampleBanner.module.css";

export default function ExampleBanner() {
  return (
    <div className={styles.banner}>
      <span>這是示範頁面，非真實物件</span>
      <a href="/sell" className={styles.cta}>
        立即免費刊登 →
      </a>
    </div>
  );
}
