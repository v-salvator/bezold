"use client";
import * as React from "react";
import { useWindowScroll } from "react-use";
import { Segmented } from "antd";
import { useRouter, useSearchParams } from "next/navigation";
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
  const searchParams = useSearchParams();

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
          const newSearchParams = new URLSearchParams(searchParams.toString());
          newSearchParams.set("category", selectedKey);
          router.push(`/store-list?${newSearchParams.toString()}`);
        }}
      />
    </div>
  );
};

export default Switcher;
