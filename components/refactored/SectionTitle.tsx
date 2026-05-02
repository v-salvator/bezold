import styles from "./SectionTitle.module.css";
import cn from "classnames";

export default function SectionTitle({
  num,
  title,
  sub,
  more,
  dark = false,
}: {
  num: string;
  title: string;
  sub?: string;
  more?: string;
  dark?: boolean;
}) {
  return (
    <div className={styles.wrap}>
      <div className={styles.left}>
        <span className={cn(styles.num, dark && styles.numDark)}>{num}</span>
        <h3 className={styles.h}>{title}</h3>
        {sub && (
          <span className={cn(styles.sub, dark && styles.subDark)}>{sub}</span>
        )}
      </div>
      {more && <a className={styles.more}>{more}</a>}
    </div>
  );
}
