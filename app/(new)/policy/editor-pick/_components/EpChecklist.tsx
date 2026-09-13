import Section from "../../../_components/Section";
import styles from "./EpChecklist.module.css";

type ChecklistItem = {
  no: string;
  title: string;
  desc: string;
  example?: string;
};

const items: ChecklistItem[] = [
  {
    no: "01",
    title: "至少上傳 4 ~ 5 張清晰照片",
    desc: "建議包含店面門口、店內環境、設備、座位區與特色空間。",
  },
  {
    no: "02",
    title: "使用清楚具體的店家標題",
    desc: "建議寫明「地區＋店型＋特色」。",
    example: "台北大安區｜近捷運質感咖啡廳頂讓",
  },
  {
    no: "03",
    title: "完整填寫每個欄位",
    desc: "包含頂讓金額、租金、坪數、樓層、設備、營業狀況及頂讓原因等。",
  },
  {
    no: "04",
    title: "提供清楚有效的聯絡資訊",
    desc: "請確認電話、LINE 或其他聯絡方式正確，讓有興趣的買家可以直接聯繫。",
  },
  {
    no: "05",
    title: "補充店家的特色與優勢",
    desc: "例如穩定客源、熱門商圈、交通便利、設備完整或可立即營業。",
  },
  {
    no: "06",
    title: "確認案件仍在頂讓中",
    desc: "資訊完整、內容真實，且目前仍在尋找接手人的案件，更有機會獲選。",
  },
];

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
        {items.map((item) => (
          <ChecklistCard key={item.no} item={item} />
        ))}
      </div>
    </Section>
  );
}

function ChecklistCard({ item }: { item: ChecklistItem }) {
  const { no, title, desc, example } = item;
  return (
    <div className={styles.card}>
      <span className={styles.no}>{no}</span>
      <div className={styles.body}>
        <h3 className={styles.cardTitle}>{title}</h3>
        <p className={styles.desc}>{desc}</p>
        {example && <span className={styles.example}>{example}</span>}
      </div>
    </div>
  );
}
