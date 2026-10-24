"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import StoreCard, {
  type StoreCard as StoreCardType,
} from "@/components/refactored/StoreCard";
import TypeTabs from "./TypeTabs";
import SellCtaLink from "@/app/(new)/_components/SellCtaLink";
import { TRANSFER_RISK_NOTICE } from "@/constant/digitalAsset";
import { type DigitalAssetTab, ALL_DIGITAL_ASSET_TYPES } from "@/types";
import { digitalAssetListHref } from "@/utils/digitalAsset";
import { cn } from "@/lib/utils";
import styles from "./DigitalAssetResults.module.css";

export type DigitalAssetResult = {
  id: string;
  sold: boolean;
  card: StoreCardType;
};

// * the first row on mobile and desktop — loaded eagerly as LCP candidates
const ABOVE_THE_FOLD_CARDS = 2;

export default function DigitalAssetResults({
  results,
  approvedCount,
  activeTab,
}: {
  results: DigitalAssetResult[];
  approvedCount: number;
  activeTab: DigitalAssetTab;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  // * highlight the clicked tab right away, while the server filters
  const [pendingTab, setPendingTab] = useState<DigitalAssetTab | null>(null);
  const shownTab = isPending && pendingTab ? pendingTab : activeTab;

  const handleSelect = (tab: DigitalAssetTab) => {
    if (tab === activeTab) return;
    setPendingTab(tab);
    startTransition(() => {
      router.push(digitalAssetListHref(tab), { scroll: false });
    });
  };

  return (
    <>
      <div className={styles.crumbs}>
        <div className={styles.inner}>
          <div className={styles.trail}>
            <a href="/">首頁</a> / <a href="/digital-assets">數位資產</a>
          </div>
          <h1 className={styles.title}>
            數位資產頂讓 <em>共 {approvedCount} 件</em>
          </h1>
          <p className={styles.sub}>
            電商、社群、網站、App……匿名刊登，送出申請後由平台確認雙方再牽線。
          </p>
        </div>
      </div>

      <div className={styles.area}>
        <TypeTabs activeTab={shownTab} onSelect={handleSelect} />

        {results.length > 0 ? (
          <div className={cn(styles.grid, isPending && styles.gridPending)}>
            {results.map(({ id, sold, card }, index) => (
              <a
                key={id}
                href={`/store/${id}`}
                className={cn(styles.cardLink, sold && styles.soldCard)}
              >
                <StoreCard
                  card={card}
                  priority={index < ABOVE_THE_FOLD_CARDS}
                  titleTag="h2"
                />
              </a>
            ))}
          </div>
        ) : (
          <div className={styles.empty}>
            <p className={styles.emptyText}>這個類型目前還沒有刊登</p>
            {activeTab !== ALL_DIGITAL_ASSET_TYPES && (
              <a
                className={styles.emptyLink}
                href={digitalAssetListHref(ALL_DIGITAL_ASSET_TYPES)}
              >
                看全部數位資產 →
              </a>
            )}
          </div>
        )}

        <div className={styles.sellCta}>
          <div>
            <div className={styles.sellCtaTitle}>也有數位資產想轉手？</div>
            <p className={styles.sellCtaSub}>{TRANSFER_RISK_NOTICE}</p>
          </div>
          <SellCtaLink
            ctaLocation="digital_assets_list"
            href="/sell?type=digital"
            className={styles.sellCtaBtn}
          >
            免費刊登數位資產
          </SellCtaLink>
        </div>
      </div>
    </>
  );
}
