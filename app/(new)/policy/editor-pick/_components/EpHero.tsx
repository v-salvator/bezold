import Section from "../../../_components/Section";
import styles from "./EpHero.module.css";

export default function EpHero() {
  return (
    <Section>
      <div className={styles.wrap}>
        <div className={styles.main}>
          <span className={styles.eyebrow}>BEZOLD EDITOR&apos;S PICK</span>
          <h1 className={styles.title}>
            如何被選為首頁
            <br />
            <span className={styles.hl}>「編輯精選」</span>？
          </h1>
          <p className={styles.sub}>
            想讓您的頂讓案件獲得更多曝光？完整、清楚、可信的資訊，能讓買家更快判斷，也更有機會被編輯選中。
          </p>
        </div>
        <div className={styles.stat}>
          <span className={styles.statNum}>6 項</span>
          <span className={styles.statLabel}>
            完成以下刊登條件
            <br />
            提高案件入選機會
          </span>
        </div>
      </div>
    </Section>
  );
}
