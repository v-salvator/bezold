"use client";
import * as React from "react";
import type { MenuProps } from "antd";
import { getTwCities, getTwDistricts } from "@/utils";

export const items: MenuProps["items"] = [
  {
    label: <a href="https://www.antgroup.com">1st menu item</a>,
    key: "0",
  },
  {
    label: <a href="https://www.aliyun.com">2nd menu item</a>,
    key: "1",
  },
  {
    type: "divider",
  },
  {
    label: "3rd menu item",
    key: "3",
  },
];

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
      zip: district.zip,
    };
  });
};

export const typeItems = [
  {
    label: "所有",
    key: "all",
  },
  {
    label: "餐飲",
    key: "restaurant",
  },
  {
    label: "服飾",
    key: "clothing",
  },
  {
    label: "工廠",
    key: "factory",
  },
  {
    label: "百貨",
    key: "department",
  },
  {
    label: "其他",
    key: "others",
  },
];

export const amountItems = [
  {
    label: "below 50w",
    key: "0",
    value: [0, 50],
  },
  {
    label: "50w ~ 100w",
    key: "1",
    value: [50, 100],
  },
  {
    label: "100w ~ 150w",
    key: "2",
    value: [100, 150],
  },
  {
    label: "150w ~ 200w",
    key: "3",
    value: [150, 200],
  },
  {
    label: "above 200w",
    key: "4",
    value: [200, Number.POSITIVE_INFINITY],
  },
];
