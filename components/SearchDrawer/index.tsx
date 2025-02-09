"use client";
import { useState } from "react";
import { Drawer, Button } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { cn } from "@/utils";

import FilterCard from "./FilterCard";
import CityCard from "./CityCard";
import TagCard from "./TagCard";
import AmountFilterCard from "./AmountFilterCard";

type FilterKey = "city" | "tag" | "amountFilter";

const SearchDrawer = ({ className }: { className?: string }) => {
  const [open, setOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterKey>("city");

  const onClose = () => {
    setOpen(false);
  };

  const handleFilterCardClick = (filterKey: FilterKey) => {
    setActiveFilter(filterKey);
  };

  return (
    <div className={className}>
      <div
        onClick={() => setOpen(true)}
        className={cn(
          "flex items-center justify-center",
          "rounded-[24px] border-slate-200 border-[1px]",
          "px-[12px] h-[48px]",
          "shadow"
        )}
      >
        <SearchOutlined />
        <span className="ml-[4px]">開始搜尋</span>
      </div>
      <Drawer
        placement={"top"}
        closable={false}
        onClose={onClose}
        open={open}
        height={600}
        classNames={{
          body: "bg-slate-50",
        }}
        footer={
          <div className="flex justify-between">
            <Button
              type="dashed"
              size="large"
              onClick={() => {
                console.log("search");
              }}
            >
              清除全部
            </Button>
            <Button
              className="mr-[-7px]"
              // shape="circle"
              type="primary"
              size="large"
              // loading={isPending}
              icon={<SearchOutlined />}
              onClick={() => {
                console.log("search");
              }}
            >
              搜尋
            </Button>
          </div>
        }
      >
        <FilterCard
          label="城市"
          placeholder="新增城市"
          key="city"
          active={activeFilter === "city"}
          onClick={() => handleFilterCardClick("city")}
        >
          <CityCard />
        </FilterCard>
        <FilterCard
          label="標籤"
          placeholder="新增標籤"
          key="tag"
          active={activeFilter === "tag"}
          onClick={() => handleFilterCardClick("tag")}
        >
          <TagCard></TagCard>
        </FilterCard>
        <FilterCard
          label="金額"
          placeholder="新增金額"
          key="amountFilter"
          active={activeFilter === "amountFilter"}
          onClick={() => handleFilterCardClick("amountFilter")}
        >
          <AmountFilterCard />
        </FilterCard>
      </Drawer>
    </div>
  );
};

export default SearchDrawer;
