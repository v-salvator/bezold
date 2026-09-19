import { type StoreCard } from "@/components/refactored/StoreCard";
import { type Store, type SellerContact } from "@/types";
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

// * single source of truth for the buyer-facing 頂讓金 label across all cards.
// * price 0 + negotiable = 面議; price 0 + !negotiable = 免頂讓金 (free transfer);
// * price > 0 + negotiable = 可面議. `undefined` is treated as false.
export function formatPriceDisplay(
  price: number,
  priceNegotiable?: boolean,
): string {
  if (price === 0) return priceNegotiable ? "面議" : "免頂讓金";
  const base = formatPrice(price);
  return priceNegotiable ? `${base}（可面議）` : base;
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

  const price = formatPriceDisplay(store.price, store.priceNegotiable);

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

// * ── Seller contact masking ──────────────────────────────────────────────
// * Real phone / LINE / email never reach a logged-out visitor's HTML. The
// * public store payload carries placeholders of the same shape instead, so the
// * blurred contact lines look right and the CTA still knows which channels the
// * seller offers. An empty field stays empty — "no LINE" is not a secret.
// * Signed-in members read the real values from GET /api/stores/[id]/contact.

export const MASKED_CONTACT: SellerContact = {
  phone: "0900-000-000",
  lineId: "bezold_user",
  email: "seller@example.com",
};

const EMPTY_CONTACT: SellerContact = { phone: "", lineId: "", email: "" };

function replaceSellerContact(store: Store, values: SellerContact): Store {
  if (!store.userInfo) return store;
  const { phone, lineId, email } = store.userInfo;
  return {
    ...store,
    userInfo: {
      ...store.userInfo,
      phone: phone ? values.phone : "",
      lineId: lineId ? values.lineId : "",
      email: email ? values.email : "",
    },
  };
}

/** For server-rendered pages — keeps placeholders so the gate can blur them. */
export function maskSellerContact(store: Store): Store {
  return replaceSellerContact(store, MASKED_CONTACT);
}

/** For API responses — blanks the fields outright, no fake values to mistake. */
export function omitSellerContact(store: Store): Store {
  return replaceSellerContact(store, EMPTY_CONTACT);
}
