"use client";
import * as React from "react";
import { Tabs } from "antd";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCategoryKey } from "@/hooks";
import { cn } from "@/utils";

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

interface SwitcherProps {
  className?: string;
  style?: React.CSSProperties;
}

const Switcher = ({ className, style }: SwitcherProps) => {
  const router = useRouter();
  const categoryKey = useCategoryKey();

  // TODO: add dynamic border when scroll down
  return (
    <div className={cn("px-[16px]", className)} style={style}>
      <Tabs
        defaultActiveKey={categoryKey}
        style={{ border: "1px solid red" }}
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
