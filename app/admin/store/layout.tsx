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
];

export default function AdminStoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
    }
  };

  return (
    <div className="flex h-full">
      <Menu
        onClick={handleMenuClick}
        style={{ width: 256 }}
        defaultSelectedKeys={[menuKey]}
        mode="inline"
        items={items}
      />
      <div className="flex-1"> {children}</div>
    </div>
  );
}
