import { type PillVariant } from "@/components/refactored/Pill";
import { type RibbonVariant } from "@/components/refactored/StoreCard";
import { STORE_TAG } from "@/types";

export const TAG_DISPLAY: Record<
  string,
  { label: string; variant: PillVariant }
> = {
  [STORE_TAG.EMERGENCY]: { label: "急售", variant: "warm" },
  [STORE_TAG.HOT]: { label: "熱門", variant: "default" },
  [STORE_TAG.CHEAP]: { label: "划算", variant: "default" },
  [STORE_TAG.RECOMMENDED]: { label: "精選", variant: "sage" },
};

export const RIBBON_DISPLAY: Record<
  string,
  { label: string; variant: RibbonVariant }
> = {
  [STORE_TAG.EMERGENCY]: { label: "急售", variant: "default" },
  [STORE_TAG.RECOMMENDED]: { label: "精選", variant: "sage" },
  [STORE_TAG.CHEAP]: { label: "划算", variant: "mus" },
};

export const RIBBON_PRIORITY = [
  STORE_TAG.EMERGENCY,
  STORE_TAG.RECOMMENDED,
  STORE_TAG.CHEAP,
];
