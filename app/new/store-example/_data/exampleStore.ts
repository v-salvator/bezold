import type { Store } from "@/types";

export const exampleStore: Store = {
  id: "T8mNvKpQrX5w",
  storeName: "老滋味咖啡館",
  location: "台北市大安區忠孝東路四段",
  city: "台北",
  district: "大安",
  category: "餐飲",
  tags: ["HOT", "RECOMMENDED"],
  price: 1200000,
  currency: "TWD",
  images: [],
  description:
    "本店於 2018 年開幕，坐落大安區精華地段，鄰近捷運忠孝復興站，步行僅需三分鐘。主打手沖單品咖啡與輕食，累積大量忠實熟客，平均每月來客數超過 1,200 人次，假日常需排隊候位。店內設備完善，包含義式咖啡機、烘豆機、中島吧台及 24 個座位，全數含於頂讓金內。\n\n因業主規劃移居海外，誠意出讓此成熟店面。現有兩名正職員工可留任，交接期間業主本人願意全程陪同輔導，確保營運平穩過渡。月租 NT$ 58,000，租約尚有三年，房東態度友善且願與新店主續約。有意者歡迎預約現場看店，帳務資料可於見面後提供。",
  createTime: new Date("2024-01-15"),
  updateTime: new Date("2024-04-01"),
  userInfo: {
    id: "example-seller",
    userName: "王大明",
    phone: "0912-345-678",
    email: "example@example.com",
    lineId: "@example_store",
    createTime: new Date("2024-01-01"),
    updateTime: new Date("2024-01-01"),
  },
};
