"use client";
import { useEffect, useState } from "react";
import { Table, Tag, Switch, notification, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { auth } from "@/firebase/client";

type UserRow = {
  uid: string;
  email: string;
  isAdmin: boolean;
};

async function getIdToken() {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");
  return user.getIdToken();
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [togglingUid, setTogglingUid] = useState<string | null>(null);
  const [api, contextHolder] = notification.useNotification();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = await getIdToken();
      const res = await fetch("/api/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setUsers(data);
    } catch {
      api.error({ message: "Failed to load users" });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAdmin = async (uid: string, grant: boolean) => {
    setTogglingUid(uid);
    try {
      const token = await getIdToken();
      const res = await fetch("/api/admin/set-claim", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ uid, admin: grant }),
      });
      if (!res.ok) throw new Error();
      setUsers((prev) =>
        prev.map((u) => (u.uid === uid ? { ...u, isAdmin: grant } : u))
      );
      api.success({ message: `User ${grant ? "granted" : "revoked"} admin access` });
    } catch {
      api.error({ message: "Failed to update role" });
    } finally {
      setTogglingUid(null);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const columns: ColumnsType<UserRow> = [
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
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
    {
      title: "Role",
      dataIndex: "isAdmin",
      key: "role",
      render: (isAdmin) =>
        isAdmin ? <Tag color="gold">Admin</Tag> : <Tag>User</Tag>,
    },
    {
      title: "Admin Access",
      key: "action",
      render: (_, record) => (
        <Switch
          checked={record.isAdmin}
          loading={togglingUid === record.uid}
          onChange={(checked) => handleToggleAdmin(record.uid, checked)}
        />
      ),
    },
  ];

  return (
    <div className="p-[16px]">
      {contextHolder}
      <Typography.Title level={4}>User Management</Typography.Title>
      <Table
        rowKey="uid"
        columns={columns}
        dataSource={users}
        loading={loading}
        pagination={false}
      />
    </div>
  );
}
