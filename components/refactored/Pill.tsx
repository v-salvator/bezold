import styles from "./Pill.module.css";

export type PillVariant =
  | "default"
  | "warm"
  | "sage"
  | "mus"
  | "solid"
  | "outlineLight";

export default function Pill({
  variant = "default",
  children,
}: {
  variant?: PillVariant;
  children: React.ReactNode;
}) {
  const variantCls = variant === "default" ? "" : styles[variant];
  return <span className={`${styles.pill} ${variantCls}`}>{children}</span>;
}
