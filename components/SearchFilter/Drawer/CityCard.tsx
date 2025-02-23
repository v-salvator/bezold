"use client";
import { useAtom, useSetAtom } from "jotai";
import { cityAtom, activeDrawerCardAtom } from "@/atoms/SearchFilterAtom";
import { cn } from "@/utils";
import { cityItems } from "../DropDowns";

const CityCard = () => {
  const [city, setCity] = useAtom(cityAtom);
  const setActiveDrawerCard = useSetAtom(activeDrawerCardAtom);

  return (
    <div>
      <div className="text-2xl font-bold pb-[8px]">台灣地區</div>
      <div className="flex flex-wrap justify-between gap-[8px]">
        {cityItems.map((cityItem) => {
          return (
            <div
              key={cityItem.key}
              className={cn(
                "border border-solid border-slate-200 rounded-[24px]",
                "px-[12px] py-[8px]",
                "text-xl",
                cityItem.key === city?.key && "border-black"
              )}
              onClick={(e) => {
                e.stopPropagation();
                setCity(cityItem);
                setActiveDrawerCard("tag");
              }}
            >
              {cityItem.label}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CityCard;
