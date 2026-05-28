import Section from "../../_components/Section";
import styles from "./GuideHero.module.css";

export default function GuideHero() {
  return (
    <Section variant="dark">
      <div className={styles.wrap}>
        <span className={styles.badge}>頂讓指南</span>
        <h1 className={styles.title}>什麼是頂讓？</h1>
        <p className={styles.sub}>
          「頂讓」是把一間已在營運的店面，連同客群、設備、租約一起轉手給新老闆。比從零創業省下籌備時間，比買加盟少去龐大加盟金。
        </p>
        <div className={styles.links}>
          <a href="#buyer" className={styles.link}>
            → 我是買家
          </a>
          <a href="#seller" className={styles.link}>
            → 我是賣家
          </a>
        </div>
      </div>
    </Section>
  );
}
