"use client";

import { useState } from "react";
import StoreCard, {
  type StoreCard as StoreCardType,
} from "@/components/refactored/StoreCard";
import {
  type DigitalAssetTab,
  type DigitalAssetType,
  ALL_DIGITAL_ASSET_TYPES,
} from "@/types";
import {
  digitalAssetListHref,
  filterByDigitalAssetTab,
} from "@/utils/digitalAsset";
import TypeTabs from "./TypeTabs";
import styles from "./DigitalAssets.module.css";

export type LatestAsset = {
  id: string;
  digitalTypes?: DigitalAssetType[];
  card: StoreCardType;
};

const CARDS_PER_TAB = 6;

// * the homepage isn't a filter page — tabs filter the latest assets already
// * loaded and never touch the URL
export default function LatestAssets({ assets }: { assets: LatestAsset[] }) {
  const [activeTab, setActiveTab] = useState<DigitalAssetTab>(
    ALL_DIGITAL_ASSET_TYPES,
  );
  const visibleAssets = filterByDigitalAssetTab(assets, activeTab).slice(
    0,
    CARDS_PER_TAB,
  );

  return (
    <>
      <TypeTabs activeTab={activeTab} onSelect={setActiveTab} />
      {visibleAssets.length > 0 ? (
        <div className={styles.listings}>
          {visibleAssets.map(({ id, card }) => (
            <a key={id} href={`/store/${id}`} className={styles.cardLink}>
              <StoreCard card={card} />
            </a>
          ))}
        </div>
      ) : (
        // * only the latest assets are loaded here, so an empty tab means
        // * "nothing recent", not "nothing listed"
        <div className={styles.tabEmpty}>
          <p className={styles.emptyText}>這個類型目前沒有最新刊登</p>
          <a
            className={styles.emptyLink}
            href={digitalAssetListHref(activeTab)}
          >
            到列表頁看看 →
          </a>
        </div>
      )}
    </>
  );
}
