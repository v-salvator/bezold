export const STORE_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
  SOLD: "sold",
  // * admin-only work in progress — hidden from every public list
  DRAFT: "draft",
} as const;

export type StoreStatus = (typeof STORE_STATUS)[keyof typeof STORE_STATUS];
