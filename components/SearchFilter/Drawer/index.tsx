"use client";
import { useState } from "react";
import { Drawer, Button } from "antd";
import { SearchOutlined, LoadingOutlined } from "@ant-design/icons";
import { cn } from "@/utils";
import { useAtom } from "jotai";
import { activeDrawerCardAtom, filtersAtom } from "@/atoms/SearchFilterAtom";

import FilterCard from "./FilterCard";
import CityCard from "./CityCard";
import TagCard from "./TagCard";
import AmountFilterCard from "./AmountFilterCard";
import useHandleSearch from "../hooks/useHandleSearch";

type FilterKey = "city" | "tag" | "amountFilter";

const SearchDrawer = ({ className }: { className?: string }) => {
  const [open, setOpen] = useState(false);
  const [activeDrawerCard, setActiveDrawerCard] = useAtom(activeDrawerCardAtom);
  const [{ city, tag, amountFilter }, setFilters] = useAtom(filtersAtom);
  const { handleSearchClick, isPending } = useHandleSearch();

  const onClose = () => {
    setOpen(false);
  };

  const handleFilterCardClick = (filterKey: FilterKey) => {
    setActiveDrawerCard(filterKey);
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
        {isPending ? <LoadingOutlined /> : <SearchOutlined />}
        <span className="ml-[4px]">{isPending ? "搜尋中..." : "開始搜尋"}</span>
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
                setFilters({
                  city: undefined,
                  tag: undefined,
                  amountFilter: undefined,
                });
              }}
            >
              清除全部
            </Button>
            <Button
              className="mr-[-7px]"
              type="primary"
              size="large"
              icon={<SearchOutlined />}
              onClick={() => {
                handleSearchClick();
                onClose();
              }}
            >
              搜尋
            </Button>
          </div>
        }
      >
        <FilterCard
          label="城市"
          placeholder={city?.label ?? "新增城市"}
          key="city"
          active={activeDrawerCard === "city"}
          onClick={() => handleFilterCardClick("city")}
        >
          <CityCard />
        </FilterCard>
        <FilterCard
          label="標籤"
          placeholder={tag?.label ?? "新增標籤"}
          key="tag"
          active={activeDrawerCard === "tag"}
          onClick={() => handleFilterCardClick("tag")}
        >
          <TagCard></TagCard>
        </FilterCard>
        <FilterCard
          label="金額"
          placeholder={amountFilter?.label ?? "新增金額"}
          key="amountFilter"
          active={activeDrawerCard === "amountFilter"}
          onClick={() => handleFilterCardClick("amountFilter")}
        >
          <AmountFilterCard />
        </FilterCard>
      </Drawer>
    </div>
  );
};

export default SearchDrawer;
