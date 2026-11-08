import {
  BUYER_SOURCE,
  SOLD_DURATION,
  type BuyerSource,
  type SoldDuration,
  type SoldVia,
} from "@/types";

// * 頂讓回饋 answers, in the order the form shows them
export const SOLD_DURATION_OPTIONS: { value: SoldDuration; label: string }[] = [
  { value: SOLD_DURATION.UNDER_1M, label: "1 個月內" },
  { value: SOLD_DURATION.M1_TO_3, label: "1–3 個月" },
  { value: SOLD_DURATION.M3_TO_6, label: "3–6 個月" },
  { value: SOLD_DURATION.OVER_6M, label: "6 個月以上" },
];

export const BUYER_SOURCE_OPTIONS: { value: BuyerSource; label: string }[] = [
  { value: BUYER_SOURCE.BEZOLD, label: "透過 Bezold" },
  { value: BUYER_SOURCE.OTHER_PLATFORM, label: "其他頂讓平台" },
  { value: BUYER_SOURCE.REFERRAL, label: "親友介紹" },
  { value: BUYER_SOURCE.LANDLORD_AGENT, label: "房東或仲介" },
  { value: BUYER_SOURCE.OTHER, label: "其他" },
];

export const SOLD_DURATION_LABEL = Object.fromEntries(
  SOLD_DURATION_OPTIONS.map(({ value, label }) => [value, label]),
) as Record<SoldDuration, string>;

export const BUYER_SOURCE_LABEL = Object.fromEntries(
  BUYER_SOURCE_OPTIONS.map(({ value, label }) => [value, label]),
) as Record<BuyerSource, string>;

export const SATISFACTION_LABELS = [
  "點星星評分",
  "很不滿意",
  "不滿意",
  "普通",
  "滿意",
  "非常滿意",
];

export const SOLD_VIA_LABEL: Record<SoldVia, string> = {
  "follow-up-email": "追蹤信",
  "my-listings": "我的刊登",
};
