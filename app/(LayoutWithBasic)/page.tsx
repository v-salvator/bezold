import { StoreSliderCard } from "@/components";
import { Slider3D } from "@/components/animated";
import { Store } from "@/types";
import { getHighlightedStores } from "@/firebase/serverUtils";
import { GlowEffect } from "@/components/motion-primitives/glow-effect";
import { cn } from "@/lib/utils";
import { Banner } from "@/components/home";
import { Steps } from "antd";

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
      <Banner />
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

      <div className="flex w-fit mx-auto my-[32px] pt-[12px] px-[32px]">
        <Steps
          className="mx-auto"
          progressDot
          direction="vertical"
          current={3}
          items={[
            {
              title: "步驟一：換個角度看財富",
              description: (
                <>
                  你不一定要從零開始創業，買下一間已經穩定賺錢的生意，可能是更聰明的選擇。
                  <br />
                  我們也將分享成功案例及行銷工具，幫助你複製成功模式！
                </>
              ),
            },
            {
              title: "步驟二：實際出手行動",
              description: (
                <>
                  Bezold 提供： 專業的「買賣平台」與成功案例分享
                  <br />
                  從挑選佈局、接手生意、行銷策略等完整教學
                  如何復盤、建立每月穩定現金流
                </>
              ),
            },
            {
              title: "步驟三：加入 Bezold 社群",
              description: (
                <>
                  別再孤軍奮戰！
                  <br />
                  你將加入一個由買家、賣家、專家組成的強大社群，獲得指導、回饋與人脈。
                  <br />
                  有同路人，才走得更快、更遠。
                </>
              ),
            },
          ]}
        />
      </div>
    </div>
  );
}
