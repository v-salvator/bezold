import { STORE_TAG, type StoreStatus, type StoreTag } from "@/types";

// Ant Design Tag colours / labels for the admin store list and its drawer.
export const STATUS_COLOR: Record<StoreStatus, string> = {
  pending: "orange",
  approved: "green",
  rejected: "red",
  sold: "default",
};

export const STATUS_LABEL: Record<StoreStatus, string> = {
  pending: "待審核",
  approved: "已上架",
  rejected: "已拒絕",
  sold: "已頂讓",
};

// Explicit per-tag colours so each tag reads distinctly (the old length-based
// heuristic collapsed RECOMMENDED and DETAILED_DATA into the same blue).
export const TAG_COLOR: Record<StoreTag, string> = {
  [STORE_TAG.CHEAP]: "green",
  [STORE_TAG.EMERGENCY]: "volcano",
  [STORE_TAG.RECOMMENDED]: "geekblue",
  [STORE_TAG.DETAILED_DATA]: "purple",
};
