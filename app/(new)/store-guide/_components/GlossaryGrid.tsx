import Section from "../../_components/Section";
import SectionTitle from "@/components/refactored/SectionTitle";
import styles from "./GlossaryGrid.module.css";

type GlossaryItem = {
  term: string;
  definition: string;
  example: string;
};

const items: GlossaryItem[] = [
  {
    term: "頂讓金",
    definition: "買方支付給賣方的一次性轉手費，涵蓋商譽、設備、裝潢殘值。",
    example: "月租 6 萬的早餐店，頂讓金通常落在 20–40 萬之間。",
  },
  {
    term: "押金",
    definition: "支付給房東的可退保證金，租約到期且無損壞可退回。",
    example: "月租 6 萬，押金通常為 2–3 個月租金（12–18 萬）。",
  },
  {
    term: "月租",
    definition: "每月需支付給房東的租金，頂讓後由新老闆承接。",
    example: "接手前務必確認租約剩餘年限與調漲條款。",
  },
  {
    term: "頂讓比",
    definition: "「頂讓金 ÷ 月淨利」的粗估回收年數，用來快速判斷報價是否合理。",
    example: "頂讓比小於 24（即 2 年回本）通常算合理，超過 36 需謹慎。",
  },
];

export default function GlossaryGrid() {
  return (
    <Section variant="alt">
      <SectionTitle
        num="01"
        title="核心名詞解釋"
        sub="— 搞懂這四個詞，談判不吃虧 —"
      />
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        {items.map((item) => (
          <GlossaryCard key={item.term} item={item} />
        ))}
      </div>
    </Section>
  );
}

function GlossaryCard({ item }: { item: GlossaryItem }) {
  const { term, definition, example } = item;
  return (
    <div className={styles.card}>
      <h5 className={styles.term}>{term}</h5>
      <p className={styles.definition}>{definition}</p>
      <p className={styles.example}>例：{example}</p>
    </div>
  );
}
