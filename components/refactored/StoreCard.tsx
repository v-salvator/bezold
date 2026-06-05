import Image from "next/image";
import { MapPin, Ruler, Banknote, Package } from "lucide-react";
import styles from "./StoreCard.module.css";

const SPEC_ICONS = {
  ruler: <Ruler size={13} strokeWidth={2} />,
  banknote: <Banknote size={13} strokeWidth={2} />,
  package: <Package size={13} strokeWidth={2} />,
};

export type RibbonVariant = "default" | "mus" | "sage";

export type StoreCard = {
  ribbon?: { label: string; variant: RibbonVariant };
  image?: string;
  photoLabel?: string;
  title: string;
  location?: string;
  description?: string;
  specs?: { iconName: keyof typeof SPEC_ICONS; label: string }[];
  price: string;
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
        {card.image && (
          <Image
            src={card.image}
            fill
            alt={card.title}
            className={styles.photo}
            sizes="(max-width: 640px) 100vw, 50vw"
          />
        )}
        {card.ribbon && (
          <span
            className={`${styles.ribbon} ${ribbonClass[card.ribbon.variant]}`}
          >
            {card.ribbon.label}
          </span>
        )}
        {!card.image && (
          <span className={styles.photoLabel}>
            {card.photoLabel ?? "店面照"}
          </span>
        )}
      </div>
      <div className={"p-3.5 flex flex-col gap-2"}>
        <h4 className={styles.title}>{card.title}</h4>
        {card.location && (
          <div className={styles.location}>
            <MapPin size={13} strokeWidth={2} />
            {card.location}
          </div>
        )}
        {card.description && (
          <p className={styles.description}>{card.description}</p>
        )}
        {card.specs && card.specs.length > 0 && (
          <div className={styles.specs}>
            {card.specs.map((spec, index) => (
              <span key={index} className={styles.specItem}>
                {SPEC_ICONS[spec.iconName]}
                {spec.label}
              </span>
            ))}
          </div>
        )}
        <div className={styles.price}>
          <b>{card.price}</b>
        </div>
      </div>
    </div>
  );
}
