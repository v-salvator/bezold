"use client";

import { useState } from "react";
import styles from "./ResultsArea.module.css";
import StoreCard, {
  type StoreCard as StoreCardType,
  type RibbonVariant,
} from "@/components/refactored/StoreCard";
import Dropdown, {
  type DropdownOption,
} from "@/components/refactored/Dropdown";
import { type PillVariant } from "@/components/refactored/Pill";
import { type Store, STORE_TAG } from "@/types";
import { STORE_CATEGORIES } from "@/constant/storeType";

const sortOptions: DropdownOption[] = [
  { label: "頂讓金：低 → 高", value: "price-asc" },
  { label: "頂讓金：高 → 低", value: "price-desc" },
  { label: "最新上架", value: "newest" },
];

const TAG_MAP: Record<string, { label: string; variant: PillVariant }> = {
  [STORE_TAG.EMERGENCY]: { label: "急售", variant: "warm" },
  [STORE_TAG.HOT]: { label: "熱門", variant: "default" },
  [STORE_TAG.CHEAP]: { label: "划算", variant: "default" },
  [STORE_TAG.RECOMMENDED]: { label: "精選", variant: "sage" },
};

const RIBBON_MAP: Record<string, { label: string; variant: RibbonVariant }> = {
  [STORE_TAG.EMERGENCY]: { label: "急售", variant: "default" },
  [STORE_TAG.RECOMMENDED]: { label: "精選", variant: "sage" },
  [STORE_TAG.CHEAP]: { label: "划算", variant: "mus" },
};

const RIBBON_PRIORITY = [
  STORE_TAG.EMERGENCY,
  STORE_TAG.RECOMMENDED,
  STORE_TAG.CHEAP,
];

function storeToCard(store: Store): StoreCardType {
  const tags = store.tags ?? [];

  const ribbonTag = RIBBON_PRIORITY.find((tag) => tags.includes(tag));
  const ribbon = ribbonTag ? RIBBON_MAP[ribbonTag] : undefined;

  const categoryEntry = STORE_CATEGORIES.find(
    (cat) => cat.key === store.category,
  );
  const categoryLabel = categoryEntry?.label ?? store.category;

  const tagPills = [
    ...tags.map(
      (tag) =>
        TAG_MAP[tag] ?? { label: tag, variant: "default" as PillVariant },
    ),
    ...(categoryLabel
      ? [{ label: categoryLabel, variant: "default" as PillVariant }]
      : []),
  ];

  const location =
    store.location ||
    [store.city, store.district].filter(Boolean).join(" · ") ||
    undefined;

  const meta: [string, string][] = [
    ...(categoryLabel ? [["行業", categoryLabel] as [string, string]] : []),
    ...(store.city ? [["城市", store.city] as [string, string]] : []),
  ];

  const price = `NT$ ${Math.round(store.price / 10000)} 萬`;

  return {
    ribbon,
    tags: tagPills,
    title: store.storeName,
    location,
    meta,
    price,
    rent: store.description?.slice(0, 20) ?? "-",
  };
}

export default function ResultsArea({ stores }: { stores: Store[] }) {
  const [sort, setSort] = useState("newest");

  return (
    <div className={styles.area}>
      <div className={styles.controlbar}>
        <div className={styles.count}>
          <span className={styles.countNum}>
            共 <span className={styles.countRange}>{stores.length}</span> 間
          </span>
        </div>
        <Dropdown
          label="排序"
          options={sortOptions}
          value={sort}
          onChange={setSort}
        />
      </div>

      <div className={styles.grid}>
        {stores.map((store) => (
          <StoreCard key={store.id} card={storeToCard(store)} />
        ))}
      </div>

      <div className={styles.saveCta}>
        <div>
          <div className={styles.saveCtaTitle}>沒找到合適的？</div>
          <div className={styles.saveCtaSub}>
            儲存搜尋條件 · 有新刊登時主動 email / LINE 通知你
          </div>
        </div>
        <button className={styles.saveCtaBtn}>儲存此搜尋</button>
      </div>
    </div>
  );
}
