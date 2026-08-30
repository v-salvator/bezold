import { Target, TrendingUp, Clock, BarChart3 } from "lucide-react";
import Section from "@/app/(new)/_components/Section";
import styles from "./BenefitsStrip.module.css";

const benefits = [
  {
    icon: Target,
    title: "精準投放",
    desc: "鎖定有意頂讓的潛在買家",
  },
  {
    icon: TrendingUp,
    title: "提升曝光",
    desc: "多渠道曝光，增加能見度",
  },
  {
    icon: Clock,
    title: "快速成交",
    desc: "縮短等待時間，加速成交",
  },
  {
    icon: BarChart3,
    title: "數據透明",
    desc: "結案報告清楚呈現成效數據",
  },
];

export default function BenefitsStrip() {
  return (
    <Section variant="alt">
      <ul className={styles.strip}>
        {benefits.map(({ icon: Icon, title, desc }) => (
          <li key={title} className={styles.item}>
            <span className={styles.icon}>
              <Icon size={22} />
            </span>
            <div>
              <h3 className={styles.title}>{title}</h3>
              <p className={styles.desc}>{desc}</p>
            </div>
          </li>
        ))}
      </ul>
    </Section>
  );
}
