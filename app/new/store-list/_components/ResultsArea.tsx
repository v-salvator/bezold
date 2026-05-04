"use client";

import { useState } from "react";
import styles from "./ResultsArea.module.css";
import StoreCard, {
  type StoreCard as StoreCardType,
} from "@/components/refactored/StoreCard";
import Dropdown, {
  type DropdownOption,
} from "@/components/refactored/Dropdown";

const sortOptions: DropdownOption[] = [
  { label: "頂讓金：低 → 高", value: "price-asc" },
  { label: "頂讓金：高 → 低", value: "price-desc" },
  { label: "最新上架", value: "newest" },
];

const listings: StoreCardType[] = [
  {
    ribbon: { label: "急售", variant: "default" },
    tags: [
      { label: "急售", variant: "warm" },
      { label: "餐飲", variant: "default" },
      { label: "含設備", variant: "mus" },
    ],
    title: "大安溫州街 · 老字號麵店",
    location: "台北市大安區 · 近台電大樓站 200m",
    meta: [
      ["坪數", "12 坪"],
      ["月租", "4.8 萬"],
      ["已開", "8 年"],
      ["客群", "學生/鄰里"],
    ],
    price: "NT$ 65 萬",
    rent: "含設備",
  },
  {
    ribbon: { label: "含證照", variant: "sage" },
    tags: [
      { label: "含證照", variant: "sage" },
      { label: "飲料", variant: "default" },
    ],
    title: "中山赤峰 · 手搖飲品牌店",
    location: "台北市中山區 · 中山站 3 分鐘",
    meta: [
      ["坪數", "8 坪"],
      ["月租", "3.2 萬"],
      ["已開", "3 年"],
      ["設備", "全新整套"],
    ],
    price: "NT$ 45 萬",
    rent: "押 2 含轉約",
  },
  {
    ribbon: { label: "議價", variant: "mus" },
    tags: [
      { label: "議價", variant: "mus" },
      { label: "咖啡", variant: "default" },
    ],
    title: "大安信義 · 獨立咖啡館",
    location: "台北市大安區 · 信義安和站",
    meta: [
      ["坪數", "18 坪"],
      ["月租", "5.5 萬"],
      ["已開", "4 年"],
      ["客群", "上班族"],
    ],
    price: "NT$ 88 萬",
    rent: "含咖啡機",
  },
  {
    tags: [
      { label: "餐飲", variant: "default" },
      { label: "含設備", variant: "mus" },
    ],
    title: "松山民生社區 · 早午餐店",
    location: "台北市松山區 · 公車站旁",
    meta: [
      ["坪數", "15 坪"],
      ["月租", "4.2 萬"],
      ["已開", "2 年"],
      ["設備", "完整廚房"],
    ],
    price: "NT$ 55 萬",
    rent: "押 2",
  },
  {
    ribbon: { label: "急售", variant: "default" },
    tags: [
      { label: "急售", variant: "warm" },
      { label: "餐飲", variant: "default" },
    ],
    title: "大同迪化街 · 文青小餐館",
    location: "台北市大同區 · 大橋頭站",
    meta: [
      ["坪數", "10 坪"],
      ["月租", "3.8 萬"],
      ["已開", "5 年"],
      ["客群", "觀光/在地"],
    ],
    price: "NT$ 38 萬",
    rent: "含裝潢",
  },
  {
    tags: [
      { label: "餐飲", variant: "default" },
      { label: "含證照", variant: "sage" },
    ],
    title: "信義永春 · 日式定食",
    location: "台北市信義區 · 永春站 200m",
    meta: [
      ["坪數", "20 坪"],
      ["月租", "6.8 萬"],
      ["已開", "6 年"],
      ["座位", "24 席"],
    ],
    price: "NT$ 95 萬",
    rent: "含全套設備",
  },
  {
    ribbon: { label: "早鳥", variant: "mus" },
    tags: [
      { label: "早鳥精選", variant: "mus" },
      { label: "餐飲", variant: "default" },
    ],
    title: "萬華西門 · 鐵板燒",
    location: "台北市萬華區 · 西門站 5 分",
    meta: [
      ["坪數", "14 坪"],
      ["月租", "4 萬"],
      ["已開", "3 年"],
      ["客群", "上班族"],
    ],
    price: "NT$ 60 萬",
    rent: "含吧台",
  },
  {
    tags: [{ label: "餐飲", variant: "default" }],
    title: "中正南門 · 滷味便當店",
    location: "台北市中正區 · 公館商圈",
    meta: [
      ["坪數", "9 坪"],
      ["月租", "3 萬"],
      ["已開", "10 年"],
      ["客群", "學生穩定"],
    ],
    price: "NT$ 42 萬",
    rent: "含設備",
  },
  {
    tags: [
      { label: "餐飲", variant: "default" },
      { label: "含設備", variant: "mus" },
    ],
    title: "士林天母 · 義式餐廳",
    location: "台北市士林區 · 天母商圈",
    meta: [
      ["坪數", "28 坪"],
      ["月租", "7.5 萬"],
      ["已開", "7 年"],
      ["座位", "40 席"],
    ],
    price: "NT$ 120 萬",
    rent: "含烤箱+冷藏",
  },
];

export default function ResultsArea() {
  const [sort, setSort] = useState("newest");

  return (
    <div className={styles.area}>
      <div className={styles.controlbar}>
        <div className={styles.count}>
          <span className={styles.countNum}>
            顯示 <span className={styles.countRange}>1–9</span> / 共 412 間
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
        {listings.map((listing) => (
          <StoreCard key={listing.title} card={listing} />
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
