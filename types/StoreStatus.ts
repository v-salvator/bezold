export const STORE_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
  SOLD: "sold",
} as const;

export type StoreStatus = (typeof STORE_STATUS)[keyof typeof STORE_STATUS];
