import { type StoreCard } from "@/components/refactored/StoreCard";
import { type Store } from "@/types";
import { STORE_CATEGORIES } from "@/constant/storeType";
import { RIBBON_DISPLAY, RIBBON_PRIORITY } from "@/constant/storeDisplay";
import { EQUIPMENT_LABEL } from "@/constant/storeEquipment";

export function formatPriceParts(price: number): {
  amount: string;
  unit: string;
} {
  if (price < 10_000) return { amount: `NT$ ${price}`, unit: "元" };
  if (price < 100_000_000)
    return { amount: `NT$ ${Math.round(price / 10_000)}`, unit: "萬" };
  return {
    amount: `NT$ ${(price / 100_000_000).toFixed(2).replace(/\.?0+$/, "")}`,
    unit: "億",
  };
}

export function formatPrice(price: number): string {
  const { amount, unit } = formatPriceParts(price);
  return `${amount} ${unit}`;
}

export function storeToCard(store: Store): StoreCard {
  const tags = store.tags ?? [];

  const ribbonTag = RIBBON_PRIORITY.find((tag) => tags.includes(tag));
  const ribbon = ribbonTag ? RIBBON_DISPLAY[ribbonTag] : undefined;

  const categoryEntry = STORE_CATEGORIES.find(
    (cat) => cat.key === store.category,
  );
  const categoryLabel = categoryEntry?.label ?? store.category;

  const locationParts = [
    categoryLabel,
    store.city,
    store.location || store.district,
  ].filter(Boolean);
  const location =
    locationParts.length > 0 ? locationParts.join(" · ") : undefined;

  const price = formatPrice(store.price);

  let rentSpec = "租金 —";
  if (store.monthlyRent) {
    const { amount, unit } = formatPriceParts(store.monthlyRent);
    rentSpec =
      unit === "元"
        ? `租金 NT$ ${store.monthlyRent.toLocaleString()}/月`
        : `租金 ${amount} ${unit}/月`;
  }

  const specs: StoreCard["specs"] = [
    { iconName: "ruler", label: store.areaPing ? `${store.areaPing} 坪` : "—" },
    { iconName: "banknote", label: rentSpec },
    {
      iconName: "package",
      label: store.equipment ? EQUIPMENT_LABEL[store.equipment] : "—",
    },
  ];

  return {
    ribbon,
    image: store.images?.[0],
    title: store.storeName,
    location,
    description: store.description || undefined,
    specs,
    price,
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
