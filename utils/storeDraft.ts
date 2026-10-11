import type { Store, User } from "@/types";
import {
  DRAFT_REQUIRED_SELLER_FIELDS,
  DRAFT_REQUIRED_STORE_FIELDS,
  DRAFT_SUGGESTED_STORE_FIELDS,
} from "@/constant/storeDraft";

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
  const missingRequired = [
    ...DRAFT_REQUIRED_STORE_FIELDS.filter(({ key }) => !isFilled(store[key])),
    ...DRAFT_REQUIRED_SELLER_FIELDS.filter(
      ({ key }) => !isFilled(seller?.[key]),
    ),
  ].map(({ label }) => label);
  const missingSuggestedCount = DRAFT_SUGGESTED_STORE_FIELDS.filter(
    ({ key }) => !isFilled(store[key]),
  ).length;

  const total =
    DRAFT_REQUIRED_STORE_FIELDS.length +
    DRAFT_REQUIRED_SELLER_FIELDS.length +
    DRAFT_SUGGESTED_STORE_FIELDS.length;
  const done = total - missingRequired.length - missingSuggestedCount;

  return {
    done,
    total,
    percent: Math.round((done / total) * 100),
    missingRequired,
  };
};
