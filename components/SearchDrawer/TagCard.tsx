"use client";
import { cn } from "@/utils";
import { STORE_TAGS } from "@/constant/storeTags";
import TagIcon from "../TagIcon";

const TagCard = () => {
  return (
    <div>
      <div className="text-2xl font-bold pb-[8px]">選擇標籤</div>
      <div className="flex flex-wrap justify-between gap-[8px]">
        {STORE_TAGS.map((tag) => {
          return (
            <div
              key={tag.key}
              className={cn(
                "border border-solid border-black rounded-[24px]",
                "px-[12px] py-[8px]",
                "text-xl"
              )}
              onClick={(e) => {
                e.stopPropagation();
                console.log(tag);
              }}
            >
              <TagIcon tag={tag.key}></TagIcon>
              <span className="ml-[4px]">{tag.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TagCard;
