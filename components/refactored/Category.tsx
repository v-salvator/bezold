import styles from "./Category.module.css";

type CategoryVariant = "a" | "b" | "c" | "default";

export type Category = {
  ico: string;
  variant: CategoryVariant;
  name: string;
  count?: string;
  href?: string;
};

const variantClass: Record<CategoryVariant, string> = {
  a: styles.icoA,
  b: styles.icoB,
  c: styles.icoC,
  default: "",
};

export default function Category({ category }: { category: Category }) {
  const { ico, variant, name, count, href } = category;
  const inner = (
    <>
      <div className={`${styles.ico} ${variantClass[variant]}`}>{ico}</div>
      <b>{name}</b>
      {count && <span>{count}</span>}
    </>
  );

  if (href) {
    return (
      <a href={href} className={styles.category}>
        {inner}
      </a>
    );
  }

  return <div className={styles.category}>{inner}</div>;
}
