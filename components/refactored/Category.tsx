import styles from "./Category.module.css";

type CategoryVariant = "a" | "b" | "c" | "default";

export type Category = {
  ico: string;
  variant: CategoryVariant;
  name: string;
  count: string;
};
const variantClass: Record<CategoryVariant, string> = {
  a: styles.icoA,
  b: styles.icoB,
  c: styles.icoC,
  default: "",
};

export default function Category({ category }: { category: Category }) {
  const { ico, variant, name, count } = category;
  return (
    <div key={name} className={styles.category}>
      <div className={`${styles.ico} ${variantClass[variant]}`}>{ico}</div>
      <b>{name}</b>
      <span>{count}</span>
    </div>
  );
}
