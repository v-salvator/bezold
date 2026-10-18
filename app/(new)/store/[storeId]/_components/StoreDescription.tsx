import styles from "./StoreDescription.module.css";

export default function StoreDescription({
  description,
}: {
  description: string;
}) {
  return (
    <div className={styles.section}>
      <h2 className={styles.heading}>
        物件描述 <small>SELLER STORY</small>
      </h2>
      <p className={styles.body}>{description}</p>
    </div>
  );
}
