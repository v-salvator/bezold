import { atom } from "jotai";
import type { DropDownItem } from "@/components/SearchFilter/DropDowns";

// * base filters
export const cityAtom = atom<DropDownItem | undefined>(undefined);
export const tagAtom = atom<DropDownItem | undefined>(undefined);
export const amountFilterAtom = atom<DropDownItem<number[]> | undefined>(
  undefined,
);
export const categoryAtom = atom<DropDownItem | undefined>(undefined);

// * compose atoms
export const filtersAtom = atom(
  (get) => {
    return {
      city: get(cityAtom),
      tag: get(tagAtom),
      amountFilter: get(amountFilterAtom),
      category: get(categoryAtom),
    };
  },
  (
    _get,
    set,
    newValue: {
      city?: DropDownItem;
      tag?: DropDownItem;
      amountFilter?: DropDownItem<number[]>;
      category?: DropDownItem;
    },
  ) => {
    if (newValue) {
      Object.keys(newValue).forEach((key) => {
        switch (key) {
          case "city":
            set(cityAtom, newValue.city);
            break;
          case "tag":
            set(tagAtom, newValue.tag);
            break;
          case "amountFilter":
            set(amountFilterAtom, newValue.amountFilter);
            break;
          case "category":
            set(categoryAtom, newValue.category);
            break;
        }
      });
    }
  },
);

// * drawer ui
export type FilterKey = "city" | "tag" | "amountFilter" | "category";
export const activeDrawerCardAtom = atom<FilterKey | undefined>("city");
