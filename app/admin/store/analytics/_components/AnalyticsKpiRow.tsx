import { Card, Statistic, Tooltip } from "antd";
import { Info } from "lucide-react";
import type { ReactNode } from "react";
import {
  CONTACT_GATE_TRACKING_START,
  MEMBER_CONTACT_TRACKING_START,
  SELLER_CONTACT_LABEL,
} from "@/constant/storeAnalytics";
import type { SellerContactChannel } from "@/types";
import {
  changeRatio,
  memberContactTotal,
  type StoreAnalyticsRow,
} from "@/utils/storeAnalytics";
import ChangeIndicator from "./ChangeIndicator";

interface AnalyticsKpiRowProps {
  rows: StoreAnalyticsRow[];
  days: number;
  loading: boolean;
}

export default function AnalyticsKpiRow({
  rows,
  days,
  loading,
}: AnalyticsKpiRowProps) {
  const sumOf = (pick: (row: StoreAnalyticsRow) => number) =>
    rows.reduce((total, row) => total + pick(row), 0);

  const views = sumOf((row) => row.analytics.current.views);
  const previousViews = sumOf((row) => row.analytics.previous.views);
  const clicks = sumOf((row) => row.analytics.current.gateClicks);
  const previousClicks = sumOf((row) => row.analytics.previous.gateClicks);
  const memberContacts = sumOf((row) =>
    memberContactTotal(row.analytics.current),
  );
  const previousMemberContacts = sumOf((row) =>
    memberContactTotal(row.analytics.previous),
  );
  const contactsByChannel = (
    Object.keys(SELLER_CONTACT_LABEL) as SellerContactChannel[]
  )
    .map(
      (channel) =>
        `${SELLER_CONTACT_LABEL[channel]} ${sumOf(
          (row) => row.analytics.current.memberContacts[channel],
        ).toLocaleString()}`,
    )
    .join(" · ");

  // Spelled out rather than a bare ▲/▼/—, so "no data to compare" reads as
  // such instead of a stray dash.
  const comparison = (current: number, previous: number) =>
    changeRatio(current, previous) === null ? (
      `前 ${days} 天沒有資料，無法比較`
    ) : (
      <>
        較前 {days} 天 <ChangeIndicator current={current} previous={previous} />
      </>
    );

  return (
    <div className="mb-[16px] grid grid-cols-2 gap-[12px] md:grid-cols-3 xl:grid-cols-5">
      <KpiCard
        title="總頁面瀏覽"
        value={views}
        unit="次"
        loading={loading}
        caption={comparison(views, previousViews)}
      />
      <KpiCard
        title="刊登數"
        value={rows.length}
        unit="間"
        loading={loading}
        caption="符合目前篩選條件的商店"
      />
      <KpiCard
        title="平均每間瀏覽"
        // Round here: antd's `precision` truncates (3.875 → 3.8).
        value={rows.length ? Math.round((views / rows.length) * 10) / 10 : 0}
        precision={1}
        unit="次 / 間"
        loading={loading}
        caption="總頁面瀏覽 ÷ 刊登數"
      />
      <KpiCard
        title="解鎖聯絡點擊"
        hint={`未登入訪客點擊鎖住的聯絡區、解鎖聯絡方式的次數。自 ${CONTACT_GATE_TRACKING_START} 開始記錄，之前沒有資料。`}
        value={clicks}
        unit="次"
        loading={loading}
        caption={comparison(clicks, previousClicks)}
      />
      <KpiCard
        title="會員聯絡"
        hint={`已登入會員點擊「撥打賣家電話」、「加 LINE 聯繫」、「到 Threads 私訊賣家」的次數。自 ${MEMBER_CONTACT_TRACKING_START} 開始記錄，之前沒有資料。`}
        value={memberContacts}
        unit="次"
        loading={loading}
        caption={
          <>
            <div>{contactsByChannel}</div>
            <div>{comparison(memberContacts, previousMemberContacts)}</div>
          </>
        }
      />
    </div>
  );
}

function KpiCard({
  title,
  hint,
  value,
  unit,
  precision,
  loading,
  caption,
}: {
  title: string;
  /** Shown on hover over the title, marked with an info icon. */
  hint?: string;
  value: number;
  unit: string;
  precision?: number;
  loading: boolean;
  caption: ReactNode;
}) {
  return (
    <Card size="small" loading={loading}>
      <Statistic
        title={
          hint ? (
            <Tooltip title={hint}>
              <span className="inline-flex cursor-help items-center gap-[4px]">
                {title}
                <Info size={13} strokeWidth={2} />
              </span>
            </Tooltip>
          ) : (
            title
          )
        }
        value={value}
        precision={precision}
        suffix={<span className="text-[14px] text-black/45">{unit}</span>}
      />
      <div className="mt-[4px] text-[12px] text-black/45">{caption}</div>
    </Card>
  );
}
