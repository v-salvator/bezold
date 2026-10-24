import type { Metadata } from "next";
import { BASE_OPEN_GRAPH } from "@/constant/seo";
import { STORE_STATUS, type Store } from "@/types";
import { isDigitalAsset } from "@/utils/store";

interface PageMetadataInput {
  title: string;
  description: string;
  path: string;
  images?: string[];
}

// * title / description / canonical / og in one call, so a page can never
// * silently inherit the homepage's canonical or share card again
export const pageMetadata = ({
  title,
  description,
  path,
  images,
}: PageMetadataInput): Metadata => ({
  title,
  description,
  alternates: { canonical: path },
  openGraph: {
    ...BASE_OPEN_GRAPH,
    title,
    description,
    url: path,
    images: images ?? [...BASE_OPEN_GRAPH.images],
  },
});

// * flatten line breaks and cap the length for <meta name="description">
export const toMetaDescription = (text: string, maxLength = 120) => {
  const flatText = text.replace(/\s+/g, " ").trim();
  return flatText.length > maxLength
    ? `${flatText.slice(0, maxLength - 1)}…`
    : flatText;
};

export const storePageTitle = (
  store: Pick<Store, "storeName" | "city" | "listingType">,
) =>
  isDigitalAsset(store)
    ? `${store.storeName}｜數位資產頂讓`
    : `${store.storeName}｜${store.city ?? ""}店面頂讓`;

// * schema.org offer for the store Product. A digital price range becomes an
// * AggregateOffer (lowPrice / highPrice). 面議 (price 0 + negotiable) has no
// * price to advertise — null, and the page skips the JSON-LD entirely.
export const storeOffer = (
  store: Pick<
    Store,
    "price" | "priceMax" | "priceNegotiable" | "currency" | "status"
  >,
  url: string,
) => {
  if (store.price === 0 && store.priceNegotiable) return null;

  // * sold listings stay indexed as closed deals
  const availability =
    store.status === STORE_STATUS.SOLD
      ? "https://schema.org/SoldOut"
      : "https://schema.org/InStock";
  const isRange =
    store.price > 0 && !!store.priceMax && store.priceMax > store.price;

  return isRange
    ? {
        "@type": "AggregateOffer",
        priceCurrency: store.currency,
        lowPrice: store.price,
        highPrice: store.priceMax,
        availability,
        url,
      }
    : {
        "@type": "Offer",
        priceCurrency: store.currency,
        price: store.price,
        availability,
        url,
      };
};
