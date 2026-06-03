import type { Metadata } from "next";
import LaunchBanner from "@/app/(new)/_components/LaunchBanner";
import SiteNav from "@/app/(new)/_components/SiteNav";
import SiteFooter from "@/app/(new)/_components/SiteFooter";
import StoreBreadcrumb from "@/app/(new)/store/[storeId]/_components/StoreBreadcrumb";
import StoreGallery from "@/app/(new)/store/[storeId]/_components/StoreGallery";
import StoreTitleRow from "@/app/(new)/store/[storeId]/_components/StoreTitleRow";
import StoreDescription from "@/app/(new)/store/[storeId]/_components/StoreDescription";
import StorePriceCard from "@/app/(new)/store/[storeId]/_components/StorePriceCard";
import ExampleBanner from "./_components/ExampleBanner";
import { exampleStore } from "./_data/exampleStore";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Bezold 頂讓必售 — 刊登範例",
  description: "查看頂讓店面刊登後的頁面樣式，這是示範頁面，非真實物件。",
};

export default function StoreExamplePage() {
  return (
    <>
      <LaunchBanner />
      <SiteNav />
      <ExampleBanner />
      <main className={styles.main}>
        <StoreBreadcrumb store={exampleStore} />
        <StoreGallery images={exampleStore.images} tags={exampleStore.tags} />
        <StoreTitleRow store={exampleStore} />
        <div className={styles.mainCol}>
          <StoreDescription description={exampleStore.description} />
          <StorePriceCard store={exampleStore} isExample />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
