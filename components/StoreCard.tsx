import * as React from "react";
import { Store } from "@/types";
import Link from "next/link";
import { curencyFormatter } from "@/utils";

import { AnimatedImage } from "./animated";
import TagIcon from "./TagIcon";

const StoreCard = ({ store }: { store: Store }) => {
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
      className="inline-block w-[240px]"
      href={`/store/${id}`}
      target="_blank"
    >
      <div className="w-[240px] h-[240px] mb-[4px] relative">
        <AnimatedImage src={images?.[0]} alt="Picture of the store" />
        <div className="absolute top-[12px] right-[14px]">
          {tags?.map((tag) => (
            <div key={tag} className="text-right">
              <TagIcon tag={tag}></TagIcon>
            </div>
          ))}
        </div>
      </div>
      <div className="font-bold px-[4px]">{storeName}</div>
      <div className="px-[4px]">
        <div className="text-[12px]">{`${city} ${district}`}</div>
        <div className="ml-[8px] text-[14px]">{location}</div>
        <div className="text-slate-500 line-clamp-2 text-[14px]">
          {description}
        </div>

        <div className="font-bold">{`頂讓金: ${curencyFormatter(price)}`}</div>
      </div>
    </Link>
  );
};

export default StoreCard;
