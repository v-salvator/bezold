"use client";
import { useState, ReactNode, CSSProperties } from "react";
import { Dropdown, MenuProps } from "antd";
import { cn } from "@/utils";

import { cityItems, districtItems, typeItems, amountItems } from "./DropDowns";

interface FilterProps {
  label: ReactNode;
  placeholder: ReactNode;
  onClick?: () => void;
  value?: string;
}

const Filter = ({ label, placeholder, onClick, value }: FilterProps) => {
  return (
    <div
      className={cn(
        "p-[12px] w-[120px] relative cursor-pointer",
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
  const [city, setCity] = useState<string | undefined>(undefined);
  const [district, setDistrict] = useState<string | undefined>(undefined);
  const [type, setType] = useState<string | undefined>(undefined);
  const [amountFilter, setAmountFilter] = useState<string | undefined>(
    undefined
  );

  const handleCityMenuClick: MenuProps["onClick"] = (e) => {
    const selectedCity = e.key;
    setCity(selectedCity);
    setDistrict(undefined);
  };

  const handleDistrictMenuClick: MenuProps["onClick"] = (e) => {
    const selectedDistrict = e.key;
    setDistrict(selectedDistrict);
  };

  const handleTypeMenuClick: MenuProps["onClick"] = (e) => {
    const selectedTypeFilter = e.key;
    const typeItem = typeItems.find((el) => el.key === selectedTypeFilter);
    setType(typeItem?.label);
  };

  const handleAmountMenuClick: MenuProps["onClick"] = (e) => {
    const selectedAmountFilter = e.key;
    const amountFilter = amountItems.find(
      (el) => el.key === selectedAmountFilter
    );
    setAmountFilter(amountFilter?.label);
  };

  return (
    <div className={className}>
      <div className="flex rounded-[32px] border-slate-200 border-[1px] px-[12px]">
        <Dropdown
          menu={{
            items: cityItems,
            onClick: handleCityMenuClick,
            style: { maxHeight: "400px", overflow: "auto" },
          }}
          trigger={["click"]}
        >
          <Filter label="City" placeholder="Select City" value={city} />
        </Dropdown>
        <Dropdown
          menu={{
            items: districtItems(city),
            onClick: handleDistrictMenuClick,
          }}
          trigger={["click"]}
          disabled={!city}
        >
          <Filter
            label="District"
            placeholder="Select District"
            value={district}
          />
        </Dropdown>
        <Dropdown
          menu={{ items: typeItems, onClick: handleTypeMenuClick }}
          trigger={["click"]}
        >
          <Filter label="Type" placeholder="Select Type" value={type} />
        </Dropdown>
        <Dropdown
          menu={{ items: amountItems, onClick: handleAmountMenuClick }}
          trigger={["click"]}
        >
          <Filter
            label="Amount"
            placeholder="Select Amount"
            value={amountFilter}
          />
        </Dropdown>
      </div>
    </div>
  );
};

export default SearchBar;
