import { type PillVariant } from "@/components/refactored/Pill";
import { type StoreCard } from "@/components/refactored/StoreCard";
import { type Store } from "@/types";
import { STORE_CATEGORIES } from "@/constant/storeType";
import {
  TAG_DISPLAY,
  RIBBON_DISPLAY,
  RIBBON_PRIORITY,
} from "@/constant/storeDisplay";

export function storeToCard(store: Store): StoreCard {
  const tags = store.tags ?? [];

  const ribbonTag = RIBBON_PRIORITY.find((tag) => tags.includes(tag));
  const ribbon = ribbonTag ? RIBBON_DISPLAY[ribbonTag] : undefined;

  const categoryEntry = STORE_CATEGORIES.find(
    (cat) => cat.key === store.category,
  );
  const categoryLabel = categoryEntry?.label ?? store.category;

  const tagPills = [
    ...tags.map(
      (tag) =>
        TAG_DISPLAY[tag] ?? { label: tag, variant: "default" as PillVariant },
    ),
    ...(categoryLabel
      ? [{ label: categoryLabel, variant: "default" as PillVariant }]
      : []),
  ];

  const location =
    store.location ||
    [store.city, store.district].filter(Boolean).join(" · ") ||
    undefined;

  const meta: [string, string][] = [
    ...(categoryLabel ? [["行業", categoryLabel] as [string, string]] : []),
    ...(store.city ? [["城市", store.city] as [string, string]] : []),
  ];

  const price = `NT$ ${Math.round(store.price / 10000)} 萬`;

  return {
    ribbon,
    tags: tagPills,
    title: store.storeName,
    location,
    meta,
    price,
    rent: store.description?.slice(0, 20) ?? "-",
  };
}

export const genDefaultStore = () => {
  return {
    storeName: "",
    location: "",
    description: "",
    price: 1000000,
    currency: "TWD",
  };
};
