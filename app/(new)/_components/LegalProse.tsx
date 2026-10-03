import styles from "./LegalProse.module.css";

// Body text block shared by the legal pages (terms, privacy, disclaimer).
export default function LegalProse({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className={styles.prose}>{children}</div>;
}
