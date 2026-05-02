import styles from "./Logo.module.css";

export default function Logo({
  tagline = "DING-RANG · since 2024",
  light = false,
}: {
  tagline?: string;
  light?: boolean;
}) {
  return (
    <div className={`${styles.logo} ${light ? styles.light : ""}`}>
      <span className={styles.mark}>頂</span>
      <div className={styles.text}>
        頂讓 . tw <small>{tagline}</small>
      </div>
    </div>
  );
}
