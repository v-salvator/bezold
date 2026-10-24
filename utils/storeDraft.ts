import type { Store, User } from "@/types";
import {
  DIGITAL_DRAFT_REQUIRED_STORE_FIELDS,
  DIGITAL_DRAFT_SUGGESTED_STORE_FIELDS,
  DRAFT_REQUIRED_SELLER_FIELDS,
  DRAFT_REQUIRED_STORE_FIELDS,
  DRAFT_SUGGESTED_STORE_FIELDS,
} from "@/constant/storeDraft";
import { isDigitalAsset } from "@/utils/store";

export interface DraftChecklist {
  done: number;
  total: number;
  /** 0–100, rounded. */
  percent: number;
  /** Labels of the required fields still empty — 送審 is blocked while any remain. */
  missingRequired: string[];
}

// An empty array (no images) or a blank string counts as unfilled.
const isFilled = (value: unknown) => {
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "string") return value.trim() !== "";
  return value !== undefined && value !== null;
};

/** Completeness of a draft store, including its seller doc (absent → all seller fields missing). */
export const getDraftChecklist = (
  store: Store,
  seller?: Partial<User>,
): DraftChecklist => {
  const isDigital = isDigitalAsset(store);
  const requiredStoreFields = isDigital
    ? DIGITAL_DRAFT_REQUIRED_STORE_FIELDS
    : DRAFT_REQUIRED_STORE_FIELDS;
  const suggestedStoreFields = isDigital
    ? DIGITAL_DRAFT_SUGGESTED_STORE_FIELDS
    : DRAFT_SUGGESTED_STORE_FIELDS;

  const missingRequired = [
    ...requiredStoreFields.filter(({ key }) => !isFilled(store[key])),
    ...DRAFT_REQUIRED_SELLER_FIELDS.filter(
      ({ key }) => !isFilled(seller?.[key]),
    ),
  ].map(({ label }) => label);
  const missingSuggestedCount = suggestedStoreFields.filter(
    ({ key }) => !isFilled(store[key]),
  ).length;

  const total =
    requiredStoreFields.length +
    DRAFT_REQUIRED_SELLER_FIELDS.length +
    suggestedStoreFields.length;
  const done = total - missingRequired.length - missingSuggestedCount;

  return {
    done,
    total,
    percent: Math.round((done / total) * 100),
    missingRequired,
  };
};
