import { Card, Statistic } from "antd";
import type { ReactNode } from "react";
import type { StoreAnalyticsRow } from "@/utils/storeAnalytics";
import ChangeIndicator from "./ChangeIndicator";

interface AnalyticsKpiRowProps {
  rows: StoreAnalyticsRow[];
  loading: boolean;
}

export default function AnalyticsKpiRow({
  rows,
  loading,
}: AnalyticsKpiRowProps) {
  const sumOf = (pick: (row: StoreAnalyticsRow) => number) =>
    rows.reduce((total, row) => total + pick(row), 0);

  const views = sumOf((row) => row.analytics.current.views);
  const previousViews = sumOf((row) => row.analytics.previous.views);
  const clicks = sumOf((row) => row.analytics.current.gateClicks);
  const previousClicks = sumOf((row) => row.analytics.previous.gateClicks);

  return (
    <div className="mb-[16px] grid grid-cols-2 gap-[12px] lg:grid-cols-4">
      <KpiCard
        title="總頁面瀏覽"
        value={views}
        loading={loading}
        change={<ChangeIndicator current={views} previous={previousViews} />}
      />
      <KpiCard title="刊登數" value={rows.length} loading={loading} />
      <KpiCard
        title="平均每間瀏覽"
        value={rows.length ? Math.round(views / rows.length) : 0}
        loading={loading}
      />
      <KpiCard
        title="聯絡解鎖點擊"
        value={clicks}
        loading={loading}
        change={<ChangeIndicator current={clicks} previous={previousClicks} />}
      />
    </div>
  );
}

function KpiCard({
  title,
  value,
  loading,
  change,
}: {
  title: string;
  value: number;
  loading: boolean;
  change?: ReactNode;
}) {
  return (
    <Card size="small" loading={loading}>
      <Statistic title={title} value={value} suffix={change} />
    </Card>
  );
}
