import styles from "./Section.module.css";

export type SectionVariant = "default" | "alt" | "dark" | "trust";

export default function Section({
  variant = "default",
  children,
}: {
  variant?: SectionVariant;
  children: React.ReactNode;
}) {
  const variantCls = variant === "default" ? "" : styles[variant];
  return (
    <section className={`${styles.section} ${variantCls}`}>{children}</section>
  );
}
