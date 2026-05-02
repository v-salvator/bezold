"use client";

import { useState } from "react";
import Section from "./Section";
import SectionTitle from "@/components/refactored/SectionTitle";
import styles from "./Faq.module.css";
import { cn } from "@/lib/utils";

type FaqItem = { q: string; a: React.ReactNode };

const items: FaqItem[] = [
  {
    q: "刊登要錢嗎？早鳥之後怎麼收？",
    a: (
      <>
        <b>開站慶 · 前 3 個月完全免費刊登</b>（早鳥限定）。
        <br />3
        個月之後預計開始收取刊登費（金額確認後另行公告，早鳥用戶會優先通知）。
        <br />
        瀏覽永久免費 · 買賣雙方聯絡永久免費 ·
        成交永久不抽成。早期上架的店主可享連續優惠。
      </>
    ),
  },
  { q: "頂讓金、押金、月租分別是什麼？怎麼算合理？", a: "（內容準備中）" },
  { q: "買家怎麼確認店家的資訊是真的？", a: "（內容準備中）" },
  { q: "房東不同意轉租怎麼辦？", a: "（內容準備中）" },
  { q: "交接時設備清點怎麼做才不會後悔？", a: "（內容準備中）" },
  { q: "遇到不誠實的買家 / 賣家怎麼辦？", a: "（內容準備中）" },
];

export default function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <Section variant="alt">
      <SectionTitle
        num="11"
        title="常見問題"
        sub="— 第一次接手 / 頂出？這些先看 —"
        more="完整 FAQ →"
      />
      <div className={"flex flex-col gap-2"}>
        {items.map((item, i) => {
          const isOpen = openIndex === i;
          return (
            <FaqItem
              key={i}
              item={item}
              isOpen={isOpen}
              onClick={() => setOpenIndex(isOpen ? null : i)}
            />
          );
        })}
      </div>
    </Section>
  );
}

function FaqItem({
  item,
  isOpen,
  onClick,
}: {
  item: FaqItem;
  isOpen: boolean;
  onClick: () => void;
}) {
  return (
    <div className={styles.item}>
      <button
        type="button"
        className={cn(styles.question, isOpen && styles.open)}
        onClick={onClick}
        aria-expanded={isOpen}
      >
        <span>{item.q}</span>
        <span className={styles.plus}>{isOpen ? "−" : "+"}</span>
      </button>
      {isOpen && <div className={styles.body}>{item.a}</div>}
    </div>
  );
}
