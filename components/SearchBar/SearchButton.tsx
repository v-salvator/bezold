"use client";
import { useTransition } from "react";
import { Button } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { DropDownItem } from "./DropDowns";
import { useRouter, useSearchParams } from "next/navigation";

interface SearchButtonProps {
  filterInfo: {
    city?: DropDownItem;
    district?: DropDownItem<string>;
    tag?: DropDownItem;
    amountFilter?: DropDownItem<number[]>;
    category?: string;
  };
}

const SearchButton = ({ filterInfo }: SearchButtonProps) => {
  const { city, district, tag, amountFilter } = filterInfo;
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSearchClick = () => {
    startTransition(() => {
      const cityName = city?.key;
      const districtName = district?.key;
      const tagName = tag?.key;
      const amountMinMax = amountFilter?.value;

      const newSearchParams = new URLSearchParams({
        ...(cityName && { city: cityName }),
        ...(districtName && { district: districtName }),
        ...(tagName && { tag: tagName }),
        ...(amountMinMax && {
          amountMin: amountMinMax[0].toString(),
          amountMax: amountMinMax[1].toString(),
        }),
        ...(searchParams.has("category") && {
          category: searchParams.get("category")!,
        }),
      });
      router.push(`/store-list?${newSearchParams.toString()}`);
    });
  };
  return (
    <Button
      className="mr-[-7px]"
      shape="circle"
      type="primary"
      size="large"
      loading={isPending}
      icon={<SearchOutlined />}
      onClick={handleSearchClick}
    ></Button>
  );
};

export default SearchButton;
