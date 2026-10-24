// * listingType is absent on every store created before digital assets existed
// * — treat missing as physical (see isDigitalAsset in utils/store.ts)
export const LISTING_TYPE = {
  PHYSICAL: "physical",
  DIGITAL: "digital",
} as const;

export type ListingType = (typeof LISTING_TYPE)[keyof typeof LISTING_TYPE];

export const DIGITAL_ASSET_TYPE = {
  SOCIAL: "SOCIAL",
  WEBSITE: "WEBSITE",
  ECOMMERCE: "ECOMMERCE",
  APP: "APP",
  SAAS: "SAAS",
  NEWSLETTER: "NEWSLETTER",
  DIGITAL_PRODUCT: "DIGITAL_PRODUCT",
  OTHERS: "OTHERS",
} as const;

export type DigitalAssetType =
  (typeof DIGITAL_ASSET_TYPE)[keyof typeof DIGITAL_ASSET_TYPE];
