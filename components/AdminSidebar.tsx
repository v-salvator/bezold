"use client";
import type { MenuProps } from "antd";
import { Menu } from "antd";
import { useRouter } from "next/navigation";
import { useAdminMenuKey } from "@/hooks";

type MenuItem = Required<MenuProps>["items"][number];

const items: MenuItem[] = [
  {
    key: "store-management",
    label: "Store Management",
    type: "group",
    children: [
      { key: "store-create", label: "Store Create" },
      { key: "store-list", label: "Store List" },
      { key: "store-batch", label: "Batch Stores" },
    ],
  },
  {
    key: "user-management",
    label: "User Management",
    type: "group",
    children: [{ key: "user-list", label: "User List" }],
  },
];

export default function AdminSidebar() {
  const router = useRouter();
  const menuKey = useAdminMenuKey();

  const handleMenuClick: MenuProps["onClick"] = (e) => {
    switch (e.key) {
      case "store-create":
        router.push("/admin/store/create");
        break;
      case "store-list":
        router.push("/admin/store/list");
        break;
      case "store-batch":
        router.push("/admin/store/batch");
        break;
      case "user-list":
        router.push("/admin/users");
        break;
    }
  };

  return (
    <Menu
      onClick={handleMenuClick}
      style={{ width: 256 }}
      defaultSelectedKeys={[menuKey]}
      mode="inline"
      items={items}
    />
  );
}
