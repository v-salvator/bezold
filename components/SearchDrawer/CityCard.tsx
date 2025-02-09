"use client";
import { getTwCities, cn } from "@/utils";

const CityCard = () => {
  const cities = getTwCities();
  return (
    <div>
      <div className="text-2xl font-bold pb-[8px]">台灣地區</div>
      <div className="flex flex-wrap justify-between gap-[8px]">
        {cities.map((city) => {
          return (
            <div
              key={city}
              className={cn(
                "border border-solid border-black rounded-[24px]",
                "px-[12px] py-[8px]",
                "text-xl"
              )}
              onClick={(e) => {
                e.stopPropagation();
                console.log(city);
              }}
            >
              {city}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CityCard;
