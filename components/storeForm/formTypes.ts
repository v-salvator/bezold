// * Shared shape + rules for the public store form, used by both the /sell
// * create flow (SellForm) and the /my-listings edit flow (EditListingForm).
// * Keep field editing/validation here so the two forms can't drift apart.

import {
  type DigitalAssetType,
  type ListingType,
  LISTING_TYPE,
} from "@/types/DigitalAsset";

export interface StoreFields {
  listingType: ListingType;
  storeName: string;
  city: string;
  district: string;
  location: string;
  description: string;
  price: string;
  priceNegotiable: boolean;
  category: string;
  areaPing: string;
  monthlyRent: string;
  equipment: string;
  // * digital only — numbers stay typed strings until digitalAssetWriteFields()
  digitalTypes: DigitalAssetType[];
  operatingYears: string;
  monthlyRevenue: string;
  priceMax: string;
  assetUrl: string;
}

export interface BossFields {
  userName: string;
  phone: string;
  email: string;
  lineId: string;
  threadsId: string;
  remark: string;
}

export type StoreFieldChange = <K extends keyof StoreFields>(
  key: K,
  value: StoreFields[K],
) => void;

export type BossFieldChange = <K extends keyof BossFields>(
  key: K,
  value: BossFields[K],
) => void;

export function emptyStoreFields(
  listingType: ListingType = LISTING_TYPE.PHYSICAL,
): StoreFields {
  return {
    listingType,
    storeName: "",
    city: "",
    district: "",
    location: "",
    description: "",
    price: "",
    priceNegotiable: false,
    category: "",
    areaPing: "",
    monthlyRent: "",
    equipment: "",
    digitalTypes: [],
    operatingYears: "",
    monthlyRevenue: "",
    priceMax: "",
    assetUrl: "",
  };
}

// * the physical inputs exactly as SellForm has always sent them (raw
// * strings, so an empty optional field stays "") — the digital-only inputs
// * never reach a physical doc, whose rules don't accept them
export function physicalFormFields(store: StoreFields) {
  return {
    storeName: store.storeName,
    city: store.city,
    district: store.district,
    location: store.location,
    description: store.description,
    price: store.price,
    priceNegotiable: store.priceNegotiable,
    category: store.category,
    areaPing: store.areaPing,
    monthlyRent: store.monthlyRent,
    equipment: store.equipment,
  };
}

export function emptyBossFields(): BossFields {
  return {
    userName: "",
    phone: "",
    email: "",
    lineId: "",
    threadsId: "",
    remark: "",
  };
}

type ValidationResult =
  { ok: false; error: string } | { ok: true; priceValue: number };

// * the asset link is only for admins to check the listing — any web address
const ASSET_URL_PATTERN = /^https?:\/\/\S+$/i;

// * "" passes (optional); otherwise a number ≥ 0
const isOptionalNonNegative = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return true;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) && parsed >= 0;
};

/**
 * Validates the shared store + contact fields. Returns the parsed 頂讓金 amount
 * on success, or an error message string to display on failure.
 */
export function validateStoreForm(
  store: StoreFields,
  boss: BossFields,
): ValidationResult {
  const isDigital = store.listingType === LISTING_TYPE.DIGITAL;
  const priceLabel = isDigital ? "價格" : "頂讓金";

  if (isDigital) {
    if (!store.storeName || !store.description) {
      return { ok: false, error: "請填寫資產名稱與描述" };
    }
    if (store.digitalTypes.length === 0) {
      return { ok: false, error: "請至少選擇一個資產類型" };
    }
    if (!ASSET_URL_PATTERN.test(store.assetUrl.trim())) {
      return {
        ok: false,
        error: "請填寫資產連結（http:// 或 https:// 開頭）",
      };
    }
  } else if (!store.storeName || !store.location || !store.description) {
    return { ok: false, error: "請填寫店面名稱、地址與描述" };
  }

  // * empty ≠ zero: an empty field is only allowed when 「價格可議」 is checked
  // * (→ 面議). An explicit 0 is a valid price (免頂讓金).
  const priceTrimmed = store.price.trim();
  if (!priceTrimmed && !store.priceNegotiable) {
    return { ok: false, error: `請填寫${priceLabel}，或勾選「價格可議」` };
  }
  const priceValue = priceTrimmed ? Number(priceTrimmed) : 0;
  if (Number.isNaN(priceValue) || priceValue < 0) {
    return { ok: false, error: `${priceLabel}請填寫有效數字` };
  }

  if (isDigital) {
    const priceMaxTrimmed = store.priceMax.trim();
    if (
      priceMaxTrimmed &&
      (!isOptionalNonNegative(priceMaxTrimmed) ||
        Number(priceMaxTrimmed) < priceValue)
    ) {
      return { ok: false, error: "價格上限請填寫有效數字，且不能低於下限" };
    }
    if (!isOptionalNonNegative(store.operatingYears)) {
      return { ok: false, error: "經營時間請填寫 0 以上的數字" };
    }
    if (!isOptionalNonNegative(store.monthlyRevenue)) {
      return { ok: false, error: "平均月營收請填寫 0 以上的數字" };
    }
  }

  if (!boss.userName || !boss.phone) {
    return { ok: false, error: "請填寫聯絡人姓名與電話" };
  }
  return { ok: true, priceValue };
}
