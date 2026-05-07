"use client";

import styles from "./SearchBar.module.css";
import Button from "@/components/refactored/Button";
import Dropdown from "@/components/refactored/Dropdown";
import { useAtom } from "jotai";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import {
  cityAtom,
  tagAtom,
  amountFilterAtom,
  categoryAtom,
} from "@/atoms/SearchFilterAtom";
import {
  cityItems,
  tagItems,
  amountItems,
} from "@/components/SearchFilter/DropDowns";
import { STORE_TAGS } from "@/constant/storeTags";
import { STORE_CATEGORIES } from "@/constant/storeType";

export default function SearchBar() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [city, setCity] = useAtom(cityAtom);
  const [tag, setTag] = useAtom(tagAtom);
  const [amountFilter, setAmountFilter] = useAtom(amountFilterAtom);
  const [category, setCategory] = useAtom(categoryAtom);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (city?.key) params.set("city", city.key);
    if (tag?.key && tag.key !== "all") params.set("tag", tag.key);
    if (category?.key) params.set("category", category.key);
    if (amountFilter?.value) {
      const [min, max] = amountFilter.value;
      if (min) params.set("amountMin", String(min));
      if (max !== Number.POSITIVE_INFINITY)
        params.set("amountMax", String(max));
    }
    startTransition(() => {
      router.push(`/new/store-list?${params.toString()}`);
    });
  };

  return (
    <div className={styles.searchbar}>
      <Dropdown
        label="地區"
        options={cityItems.map((item) => ({
          label: item.label,
          value: item.key,
        }))}
        value={city?.key ?? ""}
        onChange={(value) =>
          setCity(cityItems.find((item) => item.key === value))
        }
      />
      <Dropdown
        label="Tag"
        options={STORE_TAGS.map((item) => ({
          label: item.label,
          value: item.key,
        }))}
        value={tag?.key ?? ""}
        onChange={(value) =>
          setTag(tagItems.find((item) => item.key === value))
        }
      />
      <Dropdown
        label="行業"
        options={STORE_CATEGORIES.map((item) => ({
          label: item.label,
          value: item.key,
        }))}
        value={category?.key ?? ""}
        onChange={(value) =>
          setCategory(STORE_CATEGORIES.find((item) => item.key === value))
        }
      />
      <Dropdown
        label="頂讓金"
        options={amountItems.map((item) => ({
          label: item.label,
          value: item.key,
        }))}
        value={amountFilter?.key ?? ""}
        onChange={(value) =>
          setAmountFilter(amountItems.find((item) => item.key === value))
        }
      />
      <Button onClick={handleSearch} disabled={isPending}>
        {isPending ? "搜尋中…" : "🔍 搜尋"}
      </Button>
    </div>
  );
}
