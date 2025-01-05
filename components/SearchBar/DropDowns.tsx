"use client";
import { getTwCities, getTwDistricts } from "@/utils";
import { STORE_CATEGORIES } from "@/constant/storeType";
import { STORE_TAGS } from "@/constant/storeTags";

import TagIcon from "../TagIcon";

export type DropDownItem<T = undefined> = {
  label: string;
  key: string;
  value?: T;
};

export const cityItems = getTwCities().map((cityName) => {
  return {
    label: cityName,
    key: cityName,
  };
});

export const districtItems = (city?: string) => {
  if (!city) return [];
  return getTwDistricts(city).map((district) => {
    return {
      label: district.name,
      key: district.name,
      value: district.zip,
    };
  });
};

export const tagItems = [
  {
    label: "所有",
    key: "all",
  },
  ...STORE_TAGS,
].map((tag) => {
  if (tag.key === "all") return tag;
  return {
    ...tag,
    label: (
      <>
        <TagIcon tag={tag.key}></TagIcon>
        <span className="ml-[4px]">{tag.label}</span>
      </>
    ),
    key: tag.key,
  };
});

export const typeItems = [
  {
    label: "所有",
    key: "all",
  },
  ...STORE_CATEGORIES,
];

export const amountItems = [
  {
    label: "低於 50萬",
    key: "0-50",
    value: [0, 50],
  },
  {
    label: "50 ~ 100萬",
    key: "50-100",
    value: [50, 100],
  },
  {
    label: "100 ~ 150萬",
    key: "100-150",
    value: [100, 150],
  },
  {
    label: "150 ~ 200萬",
    key: "150-200",
    value: [150, 200],
  },
  {
    label: "高於 200萬",
    key: "200-",
    value: [200, Number.POSITIVE_INFINITY],
  },
];
