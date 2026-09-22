"use client";
import { useEffect, useRef, useState } from "react";
import { getStores } from "@/firebase/clientUtils";
import { updateStoreStatus } from "@/firebase/clientUtils";
import {
  Space,
  Table,
  Tag,
  Button as AntButton,
  Input,
  DatePicker,
  Modal,
  Select,
  message,
} from "antd";
import dayjs from "dayjs";
import type { Dayjs } from "dayjs";

import type { TableProps } from "antd";
import type { Store } from "@/types";
import { STORE_STATUS, type StoreStatus } from "@/types";
import { formatPriceDisplay } from "@/utils/store";
import { STORE_CATEGORIES } from "@/constant/storeType";
import { STATUS_COLOR, STATUS_LABEL } from "@/constant/adminStore";
import { authedFetch } from "@/lib/authedFetch";
import { useAdminAuth } from "@/hooks";
import { cn } from "@/lib/utils";
import StoreDetailDrawer from "./_components/StoreDetailDrawer";

type StatusFilter = StoreStatus | "all";

const STATUS_FILTER_OPTIONS: { label: string; value: StatusFilter }[] = [
  { label: "所有狀態", value: "all" },
  ...[
    STORE_STATUS.PENDING,
    STORE_STATUS.APPROVED,
    STORE_STATUS.REJECTED,
    STORE_STATUS.SOLD,
  ].map((status) => ({ label: STATUS_LABEL[status], value: status })),
];

const BULK_STATUS_ACTIONS: { label: string; status: StoreStatus }[] = [
  { label: "✓ 通過", status: STORE_STATUS.APPROVED },
  { label: "✕ 拒絕", status: STORE_STATUS.REJECTED },
  { label: "已頂讓", status: STORE_STATUS.SOLD },
];

