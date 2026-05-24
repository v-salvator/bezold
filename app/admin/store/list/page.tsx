"use client";
import { useEffect, useState } from "react";
import { getStores } from "@/firebase/clientUtils";
import { updateStoreStatus } from "@/firebase/clientUtils";
import { Space, Table, Tag, Button as AntButton } from "antd";
import dayjs from "dayjs";
import Link from "next/link";

import type { TableProps } from "antd";
import type { Store } from "@/types";
import { STORE_STATUS, type StoreStatus } from "@/types";

const STATUS_COLOR: Record<StoreStatus, string> = {
  pending: "orange",
  approved: "green",
  rejected: "red",
};

const STATUS_LABEL: Record<StoreStatus, string> = {
  pending: "待審核",
  approved: "已上架",
  rejected: "已拒絕",
};

export default function List() {
  const [stores, setStores] = useState<Store[]>([]);
  const [updating, setUpdating] = useState<string | null>(null);

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
      render: (_, record) => `${record.price} ${record.currency}`,
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
          {tags?.map((tag) => {
            const color = tag.length > 5 ? "geekblue" : "green";
            return (
              <Tag color={color} key={tag}>
                {tag.toUpperCase()}
              </Tag>
            );
          })}
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
      ],
      onFilter: (value, record) => record.status === value,
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
        </Space>
      ),
    },
  ];

  return (
    <div className="p-[16px]">
      <Table columns={columns} dataSource={stores} rowKey={"id"} />
    </div>
  );
}
