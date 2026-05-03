import styles from "./Link.module.css";

export default function Link({
  children,
  href,
  active = false,
}: {
  children: React.ReactNode;
  href: string;
  active?: boolean;
}) {
  return (
    <a className={`${styles.link} ${active ? styles.active : ""}`} href={href}>
      {children}
    </a>
  );
}
