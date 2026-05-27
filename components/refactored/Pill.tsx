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
  onClick,
}: {
  variant?: PillVariant;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  const variantCls = variant === "default" ? "" : styles[variant];
  return (
    <span
      className={`${styles.pill} ${variantCls} ${onClick ? styles.clickable : ""}`}
      onClick={onClick}
    >
      {children}
    </span>
  );
}
