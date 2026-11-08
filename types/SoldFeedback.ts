import type { Timestamp } from "firebase-admin/firestore";

// * how a store got marked sold — also stored on the store as `soldVia`
export const SOLD_VIA = {
  FOLLOW_UP_EMAIL: "follow-up-email",
  MY_LISTINGS: "my-listings",
} as const;

export type SoldVia = (typeof SOLD_VIA)[keyof typeof SOLD_VIA];

// * 從刊登到頂讓成功花了多久
export const SOLD_DURATION = {
  UNDER_1M: "under_1m",
  M1_TO_3: "1_to_3m",
  M3_TO_6: "3_to_6m",
  OVER_6M: "over_6m",
} as const;

export type SoldDuration = (typeof SOLD_DURATION)[keyof typeof SOLD_DURATION];

// * 買家是從哪裡來的
export const BUYER_SOURCE = {
  BEZOLD: "bezold",
  OTHER_PLATFORM: "other_platform",
  REFERRAL: "referral",
  LANDLORD_AGENT: "landlord_agent",
  OTHER: "other",
} as const;

export type BuyerSource = (typeof BUYER_SOURCE)[keyof typeof BUYER_SOURCE];

export type Satisfaction = 1 | 2 | 3 | 4 | 5;

// * one seller's 頂讓回饋. Doc id = storeId (one per store). Admin SDK only.
export interface SoldFeedbackDoc {
  storeId: string;
  storeName: string; // * snapshot — admin needs no join
  listedPrice: number; // * snapshot of store.price (NT$) — for 成交價 ÷ 刊登價
  listedPriceNegotiable: boolean; // * snapshot — 面議 / 免頂讓金 get no ratio
  soldVia: SoldVia;
  soldDuration: SoldDuration | null;
  buyerSource: BuyerSource | null;
  finalPrice: number | null; // * NT$ (entered in 萬)
  satisfaction: Satisfaction | null;
  comment: string; // * "" or ≤ 500 chars
  createTime: Timestamp;
}
