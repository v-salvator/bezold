import Section from "./Section";
import SectionTitle from "@/components/refactored/SectionTitle";
import styles from "./Districts.module.css";
import cn from "classnames";

const districts = [
  { name: "大安區", en: "DA-AN", count: "124" },
  { name: "信義區", en: "XINYI", count: "89" },
  { name: "中山區", en: "ZHONGSHAN", count: "76" },
  { name: "板橋區", en: "BANQIAO", count: "58" },
  { name: "三重區", en: "SANCHONG", count: "41" },
  { name: "新店區", en: "XINDIAN", count: "33" },
  { name: "桃園市", en: "TAOYUAN", count: "112" },
  { name: "台中西區", en: "TAICHUNG-W", count: "67" },
];

export default function Districts() {
  return (
    <Section variant="alt">
      <SectionTitle
        num="06"
        title="熱門商圈"
        sub="— 點擊看該區所有刊登 —"
        more="看全部地區 →"
      />
      <div className={cn("grid gap-2", "lg:grid-cols-4 grid-cols-2")}>
        {districts.map((district) => (
          <District key={district.name} district={district} />
        ))}
      </div>
    </Section>
  );
}

export type District = {
  name: string;
  en: string;
  count: string;
};

function District({ district }: { district: District }) {
  const { name, en, count } = district;
  return (
    <div key={name} className={styles.dist}>
      <div className={styles.left}>
        {name}
        <small>{en}</small>
      </div>
      <div className={styles.count}>{count}</div>
    </div>
  );
}
