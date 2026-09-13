import Section from "../../../_components/Section";
import styles from "./EpQuote.module.css";

export default function EpQuote() {
  return (
    <Section variant="alt">
      <figure className={styles.wrap}>
        <span className={styles.markTop} aria-hidden>
          &ldquo;
        </span>
        <blockquote className={styles.quote}>
          完整的資訊不只能增加入選機會，也能幫助買家快速判斷，提升有效詢問與成功接手的機率。
        </blockquote>
        <span className={styles.markBottom} aria-hidden>
          &rdquo;
        </span>
        <figcaption className={styles.cite}>
          首頁編輯精選由 BEZOLD 團隊依案件內容與版位狀況綜合評選。
        </figcaption>
      </figure>
    </Section>
  );
}
