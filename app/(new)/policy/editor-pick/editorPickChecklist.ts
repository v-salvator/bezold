export type ChecklistItem = {
  no: string;
  title: string;
  desc: string;
  example?: string;
};

/**
 * The 6 eligibility criteria for the homepage 編輯精選. Single source of truth
 * shared by the on-page checklist UI (EpChecklist) and the HowTo structured
 * data emitted for SEO / answer engines (page.tsx).
 */
export const EDITOR_PICK_CHECKLIST: ChecklistItem[] = [
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
