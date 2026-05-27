import Section from "./Section";
import SectionTitle from "@/components/refactored/SectionTitle";
import styles from "./Districts.module.css";
import cn from "classnames";

const districts = [
  { name: "臺北市", en: "TAIPEI", count: "289", city: "臺北市" },
  { name: "新北市", en: "NEW-TAIPEI", count: "132", city: "新北市" },
  { name: "桃園市", en: "TAOYUAN", count: "112", city: "桃園市" },
  { name: "臺中市", en: "TAICHUNG", count: "67", city: "臺中市" },
  { name: "臺南市", en: "TAINAN", count: "54", city: "臺南市" },
  { name: "高雄市", en: "KAOHSIUNG", count: "48", city: "高雄市" },
  { name: "新竹市", en: "HSINCHU", count: "31", city: "新竹市" },
  { name: "基隆市", en: "KEELUNG", count: "24", city: "基隆市" },
];

export default function Districts() {
  return (
    <Section variant="alt">
      <SectionTitle
        num="04"
        title="熱門城市"
        sub="— 點擊看該市所有刊登 —"
        more="看全部城市 →"
        moreHref="/new/store-list"
      />
      <div className={cn("grid gap-2", "lg:grid-cols-4 grid-cols-2")}>
        {districts.map((district) => (
          <District key={district.name} district={district} />
        ))}
      </div>
    </Section>
  );
}

type District = {
  name: string;
  en: string;
  count: string;
  city: string;
};

function District({ district }: { district: District }) {
  const { name, en, count, city } = district;
  return (
    <a
      href={`/new/store-list?city=${encodeURIComponent(city)}`}
      className={styles.dist}
    >
      <div className={styles.left}>
        {name}
        <small>{en}</small>
      </div>
      <div className={styles.count}>{count}</div>
    </a>
  );
}
