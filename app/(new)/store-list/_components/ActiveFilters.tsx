"use client";

import { useAtom } from "jotai";
import {
  cityAtom,
  tagAtom,
  amountFilterAtom,
  categoryAtom,
  type FilterKey,
} from "@/atoms/SearchFilterAtom";
import { STORE_TAGS } from "@/constant/storeTags";
import styles from "./ActiveFilters.module.css";

export default function ActiveFilters() {
  const [city, setCity] = useAtom(cityAtom);
  const [tag, setTag] = useAtom(tagAtom);
  const [amountFilter, setAmountFilter] = useAtom(amountFilterAtom);
  const [category, setCategory] = useAtom(categoryAtom);

  const filters = [
    city && { key: "city", label: city.key },
    tag && {
      key: "tag",
      label: STORE_TAGS.find((t) => t.key === tag.key)?.label ?? tag.key,
    },
    category && { key: "category", label: category.label as string },
    amountFilter && {
      key: "amountFilter",
      label: amountFilter.label as string,
    },
  ].filter(Boolean) as { key: FilterKey; label: string }[];

  if (filters.length === 0) return null;

  function handleRemove(key: FilterKey) {
    if (key === "city") setCity(undefined);
    if (key === "tag") setTag(undefined);
    if (key === "category") setCategory(undefined);
    if (key === "amountFilter") setAmountFilter(undefined);
  }

  function handleClearAll() {
    setCity(undefined);
    setTag(undefined);
    setCategory(undefined);
    setAmountFilter(undefined);
  }

  return (
    <div className={styles.bar}>
      <span className={styles.label}>已套用：</span>
      {filters.map((f) => (
        <span key={f.key} className={styles.chip}>
          {f.label}
          <button className={styles.remove} onClick={() => handleRemove(f.key)}>
            ×
          </button>
        </span>
      ))}
      <button className={styles.clearAll} onClick={handleClearAll}>
        清除全部
      </button>
    </div>
  );
}
