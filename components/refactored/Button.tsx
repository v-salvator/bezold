import styles from "./Button.module.css";
import { cn } from "@/lib/utils";

export type ButtonVariant = "default" | "mus" | "ghost";

export default function Button({
  variant = "default",
  size = "md",
  children,
  className,
  disabled,
  onClick,
}: {
  variant?: ButtonVariant;
  size?: "md" | "sm";
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
}) {
  const variantCls = variant === "default" ? "" : styles[variant];
  const sizeCls = size === "md" ? styles.md : styles.sm;
  return (
    <button
      className={cn(styles.btn, variantCls, sizeCls, className)}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
