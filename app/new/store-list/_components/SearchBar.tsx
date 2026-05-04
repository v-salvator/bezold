"use client";

import { useState } from "react";
import styles from "./SearchBar.module.css";
import Button from "@/components/refactored/Button";
import Dropdown, {
  type DropdownOption,
} from "@/components/refactored/Dropdown";

const areaOptions: DropdownOption[] = [
  { label: "不限", value: "", count: 412 },
  { label: "台北市", value: "taipei", count: 213 },
  { label: "新北市", value: "new-taipei", count: 98 },
  { label: "桃園市", value: "taoyuan", count: 45 },
  { label: "台中市", value: "taichung", count: 67 },
  { label: "台南市", value: "tainan", count: 31 },
  { label: "高雄市", value: "kaohsiung", count: 28 },
  { label: "其他", value: "other", count: 30 },
];

const industryOptions: DropdownOption[] = [
  { label: "不限", value: "", count: 412 },
  { label: "餐飲", value: "food", count: 118 },
  { label: "服飾", value: "fashion", count: 36 },
  { label: "美容 / 美髮", value: "beauty", count: 54 },
  { label: "服務業", value: "service", count: 28 },
  { label: "便利商店", value: "convenience", count: 11 },
  { label: "教育 / 補習", value: "education", count: 9 },
  { label: "其他", value: "other", count: 156 },
];

const priceOptions: DropdownOption[] = [
  { label: "不限", value: "" },
  { label: "50 萬以下", value: "lt50" },
  { label: "50 – 100 萬", value: "50-100" },
  { label: "100 – 200 萬", value: "100-200" },
  { label: "200 萬以上", value: "gt200" },
];

export default function SearchBar() {
  const [keyword, setKeyword] = useState("");
  const [area, setArea] = useState("");
  const [industry, setIndustry] = useState("");
  const [price, setPrice] = useState("");

  function handleSearch() {
    console.log("搜尋條件", { keyword, area, industry, price });
  }

  return (
    <div className={styles.searchbar}>
      <div className={`${styles.field} ${styles.fieldInput}`}>
        <span className={styles.label}>關鍵字</span>
        <input
          className={styles.input}
          placeholder="店名 / 街名 / 行業…"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
      </div>
      <Dropdown
        label="地區"
        options={areaOptions}
        value={area}
        onChange={setArea}
      />
      <Dropdown
        label="行業"
        options={industryOptions}
        value={industry}
        onChange={setIndustry}
      />
      <Dropdown
        label="頂讓金"
        options={priceOptions}
        value={price}
        onChange={setPrice}
      />
      <Button onClick={handleSearch}>🔍 搜尋</Button>
    </div>
  );
}
