"use client";
import * as React from "react";
import { Tabs } from "antd";
import { useRouter } from "next/navigation";

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
  return (
    <div className="p-[16px]">
      <Tabs
        defaultActiveKey="1"
        items={mockData}
        onChange={(activeKey) => {
          router.push(`/${activeKey}`);
        }}
      />
    </div>
  );
};

export default Switcher;
