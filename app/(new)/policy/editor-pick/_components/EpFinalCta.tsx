import Link from "next/link";
import Section from "../../../_components/Section";
import styles from "./EpFinalCta.module.css";

export default function EpFinalCta() {
  return (
    <Section variant="alt">
      <div className={styles.band}>
        <div className={styles.copy}>
          <span className={styles.eyebrow}>準備好了嗎？</span>
          <h2 className={styles.title}>
            立即完善刊登資料，讓您的店被更多適合的買家看見！
          </h2>
        </div>
        <Link href="/my-listings" className={styles.btn}>
          前往我的刊登 →
        </Link>
      </div>
    </Section>
  );
}
