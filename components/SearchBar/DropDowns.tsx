"use client";
import { getTwCities, getTwDistricts } from "@/utils";
import { STORE_TYPES } from "@/constant/storeType";

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

export const typeItems = [
  {
    label: "所有",
    key: "all",
  },
  ...STORE_TYPES,
  {
    label: "其他",
    key: "others",
  },
];

export const amountItems = [
  {
    label: "below 50w",
    key: "0-50",
    value: [0, 50],
  },
  {
    label: "50w ~ 100w",
    key: "50-100",
    value: [50, 100],
  },
  {
    label: "100w ~ 150w",
    key: "100-150",
    value: [100, 150],
  },
  {
    label: "150w ~ 200w",
    key: "150-200",
    value: [150, 200],
  },
  {
    label: "above 200w",
    key: "200-",
    value: [200, Number.POSITIVE_INFINITY],
  },
];
