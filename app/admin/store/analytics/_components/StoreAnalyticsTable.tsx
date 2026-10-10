import { Card, Table } from "antd";
import type { TableProps } from "antd";
import dayjs from "dayjs";
import { STORE_CATEGORIES } from "@/constant/storeType";
import { changeRatio, type StoreAnalyticsRow } from "@/utils/storeAnalytics";
import ChangeIndicator from "./ChangeIndicator";
import ClickRate, { clickRateOf } from "./ClickRate";
import Sparkline from "./Sparkline";
import ViewsLineChart from "./ViewsLineChart";

interface StoreAnalyticsTableProps {
  rows: StoreAnalyticsRow[];
  days: number;
  /** YYYY-MM-DD of the first day in the current period. */
  startDate: string;
  loading: boolean;
  expandedStoreId: string | null;
  onExpandedChange: (storeId: string | null) => void;
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
  startDate,
  loading,
  expandedStoreId,
  onExpandedChange,
}: StoreAnalyticsTableProps) {
  const columns: TableProps<StoreAnalyticsRow>["columns"] = [
    {
      title: "店名",
      key: "storeName",
      // A fixed column also makes antd size expanded rows to the visible
      // width, so the trend chart isn't wider than the card.
      fixed: "left",
      width: 200,
      render: (_, { store }) => (
        <div>
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
      width: 112,
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
        rowClassName={({ store }) =>
          store.id === expandedStoreId ? "[&>td]:!bg-[#fff1ee]" : ""
        }
        expandable={{
          // One row open at a time; the page mirrors it into ?store=.
          expandedRowKeys: expandedStoreId ? [expandedStoreId] : [],
          expandRowByClick: true,
          onExpand: (expanded, { store }) =>
            onExpandedChange(expanded ? store.id : null),
          expandedRowRender: (row) => (
            <StoreTrendDetail row={row} startDate={startDate} />
          ),
        }}
      />
    </Card>
  );
}

function StoreTrendDetail({
  row: { store, analytics },
  startDate,
}: {
  row: StoreAnalyticsRow;
  startDate: string;
}) {
  const { current, previous, allTime } = analytics;
  // Stats sit above the chart: the expanded row is only as wide as the
  // visible table, so a side column would be cut off on narrow screens.
  return (
    <div className="py-[4px]">
      <dl className="m-0 mb-[12px] flex flex-wrap gap-x-[32px] gap-y-[8px] text-[13px]">
        <DetailStat label="總瀏覽數">
          <span className="text-[18px] font-semibold tabular-nums">
            {allTime.views.toLocaleString()}
          </span>
        </DetailStat>
        <DetailStat label="本期瀏覽">
          <span className="mr-[6px] text-[18px] font-semibold tabular-nums">
            {current.views.toLocaleString()}
          </span>
          <ChangeIndicator current={current.views} previous={previous.views} />
        </DetailStat>
        <DetailStat label="本期聯絡">
          <span className="tabular-nums">
            看到 {current.gateViews.toLocaleString()} → 點擊{" "}
            {current.gateClicks.toLocaleString()}
          </span>
        </DetailStat>
        <DetailStat label="上架日">
          <span className="tabular-nums">
            {store.createTime
              ? dayjs(store.createTime).format("YYYY-MM-DD")
              : "—"}
          </span>
        </DetailStat>
      </dl>
      <div className="mb-[4px] text-[13px] font-semibold text-black/65">
        近 {current.daily.length} 天每日瀏覽
      </div>
      <ViewsLineChart series={current.daily} startDate={startDate} />
    </div>
  );
}

function DetailStat({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <dt className="text-[12px] text-black/45">{label}</dt>
      <dd className="m-0">{children}</dd>
    </div>
  );
}
