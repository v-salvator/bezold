import * as React from "react";
import { Store } from "@/types";

const StoreCard = ({ store }: { store: Store }) => {
  const { storeName, location, description, tags, updateTime, price } = store;
  return (
    <div className="border-test inline-block w-[240px]">
      <div className="border-test w-[240px] h-[240px] rounded-[24px]">
        image
      </div>
      <div className="font-bold">{storeName}</div>
      <div className="text-slate-500">{location}</div>
      <div className="text-slate-500 line-clamp-3">{description}</div>
      <div className="py-[8px]">{tags}</div>
      <div className="text-slate-500">{updateTime}</div>
      <div className="font-bold">{`Price: ${price}`}</div>
    </div>
  );
};

export default StoreCard;
