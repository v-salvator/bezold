import { TextEffect } from "@/components/motion-primitives/text-effect";
import ExploreButton from "./explore-button";
import { cn } from "@/lib/utils";

export default function Banner() {
  return (
    <div className="px-[16px]">
      <div
        className={cn(
          "flex flex-col gap-y-[16px]",
          "text-[24px] font-bold w-fit ",
          "mx-auto mt-[100px]",
          "md:text-[34px]"
        )}
      >
        <TextEffect per="char" delay={0.5}>
          買下事業
        </TextEffect>
        <TextEffect per="char" delay={1}>
          複製成功模式
        </TextEffect>
        <TextEffect per="char" delay={1.5}>
          打造理想生活
        </TextEffect>
        <TextEffect per="char" delay={2} preset="blur" className="text-[14px]">
          {`Bezold 是一個專門提供店面頂讓資訊的平台，
主要服務於台灣創業及投資者。`}
        </TextEffect>
      </div>
      <ExploreButton />
    </div>
  );
}
