"use client";

import styles from "./SearchBar.module.css";
import Button from "@/components/refactored/Button";
import Dropdown from "@/components/refactored/Dropdown";
import { useAtom } from "jotai";
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

export type SearchFilters = {
  keyword: string;
  area: string;
  industry: string;
  price: string;
};

export default function SearchBar() {
  const [city, setCity] = useAtom(cityAtom);
  const [tag, setTag] = useAtom(tagAtom);
  const [amountFilter, setAmountFilter] = useAtom(amountFilterAtom);
  const [category, setCategory] = useAtom(categoryAtom);

  const handleSearch = () => {
    console.log("city", city);
    console.log("tag", tag);
    console.log("amountFilter", amountFilter);
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
      <Button onClick={handleSearch}>🔍 搜尋</Button>
    </div>
  );
}
