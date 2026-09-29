import Image from "next/image";
import { MapPin, Ruler, Banknote, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import styles from "./StoreCard.module.css";

const SPEC_ICONS = {
  ruler: <Ruler size={13} strokeWidth={2} />,
  banknote: <Banknote size={13} strokeWidth={2} />,
  package: <Package size={13} strokeWidth={2} />,
};

export type RibbonVariant = "default" | "mus" | "sage" | "sold";

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
  sold: styles.ribbonSold,
};

// * Every text slot has a fixed line budget (title 2, location 1, description 2,
// * specs 1) and the price is pinned to the bottom, so all cards in a grid share
// * one height regardless of content length.
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
          <span className={cn(styles.ribbon, ribbonClass[card.ribbon.variant])}>
            {card.ribbon.label}
          </span>
        )}
        {!card.image && (
          <span className={styles.photoLabel}>
            {card.photoLabel ?? "店面照"}
          </span>
        )}
      </div>
      <div className={"p-3.5 flex flex-1 flex-col gap-2"}>
        <h4 className={styles.title} title={card.title}>
          {card.title}
        </h4>
        <div className={styles.location}>
          <MapPin size={13} strokeWidth={2} />
          <span>{card.location ?? "—"}</span>
        </div>
        <p className={styles.description}>{card.description}</p>
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
          <span className={styles.priceCta}>查看 →</span>
        </div>
      </div>
    </div>
  );
}
