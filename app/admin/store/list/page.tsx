"use client";
import { useEffect, useState } from "react";
import { getStores } from "@/firebase/clientUtils";
import { Space, Table, Tag } from "antd";
import dayjs from "dayjs";
import Link from "next/link";

import type { TableProps } from "antd";
import type { Store } from "@/types";

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
  },
  {
    title: "Tags",
    key: "tags",
    dataIndex: "tags",
    render: (_, { tags }) => (
      <>
        {tags?.map((tag) => {
          let color = tag.length > 5 ? "geekblue" : "green";
          if (tag === "loser") {
            color = "volcano";
          }
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
    title: "Created At",
    dataIndex: "createTime",
    key: "createTime",
    render: (_, { createTime }) => {
      return dayjs(createTime).format("YYYY-MM-DD h:mm:ss A");
    },
  },
  {
    title: "Action",
    key: "action",
    render: (_, record) => (
      <Space size="middle">
        <Link href={`/admin/store/edit/${record.id}`}>Edit</Link>
        <a href={`/store/${record.id}`} target="_blank">
          View
        </a>
        <a>Delete</a>
      </Space>
    ),
  },
];

export default function List() {
  const [stores, setStores] = useState<Store[]>([]);
  useEffect(() => {
    const fetchStores = async () => {
      const stores = await getStores();
      setStores(stores);
      console.log(stores);
    };
    fetchStores();
  }, []);
  return (
    <div className="p-[16px]">
      <Table columns={columns} dataSource={stores} rowKey={"id"} />
    </div>
  );
}
