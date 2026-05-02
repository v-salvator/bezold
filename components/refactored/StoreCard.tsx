import styles from "./StoreCard.module.css";
import Pill, { type PillVariant } from "@/components/refactored/Pill";

export type StoreCard = {
  tags: { label: string; variant: PillVariant }[];
  title: string;
  meta: [string, string][];
  price: string;
  rent: string;
};

export default function StoreCard({ card }: { card: StoreCard }) {
  return (
    <div className={styles.card}>
      <div className={styles.placeholderPhoto} />
      <div className={"p-3.5 flex flex-col gap-2"}>
        <div className={"flex flex-wrap gap-1.5"}>
          {card.tags.map((t) => (
            <Pill key={t.label} variant={t.variant}>
              {t.label}
            </Pill>
          ))}
        </div>
        <h4 className={styles.title}>{card.title}</h4>
        <div className={styles.meta}>
          {card.meta.map(([k, v]) => (
            <div key={k}>
              <b>{k}</b> {v}
            </div>
          ))}
        </div>
        <div className={styles.price}>
          <b>{card.price}</b>
          <span className={styles.rent}>{card.rent}</span>
        </div>
      </div>
    </div>
  );
}
