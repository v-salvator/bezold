import { atom } from "jotai";
import type { DropDownItem } from "@/components/SearchFilter/DropDowns";

// * base filters
// * city is multi-select — holds zero or more selected cities
export const cityAtom = atom<DropDownItem[]>([]);
export const tagAtom = atom<DropDownItem | undefined>(undefined);
export const amountFilterAtom = atom<DropDownItem<number[]> | undefined>(
  undefined,
);
export const categoryAtom = atom<DropDownItem | undefined>(undefined);
