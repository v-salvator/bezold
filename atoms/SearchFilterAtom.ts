import { atom } from "jotai";
import type { DropDownItem } from "@/components/SearchFilter/DropDowns";

// * base filters
export const cityAtom = atom<DropDownItem | undefined>(undefined);
export const tagAtom = atom<DropDownItem | undefined>(undefined);
export const amountFilterAtom = atom<DropDownItem<number[]> | undefined>(
  undefined
);

// * compose atoms
export const filtersAtom = atom(
  (get) => {
    return {
      city: get(cityAtom),
      tag: get(tagAtom),
      amountFilter: get(amountFilterAtom),
    };
  },
  (
    _get,
    set,
    newValue: {
      city?: DropDownItem;
      tag?: DropDownItem;
      amountFilter?: DropDownItem<number[]>;
    }
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
        }
      });
    }
  }
);

// * drawer ui
type FilterKey = "city" | "tag" | "amountFilter";
export const activeDrawerCardAtom = atom<FilterKey | undefined>("city");
