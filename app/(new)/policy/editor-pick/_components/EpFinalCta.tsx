import Link from "next/link";
import styles from "./EpFinalCta.module.css";

export default function EpFinalCta() {
  return (
    <section className={styles.band}>
      <h2 className={styles.title}>
        立即完善刊登資料，讓您的店被更多
        <br />
        適合的買家看見！
      </h2>
      <Link href="/my-listings" className={styles.btn}>
        前往我的刊登 →
      </Link>
    </section>
  );
}
