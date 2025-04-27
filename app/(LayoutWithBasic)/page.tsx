import { StoreSliderCard } from "@/components";
import { Slider3D } from "@/components/animated";
import { Store } from "@/types";
import { getHighlightedStores } from "@/firebase/serverUtils";
import { GlowEffect } from "@/components/motion-primitives/glow-effect";
import { cn } from "@/lib/utils";

const glowingArr = [
  ["#0894FF", "#C959DD", "#FF2E54", "#FF9004"],
  ["#FF5733", "#33FF57", "#3357FF", "#F1C40F"],
  ["#0894FF", "#C959DD", "#FF2E54", "#FF9004"].reverse(),
  ["#FF5733", "#33FF57", "#3357FF", "#F1C40F"].reverse(),
];

export default async function Home() {
  const highlightedStores = await getHighlightedStores();

  return (
    <div>
      <div className="h-[100px] bg-red-500 text-white"> banner</div>
      <Slider3D
        cards={highlightedStores.map((store: Store) => (
          <StoreSliderCard key={store.id} store={store} />
        ))}
        // debug={true}
      />

      <div
        className={cn(
          "max-w-[376px] rounded bg-white mx-auto hover:shadow-xl",
          "grid grid-cols-2 gap-y-[24px] justify-items-center",
          "py-[16px]",
          "md:grid-cols-4 md:gap-4 md:p-[16px] md:max-w-[900px]"
        )}
      >
        {highlightedStores.map((store: Store, index) => (
          <div
            className={cn(
              "relative ",
              "w-[180px] h-[330px] ",
              "md:w-[200px] md:h-[350px]"
            )}
            key={store.id}
          >
            <GlowEffect
              colors={glowingArr[index % 4]}
              mode="colorShift"
              blur="soft"
              duration={4}
            />
            <div
              className={cn(
                "relative rounded-lg bg-black",
                "w-[180px] h-[330px] ",
                "md:w-[200px] md:h-[350px]"
              )}
            >
              <StoreSliderCard key={store.id} store={store} />
            </div>
          </div>
        ))}
      </div>

      <div>bezold guide 3 steps or 3 features</div>
    </div>
  );
}
