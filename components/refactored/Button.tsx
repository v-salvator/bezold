import styles from "./Button.module.css";
import { cn } from "@/lib/utils";

export type ButtonVariant = "default" | "mus" | "ghost";

export default function Button({
  variant = "default",
  size = "md",
  children,
  className,
}: {
  variant?: ButtonVariant;
  size?: "md" | "sm";
  children: React.ReactNode;
  className?: string;
}) {
  const variantCls = variant === "default" ? "" : styles[variant];
  const sizeCls = size === "md" ? styles.md : styles.sm;
  return (
    <button className={cn(styles.btn, variantCls, sizeCls, className)}>
      {children}
    </button>
  );
}
