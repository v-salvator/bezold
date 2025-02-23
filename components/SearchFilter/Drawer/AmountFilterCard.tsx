"use client";
import { useAtom } from "jotai";
import { amountFilterAtom } from "@/atoms/SearchFilterAtom";
import { cn } from "@/utils";
import { amountItems } from "../DropDowns";

const AmountFilterCard = () => {
  const [amountFilter, setAmountFilter] = useAtom(amountFilterAtom);

  return (
    <div>
      <div className="text-2xl font-bold pb-[8px]">選擇金額</div>
      <div className="flex flex-wrap justify-between gap-[8px]">
        {amountItems.map((amountItem) => {
          return (
            <div
              key={amountItem.key}
              className={cn(
                "border border-solid border-slate-200 rounded-[24px]",
                "px-[12px] py-[8px]",
                "text-xl",
                amountItem.key === amountFilter?.key && "border-black"
              )}
              onClick={(e) => {
                e.stopPropagation();
                setAmountFilter(amountItem);
              }}
            >
              <span className="ml-[4px]">{amountItem.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AmountFilterCard;
