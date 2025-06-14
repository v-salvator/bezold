import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/motion-primitives/accordion";
import { ChevronUp } from "lucide-react";
import styles from "./three-step-banner.module.css";
import { cn } from "@/lib/utils";
import Waves from "./wave-bg";

export default function ThreeStepBanner() {
  return (
    <div
      className={cn(
        "flex gap-[16px] justify-between items-center",
        "relative bg-black shadow",
        "p-[24px]  m-[8px] h-[260px]",
        "md:p-[32px] md:m-[32px] md:h-auto"
      )}
    >
      <Waves
        lineColor="#ff4a31"
        backgroundColor="black"
        waveSpeedX={0.02}
        waveSpeedY={0.01}
        waveAmpX={40}
        waveAmpY={20}
        friction={0.9}
        tension={0.01}
        maxCursorMove={120}
        xGap={12}
        yGap={36}
      />
      <Accordion
        className="flex flex-col divide-y divide-zinc-200 flex-1"
        transition={{ duration: 0.2, ease: "easeInOut" }}
        variants={{
          expanded: {
            opacity: 1,
          },
          collapsed: {
            opacity: 0,
          },
        }}
      >
        <AccordionItem value="step-1" className="py-2">
          <AccordionTrigger className={styles.accordionTrigger}>
            <div className={styles.accordionTriggerTitle}>
              <div>步驟一：換個角度看財富</div>
              <ChevronUp
                className={cn(
                  styles.accordionTriggerIcon,
                  "group-data-[expanded]:-rotate-180"
                )}
              />
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <p className={styles.accordionContentParagraph}>
              你不一定要從零開始創業，買下一間已經穩定賺錢的生意，可能是更聰明的選擇。
              <br />
              我們也將分享成功案例及行銷工具，幫助你複製成功模式！
            </p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="step-2" className="py-2">
          <AccordionTrigger className={styles.accordionTrigger}>
            <div className={styles.accordionTriggerTitle}>
              <div>步驟二：實際出手行動</div>
              <ChevronUp
                className={cn(
                  styles.accordionTriggerIcon,
                  "group-data-[expanded]:-rotate-180"
                )}
              />
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <p className={styles.accordionContentParagraph}>
              Bezold 提供： 專業的「買賣平台」與成功案例分享
              <br />
              從挑選佈局、接手生意、行銷策略等完整教學
              如何復盤、建立每月穩定現金流
            </p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="step-3" className="py-2">
          <AccordionTrigger className={styles.accordionTrigger}>
            <div className={styles.accordionTriggerTitle}>
              <div>步驟三：加入 Bezold 社群</div>
              <ChevronUp
                className={cn(
                  styles.accordionTriggerIcon,
                  "group-data-[expanded]:-rotate-180"
                )}
              />
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <p className={styles.accordionContentParagraph}>
              別再孤軍奮戰！
              <br />
              你將加入一個由買家、賣家、專家組成的強大社群，獲得指導、回饋與人脈。
              <br />
              有同路人，才走得更快、更遠。
            </p>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      {/* <div className="w-[300px] h-[300px] bg-zinc-200 rounded-xl relative hidden md:block">
        image of three
      </div> */}
    </div>
  );
}
