export const STORE_CATEGORY = {
  RESTAURANT: "RESTAURANT",
  CLOTHING: "CLOTHING",
  FACTORY: "FACTORY",
  DEPARTMENT: "DEPARTMENT",
  OTHERS: "OTHERS",
} as const;

export type StoreCategory =
  (typeof STORE_CATEGORY)[keyof typeof STORE_CATEGORY];
