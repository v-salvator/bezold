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

// Digital assets have no address — the admin create form requires these
// instead (see StoreBaseForm).
export const DIGITAL_DRAFT_REQUIRED_STORE_FIELDS: DraftField<Store>[] = [
  { key: "storeName", label: "名稱" },
  { key: "description", label: "描述" },
  { key: "assetUrl", label: "資產連結" },
  { key: "digitalTypes", label: "類型" },
];

export const DIGITAL_DRAFT_SUGGESTED_STORE_FIELDS: DraftField<Store>[] = [
  { key: "operatingYears", label: "經營時間" },
  { key: "monthlyRevenue", label: "平均月營收" },
  { key: "images", label: "圖片" },
];
