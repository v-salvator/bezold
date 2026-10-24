import {
  LISTING_TYPE,
  STORE_TAG,
  type ListingType,
  type StoreStatus,
  type StoreTag,
} from "@/types";

// Ant Design Tag colours / labels for the admin store list and its drawer.
export const STATUS_COLOR: Record<StoreStatus, string> = {
  pending: "orange",
  approved: "green",
  rejected: "red",
  sold: "default",
  draft: "purple",
};

export const STATUS_LABEL: Record<StoreStatus, string> = {
  pending: "待審核",
  approved: "已上架",
  rejected: "已拒絕",
  sold: "已頂讓",
  draft: "草稿",
};

// Explicit per-tag colours so each tag reads distinctly (the old length-based
// heuristic collapsed RECOMMENDED and DETAILED_DATA into the same blue).
export const TAG_COLOR: Record<StoreTag, string> = {
  [STORE_TAG.CHEAP]: "green",
  [STORE_TAG.EMERGENCY]: "volcano",
  [STORE_TAG.RECOMMENDED]: "geekblue",
  [STORE_TAG.DETAILED_DATA]: "purple",
};

export type ListingFilter = ListingType | "all";

export const LISTING_FILTER_OPTIONS: { label: string; value: ListingFilter }[] =
  [
    { label: "所有類型", value: "all" },
    { label: "實體店面", value: LISTING_TYPE.PHYSICAL },
    { label: "數位資產", value: LISTING_TYPE.DIGITAL },
  ];

export const LISTING_TYPE_LABEL: Record<ListingType, string> = {
  physical: "實體",
  digital: "數位",
};

// purple is taken by draft — digital uses cyan so the two never read alike
export const LISTING_TYPE_COLOR: Record<ListingType, string> = {
  physical: "default",
  digital: "cyan",
};
