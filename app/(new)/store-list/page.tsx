import type { Metadata } from "next";
import { pageMetadata } from "@/utils/seo";
import styles from "./page.module.css";
import LaunchBanner from "@/app/(new)/_components/LaunchBanner";
import SiteNav from "@/app/(new)/_components/SiteNav";
import SiteFooter from "@/app/(new)/_components/SiteFooter";
import Breadcrumbs from "./_components/Breadcrumbs";
import SearchBar from "./_components/SearchBar";
import ActiveFilters from "./_components/ActiveFilters";
import ResultsArea from "./_components/ResultsArea";
import { getStores } from "@/firebase/serverUtils";
import { STORE_STATUS } from "@/types";

export const metadata: Metadata = pageMetadata({
  title: "全台頂讓店面列表",
  description:
    "瀏覽全台頂讓店面。依地區、行業、頂讓金快速篩選，直接聯絡賣家，沒有中間人。",
  path: "/store-list",
});

interface PageProps {
  searchParams: URLSearchParams;
}

export default async function StoreListPage({ searchParams }: PageProps) {
  const storeSearchParams = new URLSearchParams(searchParams);
  const searchObj = Object.fromEntries(storeSearchParams);

  const stores = await getStores(searchObj, {
    statuses: [STORE_STATUS.APPROVED],
  });

  return (
    <>
      <LaunchBanner />
      <SiteNav activeLink="我要找店" />
      <main className={styles.main}>
        <Breadcrumbs count={stores.length} />
        <SearchBar />
        <ActiveFilters />
        <ResultsArea stores={stores} />
      </main>
      <SiteFooter />
    </>
  );
}
