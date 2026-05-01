"use client";
import { useEffect, useState } from "react";
import { Table, Tag, Switch, notification, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useAdminAuth } from "@/hooks";

type UserRow = {
  uid: string;
  email: string;
  isAdmin: boolean;
};

export default function AdminUsersPage() {
  const { idToken } = useAdminAuth();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [togglingUid, setTogglingUid] = useState<string | null>(null);
  const [api, contextHolder] = notification.useNotification();

  const fetchUsers = async () => {
    if (!idToken) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users", {
        headers: { Authorization: `Bearer ${idToken}` },
      });
      if (!res.ok) throw new Error();
      setUsers(await res.json());
    } catch {
      api.error({ message: "Failed to load users" });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAdmin = async (uid: string, grant: boolean) => {
    if (!idToken) return;
    setTogglingUid(uid);
    try {
      const res = await fetch("/api/admin/set-claim", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ uid, admin: grant }),
      });
      if (!res.ok) throw new Error();
      setUsers((prev) =>
        prev.map((u) => (u.uid === uid ? { ...u, isAdmin: grant } : u)),
      );
      api.success({ message: `Admin access ${grant ? "granted" : "revoked"}` });
    } catch {
      api.error({ message: "Failed to update role" });
    } finally {
      setTogglingUid(null);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [idToken]);

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
