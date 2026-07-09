import Link from "next/link";
import styles from "./RelatedReading.module.css";

export type RelatedItem = {
  label: string;
  href: string;
};

/**
 * 延伸閱讀 — internal links to related articles/pages, strengthening topical
 * clustering and on-site navigation.
 */
export default function RelatedReading({
  items,
  title = "延伸閱讀",
}: {
  items: RelatedItem[];
  title?: string;
}) {
  if (!items?.length) return null;

  return (
    <aside className={styles.wrap}>
      <h2 className={styles.heading}>{title}</h2>
      <ul className={styles.list}>
        {items.map((item) => (
          <li key={item.href}>
            <Link href={item.href} className={styles.link}>
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}
