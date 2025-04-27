import * as React from "react";
import { Store } from "@/types";
import Link from "next/link";
import { curencyFormatter } from "@/utils";
import { cn } from "@/lib/utils";

import Image from "next/image";
import TagIcon from "./TagIcon";

const StoreSliderCard = ({ store }: { store: Store }) => {
  const {
    storeName,
    location,
    description,
    tags,
    updateTime,
    price,
    id,
    images,
    city,
    district,
  } = store;

  return (
    <Link
      className={cn(
        "inline-block bg-gray-100 shadow-lg rounded border-[2px] border-slate-500",
        "w-[180px] h-[330px] ",
        "md:w-[200px] md:h-[350px]"
      )}
      href={`/store/${id}`}
      target="_blank"
      // style={{
      //   border: "1px solid red",
      // }}
    >
      <div className="font-bold px-[4px]  mt-[8px] mx-[10px] line-clamp-1 shadow text-[12px]">
        {storeName}
      </div>
      <div className="flex justify-end gap-[4px] align-center h-[20px] mx-[10px] my-[4px]">
        {tags?.map((tag) => (
          <div key={tag} className="text-right">
            <TagIcon tag={tag}></TagIcon>
          </div>
        ))}
      </div>

      <div
        className={cn(
          "mb-[12px] relative mx-auto",
          "w-[160px] h-[180px]",
          "md:w-[180px] md:h-[200px]"
        )}
      >
        <Image
          className="rounded"
          src={store.images?.[0] ? store.images?.[0] : "/assets/bezold.png"}
          fill
          alt={store.storeName}
        />
      </div>

      <div className="mx-[10px] p-[4px] shadow">
        <div className="text-[10px]">{`${city} ${district}`}</div>
        <div className="text-slate-500 line-clamp-1 text-[10px]">
          {description}
        </div>
        <div className="h-[1px] bg-slate-200 my-[8px]"></div>

        <div className="font-bold text-right text-[12px]">{`頂讓金/${curencyFormatter(
          price
        )}`}</div>
      </div>
    </Link>
  );
};

export default StoreSliderCard;
