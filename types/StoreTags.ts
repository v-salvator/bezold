export const STORE_TAG = {
  CHEAP: "CHEAP",
  EMERGENCY: "EMERGENCY",
  RECOMMENDED: "RECOMMENDED",
} as const;

export type StoreTag = (typeof STORE_TAG)[keyof typeof STORE_TAG];
