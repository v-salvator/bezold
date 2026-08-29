"use client";

import { useAtom } from "jotai";
import {
  cityAtom,
  tagAtom,
  amountFilterAtom,
  categoryAtom,
} from "@/atoms/SearchFilterAtom";
import { STORE_TAGS } from "@/constant/storeTags";
import styles from "./ActiveFilters.module.css";

export default function ActiveFilters() {
  const [cities, setCities] = useAtom(cityAtom);
  const [tag, setTag] = useAtom(tagAtom);
  const [amountFilter, setAmountFilter] = useAtom(amountFilterAtom);
  const [category, setCategory] = useAtom(categoryAtom);

  // * one chip per selected city, then the single-select filters
  const chips: { id: string; label: string; onRemove: () => void }[] = [
    ...cities.map((city) => ({
      id: `city:${city.key}`,
      label: city.key,
      onRemove: () => setCities(cities.filter((item) => item.key !== city.key)),
    })),
    ...(tag
      ? [
          {
            id: "tag",
            label: STORE_TAGS.find((t) => t.key === tag.key)?.label ?? tag.key,
            onRemove: () => setTag(undefined),
          },
        ]
      : []),
    ...(category
      ? [
          {
            id: "category",
            label: category.label as string,
            onRemove: () => setCategory(undefined),
          },
        ]
      : []),
    ...(amountFilter
      ? [
          {
            id: "amountFilter",
            label: amountFilter.label as string,
            onRemove: () => setAmountFilter(undefined),
          },
        ]
      : []),
  ];

  if (chips.length === 0) return null;

  function handleClearAll() {
    setCities([]);
    setTag(undefined);
    setCategory(undefined);
    setAmountFilter(undefined);
  }

  return (
    <div className={styles.bar}>
      <span className={styles.label}>已套用：</span>
      {chips.map((chip) => (
        <span key={chip.id} className={styles.chip}>
          {chip.label}
          <button className={styles.remove} onClick={chip.onRemove}>
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
