import Section from "../../_components/Section";
import styles from "./FaqHero.module.css";

export default function FaqHero() {
  return (
    <Section variant="dark">
      <div className={styles.wrap}>
        <span className={styles.badge}>常見問題</span>
        <h1 className={styles.title}>常見問題</h1>
        <p className={styles.sub}>— 找不到答案？LINE 客服隨時在 —</p>
      </div>
    </Section>
  );
}
