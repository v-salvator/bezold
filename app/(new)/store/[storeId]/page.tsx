import type { Metadata, ResolvingMetadata } from "next";
import { notFound } from "next/navigation";
import { getStoreById } from "@/firebase/serverUtils";
import { STORE_STATUS, type StoreStatus } from "@/types";
import { BASE_OPEN_GRAPH } from "@/constant/seo";
import { toMetaDescription } from "@/utils/seo";
import { omitSellerContact } from "@/utils/store";
import LaunchBanner from "@/app/(new)/_components/LaunchBanner";
import SiteNav from "@/app/(new)/_components/SiteNav";
import SiteFooter from "@/app/(new)/_components/SiteFooter";
import StoreBreadcrumb from "./_components/StoreBreadcrumb";
import StoreGallery from "./_components/StoreGallery";
import StoreTitleRow from "./_components/StoreTitleRow";
import StoreDescription from "./_components/StoreDescription";
import StorePriceCard from "./_components/StorePriceCard";
import BuyerClubPopup from "./_components/BuyerClubPopup";
import JsonLd from "@/app/(new)/_components/JsonLd";
import styles from "./page.module.css";

interface StorePageProps {
  params: { storeId: string };
  searchParams: { [key: string]: string | string[] | undefined };
}

// * only live and sold listings belong in search — drafts, pending and
// * rejected pages stay reachable by direct link but are noindexed
const INDEXABLE_STATUSES: (StoreStatus | undefined)[] = [
  STORE_STATUS.APPROVED,
  STORE_STATUS.SOLD,
];

// * Firestore throws INVALID_ARGUMENT on reserved ids like "__foo__", which
// * would surface as a 500 — treat them as missing so the page 404s instead
const RESERVED_DOC_ID = /^__.*__$/;

const findStore = (storeId: string) =>
  RESERVED_DOC_ID.test(storeId) ? null : getStoreById(storeId);

export async function generateMetadata(
  { params }: StorePageProps,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const { storeId } = await params;
  const store = await findStore(storeId);
  const canonicalUrl = `${process.env.NEXT_PUBLIC_APP_URL}/store/${storeId}`;

  if (!store) notFound();

  const storeTitle = `${store.storeName}｜${store.city ?? ""}店面頂讓`;

  return {
    title: storeTitle,
    description: toMetaDescription(store.description),
    ...(!INDEXABLE_STATUSES.includes(store.status)
      ? { robots: { index: false, follow: false } }
      : {}),
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      ...BASE_OPEN_GRAPH,
      title: storeTitle,
      description: toMetaDescription(store.description, 200),
      url: canonicalUrl,
      images: store.images.length ? store.images : [...BASE_OPEN_GRAPH.images],
    },
  };
}

export default async function StoreDetailPage({
  params,
  searchParams,
}: StorePageProps) {
  const { storeId } = await params;
  const { modal } = await searchParams;
  const fetchedStore = await findStore(storeId);

  if (!fetchedStore) notFound();

  // Seller contact never reaches the served HTML — SellerContactGate fetches the
  // real values client-side once the viewer is a signed-in member.
  const store = omitSellerContact(fetchedStore);

  // `?modal=buyer-club` force-opens the buyer club popup (used for paid ad
  // landings) and bypasses the once-per-day suppression.
  const forceOpenBuyerClub = modal === "buyer-club";

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: store.storeName,
          description: store.description,
          image: store.images.length ? store.images : ["/bezold-avatar-v2.png"],
          url: `${process.env.NEXT_PUBLIC_APP_URL}/store/${storeId}`,
          // * 面議 (price 0 + negotiable) has no price to advertise — omit the
          // * Offer entirely rather than emit an invalid non-numeric price.
          ...(!(store.price === 0 && store.priceNegotiable) && {
            offers: {
              "@type": "Offer",
              priceCurrency: store.currency,
              price: store.price,
              availability: "https://schema.org/InStock",
              url: `${process.env.NEXT_PUBLIC_APP_URL}/store/${storeId}`,
            },
          }),
        }}
      />
      <LaunchBanner />
      <SiteNav activeLink="我要找店" />
      <main className={styles.main}>
        <StoreBreadcrumb store={store} />
        <StoreGallery images={store.images} tags={store.tags} />
        <StoreTitleRow store={store} />
        <div className={styles.mainCol}>
          <StoreDescription description={store.description} />
          <StorePriceCard store={store} />
        </div>
      </main>
      <SiteFooter />
      <BuyerClubPopup forceOpen={forceOpenBuyerClub} />
    </>
  );
}
