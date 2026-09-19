// * Shared shape + rules for the public store form, used by both the /sell
// * create flow (SellForm) and the /my-listings edit flow (EditListingForm).
// * Keep field editing/validation here so the two forms can't drift apart.

export interface StoreFields {
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

export function emptyStoreFields(): StoreFields {
  return {
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

/**
 * Validates the shared store + contact fields. Returns the parsed 頂讓金 amount
 * on success, or an error message string to display on failure.
 */
export function validateStoreForm(
  store: StoreFields,
  boss: BossFields,
): { ok: false; error: string } | { ok: true; priceValue: number } {
  if (!store.storeName || !store.location || !store.description) {
    return { ok: false, error: "請填寫店面名稱、地址與描述" };
  }
  // * empty ≠ zero: an empty field is only allowed when 「價格可議」 is checked
  // * (→ 面議). An explicit 0 is a valid price (免頂讓金).
  const priceTrimmed = store.price.trim();
  if (!priceTrimmed && !store.priceNegotiable) {
    return { ok: false, error: "請填寫頂讓金，或勾選「價格可議」" };
  }
  const priceValue = priceTrimmed ? Number(priceTrimmed) : 0;
  if (Number.isNaN(priceValue) || priceValue < 0) {
    return { ok: false, error: "頂讓金請填寫有效數字" };
  }
  if (!boss.userName || !boss.phone) {
    return { ok: false, error: "請填寫聯絡人姓名與電話" };
  }
  return { ok: true, priceValue };
}
