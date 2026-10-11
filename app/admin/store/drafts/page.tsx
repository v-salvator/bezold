"use client";
import { useCallback, useEffect, useState } from "react";
import { Button as AntButton, Input, Progress, Space, Table } from "antd";
import dayjs from "dayjs";
import Link from "next/link";

import type { TableProps } from "antd";
import type { Store } from "@/types";
import { STORE_STATUS } from "@/types";
import { getStores, getUserById } from "@/firebase/clientUtils";
import { formatPriceDisplay } from "@/utils/store";
import { getDraftChecklist, type DraftChecklist } from "@/utils/storeDraft";

type DraftRow = Store & { checklist: DraftChecklist };

const loadDrafts = async (): Promise<DraftRow[]> => {
  const stores = await getStores();
  const drafts = stores.filter((store) => store.status === STORE_STATUS.DRAFT);
  // getStores() doesn't join seller docs, which completeness needs.
  const sellers = await Promise.all(
    drafts.map((draft) =>
      draft.user
        ? getUserById(draft.user).catch(() => undefined)
        : Promise.resolve(undefined),
    ),
  );
  return drafts.map((draft, index) => ({
    ...draft,
    checklist: getDraftChecklist(draft, sellers[index]),
  }));
};

export default function DraftStores() {
  const [drafts, setDrafts] = useState<DraftRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchDrafts = useCallback(async () => {
    setLoading(true);
    try {
      setDrafts(await loadDrafts());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDrafts();
  }, [fetchDrafts]);

  const normalizedSearch = search.trim().toLowerCase();
  const filteredDrafts = drafts.filter(
    (draft) =>
      !normalizedSearch ||
      draft.storeName?.toLowerCase().includes(normalizedSearch),
  );

  const columns: TableProps<DraftRow>["columns"] = [
    {
      title: "店名",
      dataIndex: "storeName",
      key: "storeName",
      render: (_, { storeName }) =>
        storeName ? (
          <span className="font-semibold">{storeName}</span>
        ) : (
          <span className="text-black/45">（未命名）</span>
        ),
    },
    {
      title: "完成度",
      key: "checklist",
      sorter: (left, right) => left.checklist.percent - right.checklist.percent,
      render: (_, { checklist }) => (
        <Progress
          percent={checklist.percent}
          size="small"
          className="!m-0 w-[140px]"
          format={() => `${checklist.done}/${checklist.total}`}
        />
      ),
    },
    {
      title: "城市／區域",
      key: "area",
      render: (_, { city, district }) =>
        [city, district].filter(Boolean).join(" ") || "—",
    },
    {
      title: "頂讓金",
      dataIndex: "price",
      key: "price",
      align: "right",
      render: (_, record) =>
        formatPriceDisplay(record.price, record.priceNegotiable),
    },
    {
      title: "建立",
      dataIndex: "createTime",
      key: "createTime",
      defaultSortOrder: "descend",
      sorter: (left, right) =>
        dayjs(left.createTime).valueOf() - dayjs(right.createTime).valueOf(),
      render: (_, { createTime }) => (
        <span className="whitespace-nowrap text-black/45">
          {dayjs(createTime).format("YYYY-MM-DD")}
        </span>
      ),
    },
    {
      title: "最後編輯",
      dataIndex: "updateTime",
      key: "updateTime",
      sorter: (left, right) =>
        (left.updateTime ? dayjs(left.updateTime).valueOf() : 0) -
        (right.updateTime ? dayjs(right.updateTime).valueOf() : 0),
      render: (_, { updateTime }) =>
        updateTime ? (
          <span className="whitespace-nowrap text-black/45">
            {dayjs(updateTime).format("YYYY-MM-DD HH:mm")}
          </span>
        ) : (
          "—"
        ),
    },
    {
      title: "操作",
      key: "actions",
      render: (_, { id }) => (
        <Space size={4}>
          <Link href={`/admin/store/edit/${id}`}>
            <AntButton size="small" type="link">
              編輯
            </AntButton>
          </Link>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-[16px]">
      <Space className="mb-[12px]" wrap>
        <Input.Search
          allowClear
          placeholder="Search by store name"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="w-[320px] max-w-full"
        />
        <Link href="/admin/store/create">
          <AntButton type="primary">＋ 新增草稿</AntButton>
        </Link>
      </Space>

      <Table
        size="small"
        columns={columns}
        dataSource={filteredDrafts}
        rowKey="id"
        loading={loading}
        scroll={{ x: 960 }}
        locale={{ emptyText: "目前沒有草稿" }}
      />
    </div>
  );
}
