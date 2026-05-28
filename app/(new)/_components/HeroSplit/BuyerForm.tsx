"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Dropdown from "@/components/refactored/Dropdown";
import { cityItems, amountItems } from "@/components/SearchFilter/DropDowns";
import { STORE_CATEGORIES } from "@/constant/storeType";
import styles from "./HeroSplit.module.css";

const cityOptions = cityItems.map((item) => ({
  label: item.label as string,
  value: item.key,
}));

const categoryOptions = STORE_CATEGORIES.map((item) => ({
  label: item.label,
  value: item.key,
}));

const amountOptions = amountItems.map((item) => ({
  label: item.label,
  value: item.key,
}));

export default function BuyerForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [city, setCity] = useState("");
  const [category, setCategory] = useState("");
  const [amountKey, setAmountKey] = useState("");

  function buildParams() {
    const params = new URLSearchParams();
    if (city) params.set("city", city);
    if (category) params.set("category", category);
    const amountItem = amountItems.find((item) => item.key === amountKey);
    if (amountItem) {
      const [min, max] = amountItem.value;
      if (min) params.set("amountMin", String(min));
      if (max !== Number.POSITIVE_INFINITY)
        params.set("amountMax", String(max));
    }
    return params;
  }

  return (
    <div className={styles.form}>
      <Dropdown
        label="地區"
        options={cityOptions}
        value={city}
        onChange={setCity}
        placeholder="選擇縣市"
      />
      <Dropdown
        label="行業"
        options={categoryOptions}
        value={category}
        onChange={setCategory}
        placeholder="餐飲 · 飲料 · 零售 …"
      />
      <Dropdown
        label="頂讓金"
        options={amountOptions}
        value={amountKey}
        onChange={setAmountKey}
        placeholder="不限"
      />
      <button
        type="button"
        className={styles.btn}
        onClick={() =>
          startTransition(() =>
            router.push(`/store-list?${buildParams().toString()}`),
          )
        }
        disabled={isPending}
      >
        {isPending ? "搜尋中…" : "瀏覽符合的店 →"}
      </button>
    </div>
  );
}
