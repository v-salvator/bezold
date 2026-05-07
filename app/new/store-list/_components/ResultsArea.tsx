"use client";

import { useState } from "react";
import styles from "./ResultsArea.module.css";
import StoreCard, {
  type StoreCard as StoreCardType,
} from "@/components/refactored/StoreCard";
import Dropdown, {
  type DropdownOption,
} from "@/components/refactored/Dropdown";
import { type PillVariant } from "@/components/refactored/Pill";
import { type Store } from "@/types";
import { STORE_CATEGORIES } from "@/constant/storeType";
import {
  TAG_DISPLAY,
  RIBBON_DISPLAY,
  RIBBON_PRIORITY,
} from "@/constant/storeDisplay";

const sortOptions: DropdownOption[] = [
  { label: "頂讓金：低 → 高", value: "price-asc" },
  { label: "頂讓金：高 → 低", value: "price-desc" },
  { label: "最新上架", value: "newest" },
];

function storeToCard(store: Store): StoreCardType {
  const tags = store.tags ?? [];

  const ribbonTag = RIBBON_PRIORITY.find((tag) => tags.includes(tag));
  const ribbon = ribbonTag ? RIBBON_DISPLAY[ribbonTag] : undefined;

  const categoryEntry = STORE_CATEGORIES.find(
    (cat) => cat.key === store.category,
  );
  const categoryLabel = categoryEntry?.label ?? store.category;

  const tagPills = [
    ...tags.map(
      (tag) =>
        TAG_DISPLAY[tag] ?? { label: tag, variant: "default" as PillVariant },
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

function sortStores(stores: Store[], sort: string): Store[] {
  const sorted = [...stores];
  if (sort === "price-asc") return sorted.sort((a, b) => a.price - b.price);
  if (sort === "price-desc") return sorted.sort((a, b) => b.price - a.price);
  return sorted.sort((a, b) => b.updateTime.getTime() - a.updateTime.getTime());
}

export default function ResultsArea({ stores }: { stores: Store[] }) {
  const [sort, setSort] = useState("newest");
  const sortedStores = sortStores(stores, sort);

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
        {sortedStores.map((store) => (
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
