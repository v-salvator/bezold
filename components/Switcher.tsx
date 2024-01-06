"use client";
import * as React from "react";
import { Tabs } from "antd";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCategoryKey } from "@/hooks";

// TODO: moves these mock data to contants folder
const mockData = [
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
    label: "關於",
    key: "about",
  },
];

const Switcher = () => {
  const router = useRouter();
  const categoryKey = useCategoryKey();

  return (
    <div className="p-[16px]">
      <Tabs
        defaultActiveKey={categoryKey}
        items={mockData}
        onChange={(activeKey) => {
          if (activeKey !== "about") {
            router.push(`/store-list?category=${activeKey}`);
          } else {
            router.push(`/about`);
          }
        }}
      />
    </div>
  );
};

export default Switcher;
