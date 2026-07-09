import Link from "next/link";
import styles from "./Cta.module.css";

/**
 * Closing call-to-action driving readers into the marketplace funnel.
 */
export default function Cta({
  title = "準備好開始了嗎？",
  text = "在 Bezold 瀏覽正在頂讓的店面，或免費刊登你的店。",
}: {
  title?: string;
  text?: string;
}) {
  return (
    <div className={styles.wrap}>
      <h2 className={styles.title}>{title}</h2>
      <p className={styles.text}>{text}</p>
      <div className={styles.actions}>
        <Link href="/store-list" className={styles.browse}>
          瀏覽店面
        </Link>
        <Link href="/sell" className={styles.sell}>
          我要頂出 →
        </Link>
      </div>
    </div>
  );
}
