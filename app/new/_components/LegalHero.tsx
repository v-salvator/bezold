import Section from "./Section";
import styles from "./LegalHero.module.css";

export default function LegalHero({
  badge,
  title,
  effectiveDate,
}: {
  badge: string;
  title: string;
  effectiveDate: string;
}) {
  return (
    <Section variant="dark">
      <div className={styles.wrap}>
        <span className={styles.badge}>{badge}</span>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.sub}>— 最後更新：{effectiveDate} —</p>
      </div>
    </Section>
  );
}
