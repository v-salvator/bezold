import { Card, Empty, Table, Tooltip } from "antd";
import type { TableProps } from "antd";
import dayjs from "dayjs";
import { STORE_CATEGORIES } from "@/constant/storeType";
import { SELLER_CONTACT_LABEL } from "@/constant/storeAnalytics";
import type { SellerContactChannel } from "@/types";
import {
  changeRatio,
  memberContactTotal,
  type StoreAnalyticsRow,
} from "@/utils/storeAnalytics";
import ChangeIndicator from "./ChangeIndicator";
import ClickRate, { clickRateOf } from "./ClickRate";
import Sparkline from "./Sparkline";
import ViewsLineChart from "./ViewsLineChart";

interface StoreAnalyticsTableProps {
  rows: StoreAnalyticsRow[];
  days: number;
  /** YYYY-MM-DD of the first day in the current period. */
  startDate: string;
  /** ISO time GA4 was last queried (the API caches for an hour). */
  generatedAt: string | null;
  loading: boolean;
  expandedStoreId: string | null;
  onExpandedChange: (storeId: string | null) => void;
}

// Change can't drop below -100%, so -2 sorts "no previous data" last
// without the NaN that -Infinity - -Infinity would produce.
const NO_PREVIOUS_DATA = -2;
const changeSortKey = ({ current, previous }: StoreAnalyticsRow["analytics"]) =>
  changeRatio(current.views, previous.views) ?? NO_PREVIOUS_DATA;

const headerLabel = (label: string, hint?: string) => {
  const content = <span className="whitespace-nowrap">{label}</span>;
  return hint ? <Tooltip title={hint}>{content}</Tooltip> : content;
};

const updatedAgo = (generatedAt: string) => {
  const minutes = Math.floor((Date.now() - Date.parse(generatedAt)) / 60000);
  if (minutes < 1) return "剛剛";
  if (minutes < 60) return `${minutes} 分鐘前`;
  return `${Math.floor(minutes / 60)} 小時前`;
};

const categoryLabel = (category?: string) =>
  STORE_CATEGORIES.find((item) => item.key === category)?.label ??
  (category || "—");

export default function StoreAnalyticsTable({
  rows,
  days,
  startDate,
  generatedAt,
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
      title: headerLabel(
        "瀏覽",
        "每開啟一次頁面算一次，同一人重新整理也會重複計算",
      ),
      key: "views",
      align: "right",
      showSorterTooltip: false,
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
      title: headerLabel(
        "較前期",
        "與前一段相同天數比較瀏覽；— 表示前一段沒有瀏覽，無法比較",
      ),
      showSorterTooltip: false,
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
      title: headerLabel(
        "不重複訪客",
        "期間內看過這間店的人數，同一瀏覽器來多次只算 1 人",
      ),
      key: "visitors",
      align: "right",
      render: (_, { analytics }) => (
        <span className="tabular-nums">
          {analytics.current.visitors.toLocaleString()}
        </span>
      ),
    },
    {
      title: headerLabel(
        "解鎖聯絡點擊率",
        "未登入訪客打開店家頁看到鎖住的聯絡區後，點擊解鎖的比例（以開頁次數計，不是人數；已登入會員不計入）",
      ),
      key: "clickRate",
      align: "right",
      showSorterTooltip: false,
      sorter: (left, right) =>
        (clickRateOf(left.analytics.current) ?? -1) -
        (clickRateOf(right.analytics.current) ?? -1),
      render: (_, { analytics }) => (
        <ClickRate {...analytics.current} showCounts />
      ),
    },
    {
      title: headerLabel(
        "會員聯絡",
        "已登入會員點擊「撥打電話」、「加 LINE」、「Threads 私訊」按鈕的次數",
      ),
      key: "memberContacts",
      align: "right",
      showSorterTooltip: false,
      sorter: (left, right) =>
        memberContactTotal(left.analytics.current) -
        memberContactTotal(right.analytics.current),
      render: (_, { analytics }) => (
        <span className="tabular-nums">
          {memberContactTotal(analytics.current).toLocaleString()}
        </span>
      ),
    },
  ];

  return (
    <Card
      size="small"
      title="各商店成效"
      extra={
        <span className="text-[12px] text-black/45">
          資料來自 GA4，約延遲 24–48 小時
          {generatedAt && ` · 更新於 ${updatedAgo(generatedAt)}`}
        </span>
      }
      styles={{ body: { padding: 0 } }}
    >
      <Table
        size="small"
        rowKey={({ store }) => store.id}
        columns={columns}
        dataSource={rows}
        loading={loading}
        pagination={false}
        scroll={{ x: 800 }}
        locale={{
          emptyText: (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="沒有符合篩選條件的商店"
            />
          ),
        }}
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
        <DetailStat label="本期聯絡區（未登入）">
          <span className="tabular-nums">
            看到 {current.gateViews.toLocaleString()} → 點擊解鎖{" "}
            {current.gateClicks.toLocaleString()}
          </span>
        </DetailStat>
        <DetailStat label="本期會員聯絡">
          <span className="tabular-nums">
            {(Object.keys(SELLER_CONTACT_LABEL) as SellerContactChannel[])
              .map(
                (channel) =>
                  `${SELLER_CONTACT_LABEL[channel]} ${current.memberContacts[channel].toLocaleString()}`,
              )
              .join(" · ")}
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
