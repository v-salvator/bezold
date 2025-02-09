"use client";
import { Slider } from "antd";
import { cn } from "@/utils";
import { amountItems } from "@/components/SearchBar/DropDowns";

const AmountFilterCard = () => {
  return (
    <div>
      <div className="text-2xl font-bold pb-[8px]">選擇金額</div>
      <div className="flex flex-wrap justify-between gap-[8px]">
        {amountItems.map((amountItem) => {
          return (
            <div
              key={amountItem.key}
              className={cn(
                "border border-solid border-black rounded-[24px]",
                "px-[12px] py-[8px]",
                "text-xl"
              )}
              onClick={(e) => {
                e.stopPropagation();
                console.log(amountItem);
              }}
            >
              <span className="ml-[4px]">{amountItem.label}</span>
            </div>
          );
        })}
      </div>
      <Slider
        range
        defaultValue={[0, 200]}
        max={200}
        min={0}
        step={5}
        marks={{
          0: "0",
          200: "200萬",
        }}
      />
    </div>
  );
};

export default AmountFilterCard;
