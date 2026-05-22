import styles from "./Card.module.css";
import { cn } from "@/lib/utils";

export default function Card({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn(styles.card, className)}>{children}</div>;
}
