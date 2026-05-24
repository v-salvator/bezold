import Section from "../../_components/Section";
import SectionTitle from "@/components/refactored/SectionTitle";
import styles from "./PitfallsList.module.css";

const pitfalls = [
  {
    title: "房東未書面同意就付頂讓金",
    desc: "口頭同意不算數。房東有權拒絕轉租，沒有書面文件，頂讓金可能血本無歸。",
  },
  {
    title: "沒有書面設備清單",
    desc: "交接時設備數量、狀況沒有白紙黑字，事後爭議難舉證，建議逐項拍照確認。",
  },
  {
    title: "頂讓金遠超「月租 × 6」",
    desc: "報價偏高時，要求賣方提供近期帳本或稅申報，用數字確認獲利是否撐得住。",
  },
  {
    title: "口頭承諾月營業額或回客率",
    desc: "賣方口說無憑，接手前要求提供 3 個月收銀紀錄或外送平台報表。",
  },
];

export default function PitfallsList() {
  return (
    <Section variant="dark">
      <SectionTitle
        num="04"
        title="常見地雷 & 注意事項"
        sub="— 踩過的人都說：早知道就好了 —"
        dark
      />
      <div className="flex flex-col gap-3">
        {pitfalls.map((pitfall) => (
          <PitfallItem key={pitfall.title} pitfall={pitfall} />
        ))}
      </div>
    </Section>
  );
}

function PitfallItem({
  pitfall,
}: {
  pitfall: { title: string; desc: string };
}) {
  const { title, desc } = pitfall;
  return (
    <div className={styles.item}>
      <span className={styles.icon}>⚠</span>
      <div>
        <h5 className={styles.title}>{title}</h5>
        <p className={styles.desc}>{desc}</p>
      </div>
    </div>
  );
}
