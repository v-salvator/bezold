import Section from "./Section";
import SectionTitle from "@/components/refactored/SectionTitle";
import styles from "./Stories.module.css";

const stories = [
  {
    who: "陳先生 · 36 歲",
    role: "原行銷主管 → 接手永和早餐店",
    quote:
      "原本想自己開，光是租店面 + 設備就吃掉一半預算。在這邊接手了已經穩定 6 年的早餐店，第一個月就有現金流，不用從零開始教熟客。",
    stat: "接手金 NT$ 55 萬 · 32 天完成",
  },
  {
    who: "林老闆 · 58 歲",
    role: "頂出大安麵店 → 退休",
    quote:
      "開了 14 年，孩子不接，本來想直接收掉。顧問幫我估價、拍照、寫故事，3 週就找到合適的接手人 — 重點是他真的會用心做下去。",
    stat: "頂出 NT$ 88 萬 · 21 天成交",
  },
];

export default function Stories() {
  return (
    <Section variant="alt">
      <SectionTitle
        num="09"
        title="成交故事"
        sub="— 真實接手人 / 頂出人的回饋 —"
        more="看更多故事 →"
      />
      <div className={styles.stories}>
        {stories.map((s, i) => (
          <div key={i} className={styles.story}>
            <div className={styles.av}>頭像 / 店面合照</div>
            <div>
              <div className={styles.who}>
                {s.who}
                <small>{s.role}</small>
              </div>
              <p>{s.quote}</p>
              <span className={styles.stat}>{s.stat}</span>
              <span className={styles.quote}>&ldquo;</span>
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
}
