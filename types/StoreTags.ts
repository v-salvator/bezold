export const STORE_TAG = {
  CHEAP: "CHEAP",
  EMERGENCY: "EMERGENCY",
  RECOMMENDED: "RECOMMENDED",
  DETAILED_DATA: "DETAILED_DATA",
} as const;

export type StoreTag = (typeof STORE_TAG)[keyof typeof STORE_TAG];
