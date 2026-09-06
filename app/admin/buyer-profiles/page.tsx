"use client";
import { useCallback, useEffect, useState } from "react";
import { Table, Tag, Button, notification, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { authedFetch } from "@/lib/authedFetch";
import { useAdminAuth } from "@/hooks";
import { cityItems, amountItems } from "@/components/SearchFilter/DropDowns";
import { STORE_CATEGORIES } from "@/constant/storeType";

type BuyerProfileRow = {
  uid: string;
  userName: string;
  email: string;
  phone: string;
  lineId: string;
  category: string;
  city: string;
  budgetKey: string;
  fromBuyerClub: boolean;
  createTime: number;
};

// Key → readable label maps, reusing the same constants the popup writes from.
const categoryLabels = new Map(STORE_CATEGORIES.map((c) => [c.key, c.label]));
const cityLabels = new Map(cityItems.map((c) => [c.key, c.label as string]));
const budgetLabels = new Map(amountItems.map((a) => [a.key, a.label]));

const dash = (value?: string) => (value ? value : "—");

export default function AdminBuyerProfilesPage() {
  const { idToken } = useAdminAuth();
  const [rows, setRows] = useState<BuyerProfileRow[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [api, contextHolder] = notification.useNotification();

  const fetchPage = useCallback(
    async (nextCursor: string | null) => {
      if (!idToken) return;
      setLoading(true);
      try {
        const params = new URLSearchParams({ limit: "20" });
        if (nextCursor) params.set("cursor", nextCursor);
        const res = await authedFetch(
          idToken,
          `/api/admin/buyer-profiles?${params.toString()}`,
        );
        if (!res.ok) throw new Error();
        const data: { rows: BuyerProfileRow[]; nextCursor: string | null } =
          await res.json();
        // Append when paging, replace on the first load.
        setRows((prev) => (nextCursor ? [...prev, ...data.rows] : data.rows));
        setCursor(data.nextCursor);
      } catch {
        api.error({ message: "Failed to load buyer profiles" });
      } finally {
        setLoading(false);
      }
    },
    [idToken, api],
  );

  useEffect(() => {
    fetchPage(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idToken]);

  const columns: ColumnsType<BuyerProfileRow> = [
    { title: "稱呼", dataIndex: "userName", key: "userName", render: dash },
    { title: "Email", dataIndex: "email", key: "email", render: dash },
    {
      title: "類型",
      dataIndex: "category",
      key: "category",
      render: (key) => dash(categoryLabels.get(key)),
    },
    {
      title: "地區",
      dataIndex: "city",
      key: "city",
      render: (key) => dash(cityLabels.get(key)),
    },
    {
      title: "預算",
      dataIndex: "budgetKey",
      key: "budgetKey",
      render: (key) => dash(budgetLabels.get(key)),
    },
    { title: "電話", dataIndex: "phone", key: "phone", render: dash },
    { title: "LINE ID", dataIndex: "lineId", key: "lineId", render: dash },
    {
      title: "來源",
      dataIndex: "fromBuyerClub",
      key: "fromBuyerClub",
      render: (fromBuyerClub) =>
        fromBuyerClub ? <Tag color="gold">買家俱樂部</Tag> : <Tag>其他</Tag>,
    },
    {
      title: "建立時間",
      dataIndex: "createTime",
      key: "createTime",
      render: (millis: number) =>
        millis ? new Date(millis).toLocaleString("zh-TW") : "—",
    },
    {
      title: "UID",
      dataIndex: "uid",
      key: "uid",
      render: (uid) => (
        <Typography.Text type="secondary" copyable className="text-xs">
          {uid}
        </Typography.Text>
      ),
    },
  ];

  return (
    <div className="p-[16px]">
      {contextHolder}
      <Typography.Title level={4}>Buyer Profiles</Typography.Title>
      <Table
        rowKey="uid"
        columns={columns}
        dataSource={rows}
        loading={loading}
        pagination={false}
      />
      {cursor && (
        <div className="flex justify-center mt-[16px]">
          <Button loading={loading} onClick={() => fetchPage(cursor)}>
            載入更多
          </Button>
        </div>
      )}
    </div>
  );
}
