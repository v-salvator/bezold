import type { Metadata } from "next";
import { pageMetadata } from "@/utils/seo";
import LaunchBanner from "@/app/(new)/_components/LaunchBanner";
import SiteNav from "@/app/(new)/_components/SiteNav";
import SiteFooter from "@/app/(new)/_components/SiteFooter";
import DigitalAssetResults from "./_components/DigitalAssetResults";
import { getDigitalAssets } from "@/firebase/serverUtils/store";
import { STORE_STATUS } from "@/types";
import { toCard } from "@/utils/store";
import {
  filterByDigitalAssetTab,
  toDigitalAssetTab,
} from "@/utils/digitalAsset";

const PAGE_TITLE = "數位資產頂讓｜電商、社群、網站轉讓 - Bezold";

export const metadata: Metadata = {
  ...pageMetadata({
    title: PAGE_TITLE,
    description:
      "瀏覽電商賣場、FB 社團、網站、App、SaaS 等數位資產頂讓。匿名刊登，買家送出申請後由 Bezold 確認雙方，再為你們牽線。",
    path: "/digital-assets",
  }),
  // * the spec's full title — skip the root "｜頂讓網 Bezold" template
  title: { absolute: PAGE_TITLE },
};

interface PageProps {
  searchParams: { type?: string | string[] };
}

export default async function DigitalAssetsPage({ searchParams }: PageProps) {
  // * ?type= is the only source of the filter; unknown values mean 全部
  const activeTab = toDigitalAssetTab(searchParams.type);

  const assets = await getDigitalAssets({
    statuses: [STORE_STATUS.APPROVED, STORE_STATUS.SOLD],
    coverOnly: true,
  });
  const tabAssets = filterByDigitalAssetTab(assets, activeTab);
  const approvedAssets = tabAssets.filter(
    (store) => store.status === STORE_STATUS.APPROVED,
  );
  const soldAssets = tabAssets.filter(
    (store) => store.status === STORE_STATUS.SOLD,
  );

  // * approved first, then sold — each keeps the query's newest-first order
  const results = [...approvedAssets, ...soldAssets].map((store) => ({
    id: store.id,
    sold: store.status === STORE_STATUS.SOLD,
    card: toCard(store),
  }));

  return (
    <>
      <LaunchBanner />
      <SiteNav activeLink="數位資產" />
      <div className="flex-1">
        <DigitalAssetResults
          results={results}
          approvedCount={approvedAssets.length}
          activeTab={activeTab}
        />
      </div>
      <SiteFooter />
    </>
  );
}
