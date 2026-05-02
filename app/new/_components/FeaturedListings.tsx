import Section from "./Section";
import SectionTitle from "@/components/refactored/SectionTitle";
import Pill from "@/components/refactored/Pill";
import styles from "./FeaturedListings.module.css";
import StoreCard, {
  type StoreCard as StoreCardType,
} from "@/components/refactored/StoreCard";

const featured: StoreCardType[] = [
  {
    tags: [
      { label: "急售", variant: "warm" },
      { label: "餐飲", variant: "default" },
      { label: "含設備", variant: "mus" },
    ],
    title: "大安溫州街 · 老字號麵店",
    meta: [
      ["坪數", "12 坪"],
      ["月租", "4.8 萬"],
      ["已開", "8 年"],
      ["客群", "學生 / 鄰里"],
    ],
    price: "NT$ 65 萬",
    rent: "月租 / 押金已議",
  },
  {
    tags: [
      { label: "含證照", variant: "sage" },
      { label: "飲料", variant: "default" },
    ],
    title: "中山赤峰 · 手搖飲品牌店",
    meta: [
      ["坪數", "8 坪"],
      ["月租", "3.2 萬"],
      ["已開", "3 年"],
      ["設備", "全新整套"],
    ],
    price: "NT$ 45 萬",
    rent: "押 2 / 含轉約",
  },
  {
    tags: [
      { label: "議價", variant: "mus" },
      { label: "美容", variant: "default" },
    ],
    title: "板橋府中 · 美髮沙龍",
    meta: [
      ["坪數", "22 坪"],
      ["月租", "6 萬"],
      ["椅位", "4 椅"],
      ["客群", "預約穩定"],
    ],
    price: "NT$ 120 萬",
    rent: "含現有客戶",
  },
];

export default function FeaturedListings() {
  return (
    <Section variant="alt">
      <SectionTitle
        num="04"
        title="本週精選 / 急售"
        sub="— 編輯挑選，含設備、地段佳 —"
        more="看全部 412 間 →"
      />
      <div className={styles.listings}>
        {featured.map((card, i) => (
          <StoreCard key={i} card={card} />
        ))}
      </div>
      <div className={styles.tabs}>
        <Pill variant="solid">最新</Pill>
        <Pill>急售</Pill>
        <Pill>熱門收藏</Pill>
        <Pill>編輯精選</Pill>
        <Pill>100 萬以下</Pill>
      </div>
    </Section>
  );
}
