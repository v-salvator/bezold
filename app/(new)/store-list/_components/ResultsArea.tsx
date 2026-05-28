"use client";

import { useState } from "react";
import styles from "./ResultsArea.module.css";
import StoreCard, {
  type StoreCard as StoreCardType,
} from "@/components/refactored/StoreCard";
import Dropdown, {
  type DropdownOption,
} from "@/components/refactored/Dropdown";
import { type Store, STORE_STATUS } from "@/types";
import { storeToCard } from "@/utils/store";

const sortOptions: DropdownOption[] = [
  { label: "頂讓金：低 → 高", value: "price-asc" },
  { label: "頂讓金：高 → 低", value: "price-desc" },
  { label: "最新上架", value: "newest" },
];

function sortStores(stores: Store[], sort: string): Store[] {
  const sorted = [...stores];
  if (sort === "price-asc") return sorted.sort((a, b) => a.price - b.price);
  if (sort === "price-desc") return sorted.sort((a, b) => b.price - a.price);
  return sorted.sort((a, b) => b.updateTime.getTime() - a.updateTime.getTime());
}

export default function ResultsArea({ stores }: { stores: Store[] }) {
  const [sort, setSort] = useState("newest");
  const approvedStores = stores.filter(
    (store) => store.status === STORE_STATUS.APPROVED,
  );
  const sortedStores = sortStores(approvedStores, sort);

  return (
    <div className={styles.area}>
      <div className={styles.controlbar}>
        <div className={styles.count}>
          <span className={styles.countNum}>
            共{" "}
            <span className={styles.countRange}>{approvedStores.length}</span>{" "}
            間
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
          <a
            key={store.id}
            href={`/new/store/${store.id}`}
            className={styles.cardLink}
          >
            <StoreCard card={storeToCard(store)} />
          </a>
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
