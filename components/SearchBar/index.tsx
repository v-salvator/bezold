"use client";
import { useState, ReactNode, CSSProperties } from "react";
import { Dropdown, MenuProps, Button } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { cn } from "@/utils";

import {
  cityItems,
  districtItems,
  typeItems,
  amountItems,
  DropDownItem,
} from "./DropDowns";

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
  const [city, setCity] = useState<DropDownItem | undefined>(undefined);
  const [district, setDistrict] = useState<DropDownItem<string> | undefined>(
    undefined
  );
  const [type, setType] = useState<DropDownItem | undefined>(undefined);
  const [amountFilter, setAmountFilter] = useState<
    DropDownItem<number[]> | undefined
  >(undefined);

  const handleCityMenuClick: MenuProps["onClick"] = (e) => {
    const selectedCity = e.key;
    const cityItem = cityItems.find((el) => el.key === selectedCity);
    setCity(cityItem);
    setDistrict(undefined);
  };

  const handleDistrictMenuClick: MenuProps["onClick"] = (e) => {
    const selectedDistrict = e.key;
    const districtItem = districtItems(city?.label).find(
      (el) => el.key === selectedDistrict
    );
    setDistrict(districtItem);
  };

  const handleTypeMenuClick: MenuProps["onClick"] = (e) => {
    const selectedTypeFilter = e.key;
    const typeItem = typeItems.find((el) => el.key === selectedTypeFilter);
    setType(typeItem);
  };

  const handleAmountMenuClick: MenuProps["onClick"] = (e) => {
    const selectedAmountFilter = e.key;
    const amountFilter = amountItems.find(
      (el) => el.key === selectedAmountFilter
    );
    setAmountFilter(amountFilter);
  };

  const handleSearchClick = () => {
    console.log(city, district, type, amountFilter);
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
          <Filter label="City" placeholder="Select City" value={city?.label} />
        </Dropdown>
        <Dropdown
          menu={{
            items: districtItems(city?.label),
            onClick: handleDistrictMenuClick,
          }}
          trigger={["click"]}
          disabled={!city}
        >
          <Filter
            label="District"
            placeholder="Select District"
            value={district?.label}
          />
        </Dropdown>
        <Dropdown
          menu={{ items: typeItems, onClick: handleTypeMenuClick }}
          trigger={["click"]}
        >
          <Filter label="Type" placeholder="Select Type" value={type?.label} />
        </Dropdown>
        <Dropdown
          menu={{ items: amountItems, onClick: handleAmountMenuClick }}
          trigger={["click"]}
        >
          <Filter
            label="Amount"
            placeholder="Select Amount"
            value={amountFilter?.label}
          />
        </Dropdown>
        <Button
          className="mr-[-7px]"
          shape="circle"
          type="primary"
          size="large"
          loading={false}
          icon={<SearchOutlined />}
          onClick={handleSearchClick}
        ></Button>
      </div>
    </div>
  );
};

export default SearchBar;
