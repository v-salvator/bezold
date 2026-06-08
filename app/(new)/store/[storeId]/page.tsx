import type { Metadata, ResolvingMetadata } from "next";
import { getStoreById } from "@/firebase/serverUtils";
import LaunchBanner from "@/app/(new)/_components/LaunchBanner";
import SiteNav from "@/app/(new)/_components/SiteNav";
import SiteFooter from "@/app/(new)/_components/SiteFooter";
import StoreBreadcrumb from "./_components/StoreBreadcrumb";
import StoreGallery from "./_components/StoreGallery";
import StoreTitleRow from "./_components/StoreTitleRow";
import StoreDescription from "./_components/StoreDescription";
import StorePriceCard from "./_components/StorePriceCard";
import JsonLd from "@/app/(new)/_components/JsonLd";
import styles from "./page.module.css";

interface StorePageProps {
  params: { storeId: string };
}

export async function generateMetadata(
  { params }: StorePageProps,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const { storeId } = await params;
  const store = await getStoreById(storeId);
  const canonicalUrl = `${process.env.NEXT_PUBLIC_APP_URL}/store/${storeId}`;

  if (!store) {
    return {
      title: "Bezold 頂讓必售 — 找不到物件",
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        title: "Bezold 頂讓必售 — 找不到物件",
        description: "此物件不存在或已下架",
        url: canonicalUrl,
        siteName: "Bezold 頂讓必售",
        type: "website",
        locale: "zh_TW",
        images: ["/assets/bezold.png"],
      },
    };
  }

  return {
    title: `Bezold 頂讓必售 — ${store.storeName}`,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `Bezold 頂讓必售 — ${store.storeName}`,
      description: store.description,
      url: canonicalUrl,
      siteName: "Bezold 頂讓必售",
      type: "website",
      locale: "zh_TW",
      images: store.images.length ? store.images : ["/assets/bezold.png"],
    },
  };
}

export default async function StoreDetailPage({ params }: StorePageProps) {
  const { storeId } = await params;
  const store = await getStoreById(storeId);

  if (!store) {
    throw new Error("Store not found");
  }

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Product",
          name: store.storeName,
          description: store.description,
          image: store.images.length ? store.images : ["/assets/bezold.png"],
          url: `${process.env.NEXT_PUBLIC_APP_URL}/store/${storeId}`,
          offers: {
            "@type": "Offer",
            priceCurrency: store.currency,
            price: store.price,
            availability: "https://schema.org/InStock",
            url: `${process.env.NEXT_PUBLIC_APP_URL}/store/${storeId}`,
          },
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
    </>
  );
}
