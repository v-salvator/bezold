"use client";
import { useTransition } from "react";
import { Button } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { DropDownItem } from "./DropDowns";
import { useRouter } from "next/navigation";

interface SearchButtonProps {
  filterInfo: {
    city?: DropDownItem;
    district?: DropDownItem<string>;
    type?: DropDownItem;
    amountFilter?: DropDownItem<number[]>;
  };
}

const SearchButton = ({ filterInfo }: SearchButtonProps) => {
  const { city, district, type, amountFilter } = filterInfo;
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleSearchClick = () => {
    startTransition(() => {
      const cityName = city?.key;
      const districtName = district?.key;
      const category = type?.key || "all";
      const amountMinMax = amountFilter?.value;

      const searchParams = new URLSearchParams({
        ...(cityName && { city: cityName }),
        ...(districtName && { district: districtName }),
        category,
        ...(amountMinMax && {
          amountMin: amountMinMax[0].toString(),
          amountMax: amountMinMax[1].toString(),
        }),
      });
      router.push(`/store-list?${searchParams.toString()}`);
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
