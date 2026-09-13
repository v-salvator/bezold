import Section from "../../../_components/Section";
import styles from "./EpChecklist.module.css";
import {
  EDITOR_PICK_CHECKLIST,
  type ChecklistItem,
} from "../editorPickChecklist";

export default function EpChecklist() {
  return (
    <Section variant="alt">
      <div className={styles.head}>
        <div className={styles.headLeft}>
          <span className={styles.eyebrow}>入選檢查清單</span>
          <h2 className={styles.title}>
            讓買家一眼看懂
            <br />
            這間店的價值
          </h2>
        </div>
        <p className={styles.note}>
          編輯會綜合評估資訊完整度、照片品質及案件現況。符合條件不代表保證入選，但能大幅提高被看見的機會。
        </p>
      </div>
      <div className={styles.grid}>
        {EDITOR_PICK_CHECKLIST.map((item) => (
          <ChecklistCard key={item.no} item={item} />
        ))}
      </div>
    </Section>
  );
}

function ChecklistCard({ item }: { item: ChecklistItem }) {
  const { no, title, desc, example } = item;
  return (
    <div className={styles.card} id={`step-${no}`}>
      <span className={styles.no}>{no}</span>
      <div className={styles.body}>
        <h3 className={styles.cardTitle}>{title}</h3>
        <p className={styles.desc}>{desc}</p>
        {example && <span className={styles.example}>{example}</span>}
      </div>
    </div>
  );
}