export default function List() {
  const { idToken } = useAdminAuth();
  const [modal, modalHolder] = Modal.useModal();
  const [messageApi, messageHolder] = message.useMessage();
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  // storeId whose status is being written (drawer or bulk).
  const [updating, setUpdating] = useState<string | null>(null);
  const [bulkUpdating, setBulkUpdating] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeStoreId, setActiveStoreId] = useState<string | null>(null);
  // guards against opening a second confirm for the same row (e.g. a same-tick
  // double-click, which the modal mask cannot block until it has mounted).
  const confirmOpenRef = useRef(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [dateRange, setDateRange] = useState<
    [Dayjs | null, Dayjs | null] | null
  >(null);

  const normalizedSearch = search.trim().toLowerCase();
  const [rangeStart, rangeEnd] = dateRange ?? [null, null];
  const activeStore =
    stores.find((store) => store.id === activeStoreId) ?? null;

  const filteredStores = stores.filter((store) => {
    const matchesSearch =
      !normalizedSearch ||
      store.storeName?.toLowerCase().includes(normalizedSearch) ||
      store.user?.toLowerCase().includes(normalizedSearch);

    const matchesStatus =
      statusFilter === "all" ||
      (store.status ?? STORE_STATUS.PENDING) === statusFilter;

    const createdAt = store.createTime ? dayjs(store.createTime) : null;
    const matchesDate =
      (!rangeStart || (createdAt && !createdAt.isBefore(rangeStart, "day"))) &&
      (!rangeEnd || (createdAt && !createdAt.isAfter(rangeEnd, "day")));

    return matchesSearch && matchesStatus && matchesDate;
  });

  const fetchStores = async () => {
    setLoading(true);
    try {
      const fetchedStores = await getStores();
      setStores(fetchedStores);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  // updateStoreStatus also stamps updateTime server-side; mirror it locally so
  // the 更新 column reflects the change without a refetch.
  const applyStatus = (storeIds: string[], status: StoreStatus) => {
    const now = new Date();
    setStores((previous) =>
      previous.map((store) =>
        storeIds.includes(store.id)
          ? { ...store, status, updateTime: now }
          : store,
      ),
    );
  };

  const handleStatusChange = async (storeId: string, status: StoreStatus) => {
    setUpdating(storeId);
    try {
      await updateStoreStatus(storeId, status);
      applyStatus([storeId], status);
      messageApi.success(`已更新為「${STATUS_LABEL[status]}」`);
    } catch {
      messageApi.error("更新失敗，請稍後再試");
    } finally {
      setUpdating(null);
    }
  };

  const handleBulkStatusChange = async (status: StoreStatus) => {
    setBulkUpdating(true);
    const results = await Promise.allSettled(
      selectedIds.map((storeId) => updateStoreStatus(storeId, status)),
    );
    const succeededIds = selectedIds.filter(
      (_, index) => results[index].status === "fulfilled",
    );
    const failedIds = selectedIds.filter(
      (_, index) => results[index].status === "rejected",
    );
    applyStatus(succeededIds, status);
    // Keep only the failures selected so the admin can retry them.
    setSelectedIds(failedIds);
    setBulkUpdating(false);

    if (failedIds.length === 0) {
      messageApi.success(
        `已將 ${succeededIds.length} 筆更新為「${STATUS_LABEL[status]}」`,
      );
    } else {
      messageApi.error(
        `${failedIds.length} 筆更新失敗（仍保持選取），${succeededIds.length} 筆成功`,
      );
    }
  };

  const handleCopyLink = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      messageApi.success("已複製連結");
    } catch {
      messageApi.error("複製失敗，請手動選取連結");
    }
  };

  const handleDelete = (store: Store) => {
    if (confirmOpenRef.current) return;
    confirmOpenRef.current = true;
    modal.confirm({
      title: "刪除商店",
      okText: "刪除",
      okType: "danger",
      cancelText: "取消",
      content: (
        <span>
          確定要刪除「{store.storeName || `商店 ${store.id}`}
          」嗎？此操作將永久移除商店與其圖片，無法復原。
        </span>
      ),
      onCancel: () => {
        confirmOpenRef.current = false;
      },
      onOk: async () => {
        if (!idToken) {
          messageApi.error("尚未取得管理員權限，請稍後再試");
          confirmOpenRef.current = false;
          return Promise.reject();
        }
        setDeleting(store.id);
        try {
          const res = await authedFetch(idToken, `/api/stores/${store.id}`, {
            method: "DELETE",
          });
          if (!res.ok) throw new Error("Failed to delete store");
          setStores((previous) =>
            previous.filter((item) => item.id !== store.id),
          );
          setSelectedIds((previous) =>
            previous.filter((storeId) => storeId !== store.id),
          );
          setActiveStoreId((previous) =>
            previous === store.id ? null : previous,
          );
          messageApi.success("商店已刪除");
          confirmOpenRef.current = false;
        } catch {
          messageApi.error("刪除失敗，請稍後再試");
          // keep the modal open so the admin can retry; ref stays true.
          return Promise.reject();
        } finally {
          setDeleting(null);
        }
      },
    });
  };

  const columns: TableProps<Store>["columns"] = [
    {
      title: "店名",
      dataIndex: "storeName",
      key: "storeName",
      render: (_, { storeName }) => (
        <span className="font-semibold">{storeName || "—"}</span>
      ),
    },
    {
      title: "狀態",
      dataIndex: "status",
      key: "status",
      render: (_, { status }) => {
        const resolvedStatus = status ?? STORE_STATUS.PENDING;
        return (
          <Tag color={STATUS_COLOR[resolvedStatus]}>
            {STATUS_LABEL[resolvedStatus]}
          </Tag>
        );
      },
    },
    {
      title: "城市",
      dataIndex: "city",
      key: "city",
      render: (_, { city }) => city || "—",
    },
    {
      title: "區域",
      dataIndex: "district",
      key: "district",
      render: (_, { district }) => district || "—",
    },
    {
      title: "類別",
      dataIndex: "category",
      key: "category",
      render: (_, { category }) =>
        STORE_CATEGORIES.find((item) => item.key === category)?.label ??
        (category || "—"),
    },
    {
      title: "頂讓金",
      dataIndex: "price",
      key: "price",
      align: "right",
      sorter: (left, right) => (left.price ?? 0) - (right.price ?? 0),
      render: (_, record) =>
        formatPriceDisplay(record.price, record.priceNegotiable),
    },
    {
      title: "坪數",
      dataIndex: "areaPing",
      key: "areaPing",
      align: "right",
      render: (_, { areaPing }) => areaPing ?? "—",
    },
    {
      title: "月租",
      dataIndex: "monthlyRent",
      key: "monthlyRent",
      align: "right",
      render: (_, { monthlyRent }) =>
        monthlyRent ? monthlyRent.toLocaleString() : "—",
    },
    {
      title: "建立",
      dataIndex: "createTime",
      key: "createTime",
      sorter: (left, right) =>
        dayjs(left.createTime).valueOf() - dayjs(right.createTime).valueOf(),
      render: (_, { createTime }) => (
        <span className="whitespace-nowrap text-black/45">
          {dayjs(createTime).format("YYYY-MM-DD")}
        </span>
      ),
    },
    {
      title: "更新",
      dataIndex: "updateTime",
      key: "updateTime",
      defaultSortOrder: "descend",
      // dayjs(undefined) is "now" — sort stores missing updateTime last instead.
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
  ];

  return (
    <div className="p-[16px]">
      {modalHolder}
      {messageHolder}
      <Space className="mb-[12px]" wrap>
        <Input.Search
          allowClear
          placeholder="Search by store name or user ID"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="w-[320px] max-w-full"
        />
        <Select
          value={statusFilter}
          onChange={setStatusFilter}
          options={STATUS_FILTER_OPTIONS}
          className="w-[128px]"
        />
        <DatePicker.RangePicker
          value={dateRange}
          onChange={(range) => setDateRange(range)}
          placeholder={["Created from", "Created to"]}
        />
      </Space>

      {selectedIds.length > 0 && (
        <div className="mb-[12px] flex flex-wrap items-center gap-[8px] rounded-[8px] border border-solid border-[#ffd8d1] bg-[#fff1ee] px-[12px] py-[8px]">
          <span className="font-semibold">已選取 {selectedIds.length} 筆</span>
          {BULK_STATUS_ACTIONS.map((action) => (
            <AntButton
              key={action.status}
              size="small"
              disabled={bulkUpdating}
              onClick={() => handleBulkStatusChange(action.status)}
            >
              {action.label}
            </AntButton>
          ))}
          <AntButton
            size="small"
            type="text"
            disabled={bulkUpdating}
            onClick={() => setSelectedIds([])}
          >
            取消選取
          </AntButton>
        </div>
      )}

      <Table
        size="small"
        columns={columns}
        dataSource={filteredStores}
        rowKey="id"
        loading={loading || bulkUpdating}
        scroll={{ x: 1040 }}
        rowSelection={{
          selectedRowKeys: selectedIds,
          onChange: (keys) => setSelectedIds(keys as string[]),
        }}
        onRow={(record) => ({
          onClick: (event) => {
            // Ticking a checkbox selects the row; it shouldn't open the drawer.
            const target = event.target as HTMLElement;
            if (target.closest(".ant-table-selection-column")) return;
            setActiveStoreId(record.id);
          },
        })}
        rowClassName={(record) =>
          cn(
            "cursor-pointer",
            record.id === activeStoreId && "[&>td]:!bg-[#fff1ee]",
          )
        }
      />

      <StoreDetailDrawer
        store={activeStore}
        statusUpdating={updating === activeStoreId}
        deleting={deleting === activeStoreId}
        onClose={() => setActiveStoreId(null)}
        onStatusChange={handleStatusChange}
        onDelete={handleDelete}
        onCopyLink={handleCopyLink}
      />
    </div>
  );
}
