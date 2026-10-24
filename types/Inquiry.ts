import type { Timestamp } from "firebase-admin/firestore";

export const INQUIRY_STATUS = {
  NEW: "new",
  CONTACTED: "contacted",
  CLOSED: "closed",
} as const;

export type InquiryStatus =
  (typeof INQUIRY_STATUS)[keyof typeof INQUIRY_STATUS];

// * a buyer's request to learn more about a digital asset. Doc id is
// * `${storeId}_${buyerUid}` — one inquiry per buyer per asset.
export interface InquiryDoc {
  storeId: string;
  storeName: string; // * snapshot at submit time — the admin list needs no join
  buyerUid: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  message: string; // * may be "", at most INQUIRY_MESSAGE_MAX_LENGTH chars
  status: InquiryStatus;
  createTime: Timestamp;
  updateTime: Timestamp;
}

export interface Inquiry extends Omit<InquiryDoc, "createTime" | "updateTime"> {
  id: string;
  createTime: Date;
  updateTime: Date;
}
