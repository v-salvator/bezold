"use client";
import { useCallback, useEffect, useState } from "react";
import {
  Segmented,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import type { TableProps } from "antd";
import dayjs from "dayjs";
import Link from "next/link";
import { useSetAtom } from "jotai";

import { INQUIRY_STATUS, type Inquiry, type InquiryStatus } from "@/types";
import { INQUIRY_STATUS_COLOR, INQUIRY_STATUS_LABEL } from "@/constant/inquiry";
import { authedFetch } from "@/lib/authedFetch";
import { useAdminAuth } from "@/hooks";
import { newCountDelta } from "@/utils/inquiry";
import { newInquiryCountAtom } from "@/atoms/InquiryAtom";

// * timestamps arrive as epoch millis over JSON
type InquiryRow = Omit<Inquiry, "createTime" | "updateTime"> & {
  createTime: number;
  updateTime: number;
};

type Scope = "open" | "all";

const OPEN_STATUSES: InquiryStatus[] = [
  INQUIRY_STATUS.NEW,
  INQUIRY_STATUS.CONTACTED,
];

const STATUS_OPTIONS = Object.values(INQUIRY_STATUS).map((status) => ({
  label: (
    <Tag color={INQUIRY_STATUS_COLOR[status]} className="!m-0">
      {INQUIRY_STATUS_LABEL[status]}
    </Tag>
  ),
  value: status,
}));

export default function AdminInquiriesPage() {
  const { user, idToken } = useAdminAuth();
  const [messageApi, messageHolder] = message.useMessage();
  const [inquiries, setInquiries] = useState<InquiryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [scope, setScope] = useState<Scope>("open");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const setNewInquiryCount = useSetAtom(newInquiryCountAtom);

  const fetchInquiries = useCallback(async () => {
    if (!idToken) return;
    setLoading(true);
    try {
      const response = await authedFetch(idToken, "/api/admin/inquiries");
      if (!response.ok) throw new Error();
      const data: { inquiries: InquiryRow[] } = await response.json();
      setInquiries(data.inquiries);
    } catch {
      messageApi.error("詢問載入失敗，請重新整理");
    } finally {
      setLoading(false);
    }
  }, [idToken, messageApi]);

  // Keyed on the stable uid, not idToken — the token rotates hourly and a
  // refetch would reset the admin's view mid-review (same as buyer-profiles).
  useEffect(() => {
    if (user) fetchInquiries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid]);

  const handleStatusChange = async (
    inquiry: InquiryRow,
    status: InquiryStatus,
  ) => {
    if (!idToken || status === inquiry.status) return;
    setUpdatingId(inquiry.id);
    try {
      const response = await authedFetch(
        idToken,
        `/api/admin/inquiries/${inquiry.id}`,
        {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ status }),
        },
      );
      if (!response.ok) throw new Error();
      setInquiries((previous) =>
        previous.map((row) =>
          row.id === inquiry.id
            ? { ...row, status, updateTime: Date.now() }
            : row,
        ),
      );
      // * keep the sidebar badge in step without refetching the count
      setNewInquiryCount((count) =>
        Math.max(0, count + newCountDelta(inquiry.status, status)),
      );
      messageApi.success(`已更新為「${INQUIRY_STATUS_LABEL[status]}」`);
    } catch {
      messageApi.error("更新失敗，請稍後再試");
    } finally {
      setUpdatingId(null);
    }
  };

  const visibleInquiries =
    scope === "all"
      ? inquiries
      : inquiries.filter((inquiry) => OPEN_STATUSES.includes(inquiry.status));

  const columns: TableProps<InquiryRow>["columns"] = [
    {
      title: "時間",
      dataIndex: "createTime",
      key: "createTime",
      width: 140,
      render: (_, { createTime }) => (
        <span className="whitespace-nowrap text-black/45">
          {dayjs(createTime).format("YYYY-MM-DD HH:mm")}
        </span>
      ),
    },
    {
      title: "資產",
      key: "store",
      render: (_, { storeId, storeName }) => (
        <div className="flex flex-col gap-[2px]">
          <a href={`/store/${storeId}`} target="_blank" rel="noreferrer">
            {storeName || storeId}
          </a>
          <Link
            href={`/admin/store/edit/${storeId}`}
            className="text-[12px] text-black/45"
          >
            後台編輯
          </Link>
        </div>
      ),
    },
    {
      title: "買家",
      key: "buyer",
      render: (_, { buyerName, buyerEmail, buyerPhone }) => (
        <div className="flex flex-col gap-[2px]">
          <span className="font-semibold">{buyerName || "—"}</span>
          <Typography.Text copyable={!!buyerEmail} className="text-[12px]">
            {buyerEmail || "—"}
          </Typography.Text>
          <span className="text-[12px] text-black/65">{buyerPhone || "—"}</span>
        </div>
      ),
    },
    {
      title: "訊息",
      dataIndex: "message",
      key: "message",
      render: (_, { message: note }) =>
        note ? (
          <span className="whitespace-pre-wrap">{note}</span>
        ) : (
          <span className="text-black/25">（沒有留言）</span>
        ),
    },
    {
      title: "狀態",
      dataIndex: "status",
      key: "status",
      width: 140,
      render: (_, inquiry) => (
        <Select
          value={inquiry.status}
          options={STATUS_OPTIONS}
          loading={updatingId === inquiry.id}
          disabled={updatingId === inquiry.id}
          onChange={(status) => handleStatusChange(inquiry, status)}
          className="w-[120px]"
        />
      ),
    },
  ];

  return (
    <div className="p-[16px]">
      {messageHolder}
      <Space className="mb-[12px]" wrap>
        <Segmented<Scope>
          value={scope}
          onChange={setScope}
          options={[
            { label: "待處理（新詢問＋已聯繫）", value: "open" },
            { label: "全部", value: "all" },
          ]}
        />
      </Space>
      <Table
        size="small"
        rowKey="id"
        columns={columns}
        dataSource={visibleInquiries}
        loading={loading}
        scroll={{ x: 900 }}
      />
    </div>
  );
}
