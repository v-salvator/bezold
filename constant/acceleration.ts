// Seller-facing "頂讓加速包" (acceleration package) upsell data.
// All CTAs open a single Google Form in a new tab; the form asks which listing.
export const ACCELERATION_FORM_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSe9jLu3b0V1347kJCwrA3l7YHMRRk--OmUOakg8oCL2kdw_uQ/viewform?usp=header";

export type AccelerationPlanId = "basic" | "hot" | "urgent";

export interface AccelerationPlanRow {
  /** Icon key resolved by the PlanCard (see PackageGrid). */
  icon: "google" | "service" | "period" | "views";
  text: string;
}

export interface AccelerationPlan {
  id: AccelerationPlanId;
  icon: "rocket" | "flame" | "zap";
  name: string;
  price: string;
  rows: AccelerationPlanRow[];
  features: string[];
  cta: string;
  featured?: boolean;
  badge?: string;
}

export const ACCELERATION_PLANS: AccelerationPlan[] = [
  {
    id: "basic",
    icon: "rocket",
    name: "基礎加速包",
    price: "1,500",
    rows: [
      { icon: "google", text: "Google 廣告費：NT$1,000" },
      { icon: "service", text: "建置與優化服務費：NT$500" },
      { icon: "period", text: "投放期間：14 天" },
      { icon: "views", text: "預估瀏覽店家資料：25–60 人" },
    ],
    features: ["BEZOLD 站內置頂 7 天", "BEZOLD 社群曝光 1 次", "結案報告"],
    cta: "選擇基礎方案",
  },
  {
    id: "hot",
    icon: "flame",
    name: "熱門加速包",
    price: "3,000",
    featured: true,
    badge: "最多店主選擇",
    rows: [
      { icon: "google", text: "Google 廣告費：NT$2,200" },
      { icon: "service", text: "建置與優化服務費：NT$800" },
      { icon: "period", text: "投放期間：30 天" },
      { icon: "views", text: "預估瀏覽店家資料：55–130 人" },
    ],
    features: ["BEZOLD 站內置頂 30 天", "BEZOLD 社群曝光 2 次", "結案報告"],
    cta: "選擇熱門方案",
  },
  {
    id: "urgent",
    icon: "zap",
    name: "急售加速包",
    price: "6,000",
    rows: [
      { icon: "google", text: "Google 廣告費：NT$4,500" },
      { icon: "service", text: "建置與優化服務費：NT$1,500" },
      { icon: "period", text: "投放期間：30 天" },
      { icon: "views", text: "預估瀏覽店家資料：110–260 人" },
    ],
    features: [
      "BEZOLD 站內優先排序置頂 30 天",
      "BEZOLD 社群曝光 4 次",
      "結案報告",
    ],
    cta: "選擇急售方案",
  },
];
