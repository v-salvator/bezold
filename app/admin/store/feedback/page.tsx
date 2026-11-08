"use client";
import { useEffect, useMemo, useState } from "react";
import NextLink from "next/link";
import {
  Alert,
  Card,
  DatePicker,
  Rate,
  Select,
  Space,
  Statistic,
  Table,
  Tag,
  type TableProps,
} from "antd";
import dayjs, { type Dayjs } from "dayjs";
import { useAdminAuth } from "@/hooks";
import { authedFetch } from "@/lib/authedFetch";
import type { BuyerSource, SoldFeedbackSummary, SoldVia } from "@/types";
import {
  BUYER_SOURCE_LABEL,
  BUYER_SOURCE_OPTIONS,
  SOLD_DURATION_LABEL,
  SOLD_DURATION_OPTIONS,
  SOLD_VIA_LABEL,
} from "@/constant/soldFeedback";
import { formatPrice } from "@/utils/store";
import { priceRatioPercent, summarizeSoldFeedback } from "@/utils/soldFeedback";

const ALL = "all";

interface SoldFeedbackResponse {
  feedback: SoldFeedbackSummary[];
  soldStoreIds: string[];
}

const NOT_ANSWERED = <span className="text-black/45">未填</span>;

export default function SoldFeedbackPage() {
  const { idToken } = useAdminAuth();
  const [data, setData] = useState<SoldFeedbackResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [sourceFilter, setSourceFilter] = useState<BuyerSource | typeof ALL>(
    ALL,
  );
  const [viaFilter, setViaFilter] = useState<SoldVia | typeof ALL>(ALL);
  const [dateRange, setDateRange] = useState<
    [Dayjs | null, Dayjs | null] | null
  >(null);

  useEffect(() => {
    if (!idToken) return;
    let cancelled = false;
    setLoading(true);
    authedFetch(idToken, "/api/admin/sold-feedback")
      .then(async (response) => {
        if (!response.ok) throw new Error(`sold-feedback ${response.status}`);
        return (await response.json()) as SoldFeedbackResponse;
      })
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [idToken]);

  const rows = useMemo(() => {
    const [from, to] = dateRange ?? [null, null];
    return (data?.feedback ?? []).filter(
      (feedback) =>
        (sourceFilter === ALL || feedback.buyerSource === sourceFilter) &&
        (viaFilter === ALL || feedback.soldVia === viaFilter) &&
        (!from || feedback.createTime >= from.startOf("day").valueOf()) &&
        (!to || feedback.createTime <= to.endOf("day").valueOf()),
    );
  }, [data, sourceFilter, viaFilter, dateRange]);

  const soldStoreIds = useMemo(() => new Set(data?.soldStoreIds ?? []), [data]);
  const summary = summarizeSoldFeedback(rows, soldStoreIds);

  const columns: TableProps<SoldFeedbackSummary>["columns"] = [
    {
      title: "店名",
      key: "storeName",
      width: 180,
      render: (_, { storeName }) => (
        <span className="font-semibold">{storeName || "—"}</span>
      ),
    },
    {
      title: "標記方式",
      key: "soldVia",
      render: (_, { soldVia }) => (
        <Tag color={soldVia === "follow-up-email" ? "blue" : "default"}>
          {SOLD_VIA_LABEL[soldVia]}
        </Tag>
      ),
    },
    {
      title: "花了多久",
      key: "soldDuration",
      render: (_, { soldDuration }) =>
        soldDuration ? SOLD_DURATION_LABEL[soldDuration] : NOT_ANSWERED,
    },
    {
      title: "買家來源",
      key: "buyerSource",
      render: (_, { buyerSource }) =>
        buyerSource ? BUYER_SOURCE_LABEL[buyerSource] : NOT_ANSWERED,
    },
    {
      title: "成交頂讓金",
      key: "finalPrice",
      align: "right",
      render: (_, feedback) => {
        const ratio = priceRatioPercent(feedback);
        return (
          <div className="whitespace-nowrap">
            {feedback.finalPrice === null
              ? NOT_ANSWERED
              : formatPrice(feedback.finalPrice)}
            <div className="text-[12px] text-black/45">
              刊登{" "}
              {feedback.listedPrice > 0
                ? formatPrice(feedback.listedPrice)
                : "面議／免頂讓金"}
              {ratio !== null && ` · ${ratio}%`}
            </div>
          </div>
        );
      },
    },
    {
      title: "滿意度",
      key: "satisfaction",
      width: 150,
      sorter: (left, right) =>
        (left.satisfaction ?? 0) - (right.satisfaction ?? 0),
      render: (_, { satisfaction }) =>
        satisfaction ? (
          <Rate
            disabled
            value={satisfaction}
            className="whitespace-nowrap !text-[14px]"
          />
        ) : (
          NOT_ANSWERED
        ),
    },
    {
      title: "建議",
      key: "comment",
      width: 240,
      ellipsis: true,
      render: (_, { comment }) =>
        comment || <span className="text-black/45">—</span>,
    },
    {
      title: "填寫時間",
      key: "createTime",
      defaultSortOrder: "descend",
      sorter: (left, right) => left.createTime - right.createTime,
      render: (_, { createTime }) => (
        <span className="whitespace-nowrap text-black/45">
          {dayjs(createTime).format("YYYY-MM-DD HH:mm")}
        </span>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-[16px] p-[16px]">
      <div className="flex flex-wrap items-center justify-between gap-[12px]">
        <h2 className="m-0 text-[20px] font-semibold">頂讓回饋</h2>
        <Space wrap>
          <Select
            value={sourceFilter}
            onChange={setSourceFilter}
            className="w-[160px]"
            options={[
              { label: "買家來源：全部", value: ALL },
              ...BUYER_SOURCE_OPTIONS,
            ]}
          />
          <Select
            value={viaFilter}
            onChange={setViaFilter}
            className="w-[160px]"
            options={[
              { label: "標記方式：全部", value: ALL },
              { label: "追蹤信", value: "follow-up-email" },
              { label: "我的刊登", value: "my-listings" },
            ]}
          />
          <DatePicker.RangePicker
            value={dateRange}
            onChange={(range) => setDateRange(range)}
            placeholder={["Filled from", "Filled to"]}
          />
        </Space>
      </div>

      {failed && <Alert type="error" message="頂讓回饋載入失敗，請重新整理" />}

      <div className="grid grid-cols-2 gap-[12px] lg:grid-cols-4">
        <Card size="small" loading={loading}>
          <Statistic
            title="回饋數"
            value={summary.count}
            suffix={<span className="text-[14px] text-black/45">則</span>}
          />
          <div className="text-[12px] text-black/45">
            已頂讓 {summary.soldStoreCount} 家，{summary.soldWithFeedback}{" "}
            家有填（{summary.fillRatePercent ?? "—"}
            {summary.fillRatePercent !== null && "%"}）
          </div>
        </Card>
        <Card size="small" loading={loading}>
          <Statistic
            title="透過 Bezold 成交"
            value={summary.viaBezold.percent ?? "—"}
            suffix={summary.viaBezold.percent !== null ? "%" : undefined}
          />
          <div className="text-[12px] text-black/45">
            {summary.viaBezold.count} / {summary.viaBezold.answered}{" "}
            則有回答買家來源
          </div>
        </Card>
        <Card size="small" loading={loading}>
          <Statistic
            title="平均滿意度"
            value={summary.satisfaction.average ?? "—"}
            suffix={
              summary.satisfaction.average !== null ? (
                <span className="text-[14px] text-black/45">/ 5</span>
              ) : undefined
            }
          />
          <div className="text-[12px] text-black/45">
            {summary.satisfaction.answered} 則有評分
          </div>
        </Card>
        <Card size="small" loading={loading}>
          <Statistic
            title="成交價 ÷ 刊登價"
            value={summary.priceRatio.averagePercent ?? "—"}
            suffix={
              summary.priceRatio.averagePercent !== null ? "%" : undefined
            }
          />
          <div className="text-[12px] text-black/45">
            平均，{summary.priceRatio.answered} 則有填成交價
          </div>
        </Card>
      </div>

      <div className="grid gap-[12px] md:grid-cols-2">
        <Card size="small" title="從刊登到頂讓成功花了多久" loading={loading}>
          <Bars
            rows={SOLD_DURATION_OPTIONS.map(({ value, label }) => ({
              label,
              count: summary.durations[value],
            }))}
            unanswered={summary.durationUnanswered}
          />
        </Card>
        <Card size="small" title="買家從哪裡來" loading={loading}>
          <Bars
            rows={BUYER_SOURCE_OPTIONS.map(({ value, label }) => ({
              label,
              count: summary.sources[value],
            }))}
            unanswered={summary.sourceUnanswered}
          />
        </Card>
      </div>

      <Table
        rowKey="storeId"
        size="middle"
        loading={loading}
        columns={columns}
        dataSource={rows}
        // * a fixed width, like the other admin tables — "max-content" let long
        // * comments push the whole admin layout wider than the window
        scroll={{ x: 1000 }}
        pagination={{ pageSize: 20, hideOnSinglePage: true }}
        expandable={{
          expandRowByClick: true,
          expandedRowRender: (feedback) => (
            <div className="flex flex-col gap-[6px]">
              <div className="whitespace-pre-wrap">
                <b>建議：</b>
                {feedback.comment || (
                  <span className="text-black/45">賣家沒有留言</span>
                )}
              </div>
              <NextLink href={`/admin/store/list?store=${feedback.storeId}`}>
                在商店列表打開這家店 →
              </NextLink>
            </div>
          ),
        }}
      />
      <p className="m-0 text-[12px] text-black/45">
        標記方式：「追蹤信」= 賣家從追蹤信的連結按已頂讓；「我的刊登」=
        賣家登入後在我的刊登管理自己按。統計只算有回答該題的回饋。
      </p>
    </div>
  );
}

function Bars({
  rows,
  unanswered,
}: {
  rows: { label: string; count: number }[];
  unanswered: number;
}) {
  const all =
    unanswered > 0 ? [...rows, { label: "未填", count: unanswered }] : rows;
  const max = Math.max(1, ...all.map((row) => row.count));
  return (
    <div className="flex flex-col gap-[10px]">
      {all.map((row) => (
        <div
          key={row.label}
          className="grid grid-cols-[96px_1fr_44px] items-center gap-[10px] text-[13px]"
        >
          <span>{row.label}</span>
          <div className="h-[10px] overflow-hidden rounded-[5px] bg-black/[0.04]">
            <div
              className={
                row.label === "未填"
                  ? "h-full rounded-[5px] bg-black/[0.15]"
                  : "h-full rounded-[5px] bg-[#ff4a31]"
              }
              style={{ width: `${(row.count / max) * 100}%` }}
            />
          </div>
          <span className="text-right tabular-nums text-black/45">
            {row.count} 則
          </span>
        </div>
      ))}
    </div>
  );
}
