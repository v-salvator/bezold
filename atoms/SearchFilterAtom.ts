import { atom } from "jotai";
import type { DropDownItem } from "@/components/SearchFilter/DropDowns";

// * base filters
export const cityAtom = atom<DropDownItem | undefined>(undefined);
export const tagAtom = atom<DropDownItem | undefined>(undefined);
export const amountFilterAtom = atom<DropDownItem<number[]> | undefined>(
  undefined,
);
export const categoryAtom = atom<DropDownItem | undefined>(undefined);

// * active filter keys — used by the store-list ActiveFilters chips
export type FilterKey = "city" | "tag" | "amountFilter" | "category";
