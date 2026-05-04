import styles from "./StoreCard.module.css";
import Pill, { type PillVariant } from "@/components/refactored/Pill";

export type RibbonVariant = "default" | "mus" | "sage";

export type StoreCard = {
  ribbon?: { label: string; variant: RibbonVariant };
  photoLabel?: string;
  tags: { label: string; variant: PillVariant }[];
  title: string;
  location?: string;
  meta: [string, string][];
  price: string;
  rent: string;
};

const ribbonClass: Record<RibbonVariant, string> = {
  default: "",
  mus: styles.ribbonMus,
  sage: styles.ribbonSage,
};

export default function StoreCard({ card }: { card: StoreCard }) {
  return (
    <div className={styles.card}>
      <div className={styles.placeholderPhoto}>
        {card.ribbon && (
          <span
            className={`${styles.ribbon} ${ribbonClass[card.ribbon.variant]}`}
          >
            {card.ribbon.label}
          </span>
        )}
        <span className={styles.photoLabel}>{card.photoLabel ?? "店面照"}</span>
      </div>
      <div className={"p-3.5 flex flex-col gap-2"}>
        <div className={"flex flex-wrap gap-1.5"}>
          {card.tags.map((t) => (
            <Pill key={t.label} variant={t.variant}>
              {t.label}
            </Pill>
          ))}
        </div>
        <h4 className={styles.title}>{card.title}</h4>
        {card.location && (
          <div className={styles.location}>📍 {card.location}</div>
        )}
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
