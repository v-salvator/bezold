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
  message,
} from "antd";
import dayjs from "dayjs";
import type { Dayjs } from "dayjs";
import Link from "next/link";

import type { TableProps } from "antd";
import type { Store } from "@/types";
import { STORE_STATUS, type StoreStatus } from "@/types";
import { STORE_TAG, type StoreTag } from "@/types";
import { formatPriceDisplay } from "@/utils/store";
import { authedFetch } from "@/lib/authedFetch";
import { useAdminAuth } from "@/hooks";

const STATUS_COLOR: Record<StoreStatus, string> = {
  pending: "orange",
  approved: "green",
  rejected: "red",
  sold: "default",
};

const STATUS_LABEL: Record<StoreStatus, string> = {
  pending: "待審核",
  approved: "已上架",
  rejected: "已拒絕",
  sold: "已頂讓",
};

// Explicit per-tag colours so each tag reads distinctly (the old length-based
// heuristic collapsed RECOMMENDED and DETAILED_DATA into the same blue).
const TAG_COLOR: Record<StoreTag, string> = {
  [STORE_TAG.CHEAP]: "green",
  [STORE_TAG.EMERGENCY]: "volcano",
  [STORE_TAG.RECOMMENDED]: "geekblue",
  [STORE_TAG.DETAILED_DATA]: "purple",
};

export default function List() {
  const { idToken } = useAdminAuth();
  const [modal, modalHolder] = Modal.useModal();
  const [messageApi, messageHolder] = message.useMessage();
  const [stores, setStores] = useState<Store[]>([]);
  const [updating, setUpdating] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  // guards against opening a second confirm for the same row (e.g. a same-tick
  // double-click, which the modal mask cannot block until it has mounted).
  const confirmOpenRef = useRef(false);
  const [search, setSearch] = useState("");
  const [dateRange, setDateRange] = useState<
    [Dayjs | null, Dayjs | null] | null
  >(null);

  const normalizedSearch = search.trim().toLowerCase();
  const [rangeStart, rangeEnd] = dateRange ?? [null, null];

  const filteredStores = stores.filter((store) => {
    const matchesSearch =
      !normalizedSearch ||
      store.storeName?.toLowerCase().includes(normalizedSearch) ||
      store.user?.toLowerCase().includes(normalizedSearch);

    const createdAt = store.createTime ? dayjs(store.createTime) : null;
    const matchesDate =
      (!rangeStart || (createdAt && !createdAt.isBefore(rangeStart, "day"))) &&
      (!rangeEnd || (createdAt && !createdAt.isAfter(rangeEnd, "day")));

    return matchesSearch && matchesDate;
  });

  const fetchStores = async () => {
    const fetchedStores = await getStores();
    setStores(fetchedStores);
  };

  useEffect(() => {
    fetchStores();
  }, []);

  const handleStatusChange = async (storeId: string, status: StoreStatus) => {
    setUpdating(storeId + status);
    try {
      await updateStoreStatus(storeId, status);
      setStores((previous) =>
        previous.map((store) =>
          store.id === storeId ? { ...store, status } : store,
        ),
      );
    } finally {
      setUpdating(null);
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
      title: "Name",
      dataIndex: "storeName",
      key: "storeName",
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      render: (_, record) =>
        formatPriceDisplay(record.price, record.priceNegotiable),
    },
    {
      title: "Location",
      dataIndex: "location",
      key: "location",
      render: (_, record) => (
        <div>
          <span>{`${record.city ?? "NoCity"}`}</span>
          <br />
          <span>{`${record.district ?? "NoDistrict"}`}</span>
          <br />
          <span>{`${record.location}`}</span>
        </div>
      ),
    },
    {
      title: "Tags",
      key: "tags",
      dataIndex: "tags",
      render: (_, { tags }) => (
        <>
          {tags?.map((tag) => (
            <Tag color={TAG_COLOR[tag] ?? "default"} key={tag}>
              {tag.toUpperCase()}
            </Tag>
          ))}
        </>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      filters: [
        { text: "待審核", value: STORE_STATUS.PENDING },
        { text: "已上架", value: STORE_STATUS.APPROVED },
        { text: "已拒絕", value: STORE_STATUS.REJECTED },
        { text: "已頂讓", value: STORE_STATUS.SOLD },
      ],
      onFilter: (value, record) =>
        (record.status ?? STORE_STATUS.PENDING) === value,
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
      title: "Created At",
      dataIndex: "createTime",
      key: "createTime",
      render: (_, { createTime }) =>
        dayjs(createTime).format("YYYY-MM-DD h:mm:ss A"),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space size="middle" wrap>
          <Link href={`/admin/store/edit/${record.id}`}>Edit</Link>
          <a href={`/store/${record.id}`} target="_blank" rel="noreferrer">
            View
          </a>
          <AntButton
            size="small"
            type="primary"
            disabled={
              record.status === STORE_STATUS.APPROVED ||
              updating === record.id + STORE_STATUS.APPROVED
            }
            loading={updating === record.id + STORE_STATUS.APPROVED}
            onClick={() => handleStatusChange(record.id, STORE_STATUS.APPROVED)}
          >
            通過
          </AntButton>
          <AntButton
            size="small"
            danger
            disabled={
              record.status === STORE_STATUS.REJECTED ||
              updating === record.id + STORE_STATUS.REJECTED
            }
            loading={updating === record.id + STORE_STATUS.REJECTED}
            onClick={() => handleStatusChange(record.id, STORE_STATUS.REJECTED)}
          >
            拒絕
          </AntButton>
          <AntButton
            size="small"
            disabled={
              record.status === STORE_STATUS.SOLD ||
              updating === record.id + STORE_STATUS.SOLD
            }
            loading={updating === record.id + STORE_STATUS.SOLD}
            onClick={() => handleStatusChange(record.id, STORE_STATUS.SOLD)}
          >
            已頂讓
          </AntButton>
          <AntButton
            size="small"
            danger
            type="primary"
            loading={deleting === record.id}
            onClick={() => handleDelete(record)}
          >
            刪除
          </AntButton>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-[16px]">
      {modalHolder}
      {messageHolder}
      <Space className="mb-[16px]" wrap>
        <Input.Search
          allowClear
          placeholder="Search by store name or user ID"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="w-[360px] max-w-full"
        />
        <DatePicker.RangePicker
          value={dateRange}
          onChange={(range) => setDateRange(range)}
          placeholder={["Created from", "Created to"]}
        />
      </Space>
      <Table columns={columns} dataSource={filteredStores} rowKey={"id"} />
    </div>
  );
}
