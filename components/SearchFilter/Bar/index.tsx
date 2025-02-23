"use client";
import { ReactNode, CSSProperties } from "react";
import { Dropdown, MenuProps } from "antd";
import { cn } from "@/utils";
import { useAtom } from "jotai";
import { cityAtom, tagAtom, amountFilterAtom } from "@/atoms/SearchFilterAtom";

import { cityItems, tagItems, amountItems } from "../DropDowns";
import SearchButton from "./SearchButton";

interface FilterProps {
  label: ReactNode;
  placeholder: ReactNode;
  onClick?: () => void;
  value?: ReactNode;
}

const Filter = ({ label, placeholder, onClick, value }: FilterProps) => {
  return (
    <div
      className={cn(
        "py-[6px] px-[8px] w-[120px] relative cursor-pointer",
        "before:content-[''] before:absolute before:left-0 before:inline-block before:h-[36px] before:w-[1px] [&+div::before]:bg-slate-200"
      )}
      onClick={onClick}
    >
      <div className="font-bold text-xs">{label}</div>
      <div
        className={cn(
          "text-sm",
          value ? "text-black font-bold" : "text-slate-500"
        )}
      >
        {value ?? placeholder}
      </div>
    </div>
  );
};

interface SearchBarProps {
  className?: string;
  style?: CSSProperties;
}

const SearchBar = ({ className }: SearchBarProps) => {
  const [city, setCity] = useAtom(cityAtom);
  const [tag, setTag] = useAtom(tagAtom);
  const [amountFilter, setAmountFilter] = useAtom(amountFilterAtom);

  const handleCityMenuClick: MenuProps["onClick"] = (e) => {
    const selectedCity = e.key;
    const cityItem = cityItems.find((el) => el.key === selectedCity);
    setCity(cityItem);
  };

  const handleTagMenuClick: MenuProps["onClick"] = (e) => {
    const selectedTagFilter = e.key;
    const tagItem = tagItems.find((el) => el.key === selectedTagFilter);
    setTag(tagItem);
  };

  const handleAmountMenuClick: MenuProps["onClick"] = (e) => {
    const selectedAmountFilter = e.key;
    const amountFilter = amountItems.find(
      (el) => el.key === selectedAmountFilter
    );
    setAmountFilter(amountFilter);
  };

  return (
    <div className={className}>
      <div
        className={cn(
          "flex items-center",
          "rounded-[24px] border-slate-200 border-[1px]",
          "px-[12px]",
          "shadow"
        )}
      >
        <Dropdown
          menu={{
            items: cityItems,
            onClick: handleCityMenuClick,
            style: { maxHeight: "400px", overflow: "auto" },
          }}
          trigger={["click"]}
        >
          <Filter label="城市" placeholder="選擇城市" value={city?.label} />
        </Dropdown>
        <Dropdown
          menu={{ items: tagItems, onClick: handleTagMenuClick }}
          trigger={["click"]}
        >
          <Filter label="標籤" placeholder="選擇標籤" value={tag?.label} />
        </Dropdown>
        <Dropdown
          menu={{ items: amountItems, onClick: handleAmountMenuClick }}
          trigger={["click"]}
        >
          <Filter
            label="金額"
            placeholder="選擇金額"
            value={amountFilter?.label}
          />
        </Dropdown>
        <SearchButton />
      </div>
    </div>
  );
};

export default SearchBar;
