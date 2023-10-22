"use client";
import * as React from "react";
import { Tabs } from "antd";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

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
  const searchParams = useSearchParams();
  const categoryKey = searchParams.get("category") ?? "all";
  return (
    <div className="p-[16px]">
      <Tabs
        defaultActiveKey={categoryKey}
        items={mockData}
        onChange={(activeKey) => {
          router.push(`/store-list?category=${activeKey}`);
        }}
      />
    </div>
  );
};

export default Switcher;
