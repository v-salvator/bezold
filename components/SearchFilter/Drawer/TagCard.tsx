"use client";
import { useAtom, useSetAtom } from "jotai";
import { tagAtom, activeDrawerCardAtom } from "@/atoms/SearchFilterAtom";
import { cn } from "@/utils";
import { tagItems } from "../DropDowns";

const TagCard = () => {
  const [tag, setTag] = useAtom(tagAtom);
  const setActiveDrawerCard = useSetAtom(activeDrawerCardAtom);

  return (
    <div>
      <div className="text-2xl font-bold pb-[8px]">選擇標籤</div>
      <div className="flex flex-wrap justify-between gap-[8px]">
        {tagItems.map((tagItem) => {
          return (
            <div
              key={tagItem.key}
              className={cn(
                "border border-solid border-slate-200 rounded-[24px]",
                "px-[12px] py-[8px]",
                "text-xl",
                tagItem.key === tag?.key && "border-black"
              )}
              onClick={(e) => {
                e.stopPropagation();
                setTag(tagItem);
                setActiveDrawerCard("amountFilter");
              }}
            >
              {tagItem.label}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TagCard;
