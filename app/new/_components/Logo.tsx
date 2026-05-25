import Link from "next/link";
import styles from "./Logo.module.css";

export default function Logo({
  subtitle = "頂讓創業平台",
  emphasize = "必售！",
  light = false,
}: {
  subtitle?: string;
  emphasize?: string;
  light?: boolean;
}) {
  return (
    <Link href="/new" className={`${styles.logo} ${light ? styles.light : ""}`}>
      <div className={styles.text}>
        Bezold
        <small>
          <em>{emphasize}</em>
          {subtitle}
        </small>
      </div>
    </Link>
  );
}
