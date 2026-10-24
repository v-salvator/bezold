import { STORE_CATEGORIES } from "@/constant/storeType";

// Copy for the buyer club popup. One popup, one wording — it only ever renders
// on a store detail page, so promising the seller's contact details reads
// correctly for every entry point: the daily auto-open, the FAB, an ad landing
// and the locks on the seller contact block.
//
// The entry point still matters elsewhere (analytics, and whether the daily
// auto-open cap applies) — see atoms/BuyerClubAtom.ts.

export const BUYER_CLUB_COPY = {
  /** Rendered as two lines with a <br /> between them. */
  asideTitle: ["加入後", "立刻看到聯絡方式"],
  asideLede:
    "為了保護屋主不被騷擾，聯絡方式只開放給買家俱樂部成員。加入是免費的，完成後這一頁的電話與 LINE 會立刻顯示。",
  benefits: [
    "立即解鎖本物件的電話與 LINE",
    "精準配對你的條件",
    "免費加入 · 隨時取消",
  ],
  submit: "免費加入並查看聯絡方式 →",
  submitLoading: "建立中…",
};

// * buyer-club only: a buyer may be looking for a digital asset, but a
// * physical store can never be filed under 數位資產 — so this is NOT added
// * to STORE_CATEGORIES (sell form, /store-list filters, HeroSplit, admin)
export const BUYER_CLUB_DIGITAL_CATEGORY = "DIGITAL_ASSET";

export const BUYER_CLUB_CATEGORIES = [
  ...STORE_CATEGORIES,
  { label: "數位資產", key: BUYER_CLUB_DIGITAL_CATEGORY },
];
