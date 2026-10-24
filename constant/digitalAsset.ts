import {
  DIGITAL_ASSET_TYPE,
  type DigitalAssetType,
} from "@/types/DigitalAsset";

// * official 數位資產頂讓 launch (Taipei time). Before it, the entry points
// * show a teaser; at this moment they switch on their own — no deploy needed.
export const DIGITAL_ASSETS_LAUNCH_AT = "2026-10-29T22:00:00+08:00";

// * display order of the type tabs / pills
export const DIGITAL_ASSET_TYPES: { key: DigitalAssetType; label: string }[] = [
  { key: DIGITAL_ASSET_TYPE.SOCIAL, label: "社群" },
  { key: DIGITAL_ASSET_TYPE.WEBSITE, label: "網站／內容平台" },
  { key: DIGITAL_ASSET_TYPE.ECOMMERCE, label: "電商" },
  { key: DIGITAL_ASSET_TYPE.APP, label: "App" },
  { key: DIGITAL_ASSET_TYPE.SAAS, label: "SaaS" },
  { key: DIGITAL_ASSET_TYPE.NEWSLETTER, label: "電子報／會員社群" },
  { key: DIGITAL_ASSET_TYPE.DIGITAL_PRODUCT, label: "數位產品／品牌" },
  { key: DIGITAL_ASSET_TYPE.OTHERS, label: "其他" },
];

export const DIGITAL_ASSET_TYPE_LABEL = Object.fromEntries(
  DIGITAL_ASSET_TYPES.map(({ key, label }) => [key, label]),
) as Record<DigitalAssetType, string>;

// * fixed caption under every 平均月營收 figure — sellers can't edit it
export const REVENUE_DISCLAIMER = "賣家提供，未經 Bezold 查核";

export const NO_CREDENTIALS_WARNING = "請勿提供密碼、驗證碼或其他登入資訊。";

export const TRANSFER_RISK_NOTICE =
  "刊登與移轉方式須依資產權利及相關平台規範確認。填寫表單時，請勿提供密碼、驗證碼或其他登入資訊。";

export const DIGITAL_TRANSFER_NOTES: { title: string; body: string }[] = [
  {
    title: "分階段揭露詳細資料",
    body: "公開頁面只顯示概要。買家送出申請後，由 Bezold 確認雙方意願，再依序提供營運數據與聯絡資料。",
  },
  {
    title: "移轉範圍需雙方確認",
    body: "帳號、社群、網域、商品與客戶名單等移轉項目，以及是否符合各平台規範，需由買賣雙方逐項確認。",
  },
  {
    title: "金額為賣家提供",
    body: "營收與價格皆由賣家提供，未經 Bezold 查核，請在交易前自行核對。",
  },
  {
    title: "請勿提供登入資訊",
    body: NO_CREDENTIALS_WARNING,
  },
];

export const VERIFICATION_IMAGE_TITLE = "營收與數據核對截圖（必填，不公開）";

export const VERIFICATION_IMAGE_GUIDE = [
  "請上傳後台的營收報表或數據截圖。例如蝦皮賣家中心的月營收、Shopify／電商後台的訂單報表、FB 社團洞察報告、GA 流量、App 下載數。",
  "截圖要看得到帳號或賣場名稱，方便我們對應你填的資產連結。",
  "只有 Bezold 管理員看得到，用來核對資料、防止詐騙刊登，不會出現在公開頁面。",
  "請遮住個資，不要截到密碼或驗證碼。",
];
