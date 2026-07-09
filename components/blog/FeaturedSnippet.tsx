import styles from "./FeaturedSnippet.module.css";

/**
 * Highlighted one-line answer box, optimised for featured snippets / AEO.
 * Fed from frontmatter `snippet` in the article header, and also usable
 * inline within MDX for section-level direct answers.
 */
export default function FeaturedSnippet({
  children,
  label = "重點摘要",
}: {
  children: React.ReactNode;
  label?: string;
}) {
  return (
    <div className={styles.box}>
      <span className={styles.label}>{label}</span>
      <p className={styles.text}>{children}</p>
    </div>
  );
}
