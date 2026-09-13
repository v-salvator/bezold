"use client";
import * as React from "react";
import { getTwCities } from "@/utils";

export type DropDownItem<T = undefined> = {
  label: string | React.ReactNode;
  key: string;
  value?: T;
};

export const cityItems = getTwCities().map((cityName) => {
  return {
    label: cityName,
    key: cityName,
  };
});

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
