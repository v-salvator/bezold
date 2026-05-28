import Link from "next/link";
import Section from "../../_components/Section";
import styles from "./FaqCta.module.css";

export default function FaqCta() {
  return (
    <Section variant="alt">
      <div className={styles.wrap}>
        <h3 className={styles.title}>找不到你要的答案？</h3>
        <p className={styles.sub}>
          LINE 客服 <b>@ding-rang</b> · 09:00 – 21:00
        </p>
        <div className={styles.actions}>
          <a
            href="https://line.me/R/ti/p/@ding-rang"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.line}
          >
            LINE 客服
          </a>
          <Link href="/store-list" className={styles.browse}>
            瀏覽店面
          </Link>
          <Link href="/sell" className={styles.sell}>
            我要頂出 →
          </Link>
        </div>
      </div>
    </Section>
  );
}
