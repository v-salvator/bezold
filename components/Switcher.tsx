"use client";
import * as React from "react";
import { useWindowScroll } from "react-use";
import { Segmented } from "antd";
import { useRouter } from "next/navigation";
import { useCategoryKey } from "@/hooks";
import { cn } from "@/utils";
import { STORE_CATEGORIES } from "@/constant/storeType";

// TODO: moves these mock data to contants folder
const mockData = [
  {
    label: "所有",
    key: "all",
  },
  ...STORE_CATEGORIES,
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
  const categories = mockData.map((item) => {
    return { ...item, value: item.key };
  });

  const { y } = useWindowScroll();

  return (
    <div
      className={cn(
        "px-[16px] py-[12px]",
        y > 0 && "shadow-lg shadow-slate-200",
        className
      )}
      style={style}
    >
      <Segmented
        options={categories}
        value={categoryKey}
        size="large"
        onChange={(selectedKey) => {
          if (selectedKey !== "about") {
            router.push(`/store-list?category=${selectedKey}`);
          } else {
            router.push(`/about`);
          }
        }}
      />
    </div>
  );
};

export default Switcher;
