import type { Store, User } from "@/types";

export interface DraftField<Source> {
  key: keyof Source;
  label: string;
}

// Must be filled before a draft can be sent for review (送審). Same set the
// admin Store Create form requires.
export const DRAFT_REQUIRED_STORE_FIELDS: DraftField<Store>[] = [
  { key: "storeName", label: "店名" },
  { key: "location", label: "地址" },
  { key: "description", label: "描述" },
];

export const DRAFT_REQUIRED_SELLER_FIELDS: DraftField<User>[] = [
  { key: "userName", label: "賣家姓名" },
  { key: "phone", label: "賣家電話" },
];

// Counted towards completeness but never block 送審.
export const DRAFT_SUGGESTED_STORE_FIELDS: DraftField<Store>[] = [
  { key: "city", label: "城市" },
  { key: "district", label: "區域" },
  { key: "category", label: "類別" },
  { key: "images", label: "圖片" },
];
