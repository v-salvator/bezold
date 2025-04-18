import * as React from "react";
import { Store } from "@/types";
import Link from "next/link";
import { cn, curencyFormatter } from "@/utils";

import Image from "next/image";
import TagIcon from "./TagIcon";
import { motion } from "framer-motion";

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
      className="inline-block w-[200px] h-[350px] bg-gray-100 shadow-lg rounded border-[2px] border-slate-500"
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
      <div className="w-[180px] h-[200px] mb-[12px] relative mx-auto ">
        <Image
          src={store.images?.[0] ? store.images?.[0] : "/assets/bezold.png"}
          fill
          alt={store.storeName}
        />
      </div>

      <div className="mx-[10px] p-[4px] shadow">
        <div className="text-[10px]">{`${city} ${district}`}</div>
        <div className="text-slate-500 line-clamp-1 text-[12px]">
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
