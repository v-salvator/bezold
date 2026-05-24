import GuideSteps from "./GuideSteps";
import type { GuideStep } from "./GuideSteps";

const steps: GuideStep[] = [
  {
    number: 1,
    title: "搜尋 & 篩選",
    desc: "用行業、地區、金額找到目標店型，收藏喜歡的。匿名瀏覽，不留資料。",
  },
  {
    number: 2,
    title: "約看店 & 問清楚",
    desc: "直接聯絡賣家約看店。現場確認月營業額、客群組成、設備狀況、員工去留。",
  },
  {
    number: 3,
    title: "確認租約 & 房東",
    desc: "向房東確認是否同意轉租，取得書面同意書。確認租約剩餘年限與調漲條款。",
  },
  {
    number: 4,
    title: "簽約 & 交接",
    desc: "簽訂頂讓合約，逐項清點設備並拍照存證，確認交接日與水電過戶時間。",
  },
];

export default function BuyerSteps() {
  return (
    <GuideSteps
      anchorId="buyer"
      sectionNum="02"
      title="買家流程"
      sub="— 從搜尋到交接，四個步驟搞定 —"
      variant="default"
      type="BUYER"
      steps={steps}
    />
  );
}
