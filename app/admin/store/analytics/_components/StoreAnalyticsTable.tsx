import { Card, Table } from "antd";
import type { TableProps } from "antd";
import { STORE_CATEGORIES } from "@/constant/storeType";
import { changeRatio, type StoreAnalyticsRow } from "@/utils/storeAnalytics";
import ChangeIndicator from "./ChangeIndicator";
import ClickRate, { clickRateOf } from "./ClickRate";
import Sparkline from "./Sparkline";

interface StoreAnalyticsTableProps {
  rows: StoreAnalyticsRow[];
  days: number;
  loading: boolean;
}

// Change can't drop below -100%, so -2 sorts "no previous data" last
// without the NaN that -Infinity - -Infinity would produce.
const NO_PREVIOUS_DATA = -2;
const changeSortKey = ({ current, previous }: StoreAnalyticsRow["analytics"]) =>
  changeRatio(current.views, previous.views) ?? NO_PREVIOUS_DATA;

const headerLabel = (label: string) => (
  <span className="whitespace-nowrap">{label}</span>
);

const categoryLabel = (category?: string) =>
  STORE_CATEGORIES.find((item) => item.key === category)?.label ??
  (category || "—");

export default function StoreAnalyticsTable({
  rows,
  days,
  loading,
}: StoreAnalyticsTableProps) {
  const columns: TableProps<StoreAnalyticsRow>["columns"] = [
    {
      title: "店名",
      key: "storeName",
      render: (_, { store }) => (
        <div className="min-w-[160px]">
          <div className="font-semibold">{store.storeName || "—"}</div>
          <div className="text-[12px] text-black/45">
            {store.city || "—"} · {categoryLabel(store.category)}
          </div>
        </div>
      ),
    },
    {
      title: headerLabel(`近 ${days} 天趨勢`),
      key: "trend",
      render: (_, { analytics }) => (
        <Sparkline series={analytics.current.daily} />
      ),
    },
    {
      title: headerLabel("瀏覽"),
      key: "views",
      align: "right",
      defaultSortOrder: "descend",
      sorter: (left, right) =>
        left.analytics.current.views - right.analytics.current.views,
      render: (_, { analytics }) => (
        <span className="tabular-nums">
          {analytics.current.views.toLocaleString()}
        </span>
      ),
    },
    {
      title: headerLabel("較前期"),
      key: "change",
      align: "right",
      sorter: (left, right) =>
        changeSortKey(left.analytics) - changeSortKey(right.analytics),
      render: (_, { analytics }) => (
        <ChangeIndicator
          current={analytics.current.views}
          previous={analytics.previous.views}
        />
      ),
    },
    {
      title: headerLabel("訪客"),
      key: "visitors",
      align: "right",
      render: (_, { analytics }) => (
        <span className="tabular-nums">
          {analytics.current.visitors.toLocaleString()}
        </span>
      ),
    },
    {
      title: headerLabel("聯絡點擊率"),
      key: "clickRate",
      align: "right",
      sorter: (left, right) =>
        (clickRateOf(left.analytics.current) ?? -1) -
        (clickRateOf(right.analytics.current) ?? -1),
      render: (_, { analytics }) => (
        <ClickRate {...analytics.current} showCounts />
      ),
    },
  ];

  return (
    <Card size="small" title="各商店成效" styles={{ body: { padding: 0 } }}>
      <Table
        size="small"
        rowKey={({ store }) => store.id}
        columns={columns}
        dataSource={rows}
        loading={loading}
        pagination={false}
        scroll={{ x: 720 }}
      />
    </Card>
  );
}
