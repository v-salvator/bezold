import { ReactNode } from "react";
import { cn } from "@/utils";

interface FilterProps {
  label: ReactNode;
  placeholder: ReactNode;
  value?: ReactNode;
  children?: ReactNode;
  active?: boolean;
  onClick?: () => void;
}

const FilterCard = ({
  label,
  placeholder,
  value,
  children,
  active,
  onClick,
}: FilterProps) => {
  return (
    <div
      className="shadow-md mt-[16px] px-[24px] py-[22px] rounded-lg bg-white cursor-pointer"
      onClick={onClick}
    >
      {!active ? (
        <div className={cn("flex justify-between")}>
          <div> {label}</div>
          <div> {value ?? placeholder}</div>
        </div>
      ) : (
        <div>{children}</div>
      )}
    </div>
  );
};

export default FilterCard;
