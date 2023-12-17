import * as React from "react";
import { Tag } from "antd";
import { Store } from "@/types";
import Link from "next/link";
import Image from "next/image";

import { curencyFormatter } from "@/utils";

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
  } = store;
  console.log("🚀 ~ StoreCard ~ images:", images);
  return (
    <Link className="inline-block w-[240px]" href={`/store/${id}`}>
      <div
        className="w-[240px] h-[240px] rounded-[24px] relative"
        style={{ border: "1px solid red" }}
      >
        {images?.length > 0 ? (
          <Image src={images[0]} fill alt="Picture of the store" />
        ) : null}
      </div>
      <div className="font-bold px-[4px]">{storeName}</div>
      <div className="px-[8px]">
        <div>{location}</div>
        <div className="text-slate-500 line-clamp-2">{description}</div>
        <div className="py-[8px]">
          {tags.map((tag) => (
            <Tag key={tag}>{tag}</Tag>
          ))}
        </div>
        <div className="font-bold">{`頂讓金: ${curencyFormatter(price)}`}</div>
      </div>
    </Link>
  );
};

export default StoreCard;
