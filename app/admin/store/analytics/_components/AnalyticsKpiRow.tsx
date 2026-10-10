import { Card, Statistic } from "antd";
import type { ReactNode } from "react";
import { changeRatio, type StoreAnalyticsRow } from "@/utils/storeAnalytics";
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
    <div className="mb-[16px] grid grid-cols-2 gap-[12px] lg:grid-cols-4">
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
        value={clicks}
        unit="次"
        loading={loading}
        caption={comparison(clicks, previousClicks)}
      />
    </div>
  );
}

function KpiCard({
  title,
  value,
  unit,
  precision,
  loading,
  caption,
}: {
  title: string;
  value: number;
  unit: string;
  precision?: number;
  loading: boolean;
  caption: ReactNode;
}) {
  return (
    <Card size="small" loading={loading}>
      <Statistic
        title={title}
        value={value}
        precision={precision}
        suffix={<span className="text-[14px] text-black/45">{unit}</span>}
      />
      <div className="mt-[4px] text-[12px] text-black/45">{caption}</div>
    </Card>
  );
}
