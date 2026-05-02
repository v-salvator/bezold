import styles from "./Link.module.css";

export default function Link({
  children,
  href,
}: {
  children: React.ReactNode;
  href: string;
}) {
  return (
    <a className={styles.link} href={href}>
      {children}
    </a>
  );
}
