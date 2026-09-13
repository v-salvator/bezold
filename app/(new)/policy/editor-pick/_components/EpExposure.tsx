import Section from "../../../_components/Section";
import styles from "./EpExposure.module.css";

export default function EpExposure() {
  return (
    <Section>
      <div className={styles.wrap}>
        <div className={styles.dark}>
          <span className={styles.darkEyebrow}>免費精選曝光</span>
          <p className={styles.darkLead}>獲選後，至少展示</p>
          <p className={styles.bigNum}>
            24<span className={styles.unit}>小時</span>
          </p>
          <p className={styles.darkNote}>
            首頁精選名額會不定期輪替，並非永久刊登。
          </p>
        </div>
        <div className={styles.gold}>
          <span className={styles.goldEyebrow}>延長首頁曝光</span>
          <p className={styles.goldLead}>希望被看見久一點？</p>
          <p className={styles.price}>
            <span className={styles.priceUnit}>NT$</span>500
          </p>
          <p className={styles.goldNote}>
            可連續展示 14 天，讓更多正在找店的買家看見您的案件。
          </p>
          <a
            href="https://line.me/ti/p/~bezoldtw"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.goldBtn}
          >
            了解延長精選 →
          </a>
        </div>
      </div>
    </Section>
  );
}
