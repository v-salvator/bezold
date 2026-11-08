import type { Store } from "@/types";
import {
  formatDigitalTypes,
  formatPrice,
  formatPriceDisplay,
  formatPriceRange,
  isDigitalAsset,
} from "@/utils/store";

// * the 「您的刊登」 card rows in the follow-up email — same labels and price
// * wording as the site; empty fields are left out
export const listingRows = (store: Store): [string, string][] => {
  const rows: [string, string | false | undefined][] = isDigitalAsset(store)
    ? [
        ["類型", formatDigitalTypes(store.digitalTypes)],
        [
          "平均月營收",
          store.monthlyRevenue != null && formatPrice(store.monthlyRevenue),
        ],
        [
          "經營年數",
          store.operatingYears != null && `${store.operatingYears} 年`,
        ],
        [
          "頂讓金",
          formatPriceRange(store.price, store.priceMax, store.priceNegotiable),
        ],
      ]
    : [
        ["地區", `${store.city ?? ""}${store.district ?? ""}`],
        ["坪數", store.areaPing != null && `${store.areaPing} 坪`],
        ["月租", !!store.monthlyRent && formatPrice(store.monthlyRent)],
        ["頂讓金", formatPriceDisplay(store.price, store.priceNegotiable)],
      ];

  return rows.filter((row): row is [string, string] => Boolean(row[1]));
};

// * one line for the /listing-check store card, e.g.
// * 雲林縣西螺鎮 · 坪數 18 坪 · 月租 NT$ 4 萬 · 頂讓金 NT$ 45 萬
export const listingSummary = (store: Store) =>
  listingRows(store)
    .map(([label, value]) =>
      label === "地區" || label === "類型" ? value : `${label} ${value}`,
    )
    .join(" · ");
