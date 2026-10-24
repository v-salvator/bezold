"use client";
import { useEffect } from "react";
import type { MenuProps } from "antd";
import { Badge, Menu } from "antd";
import { useAtom } from "jotai";
import { useRouter } from "next/navigation";
import { useAdminAuth, useAdminMenuKey } from "@/hooks";
import { authedFetch } from "@/lib/authedFetch";
import { newInquiryCountAtom } from "@/atoms/InquiryAtom";

type MenuItem = Required<MenuProps>["items"][number];

const buildItems = (newInquiryCount: number): MenuItem[] => [
  {
    key: "store-management",
    label: "Store Management",
    type: "group",
    children: [
      { key: "store-create", label: "Store Create" },
      { key: "store-list", label: "Store List" },
      { key: "store-drafts", label: "Draft Stores" },
      { key: "store-batch", label: "Batch Stores" },
      { key: "store-analytics", label: "Store Analytics" },
    ],
  },
  {
    key: "user-management",
    label: "User Management",
    type: "group",
    children: [
      { key: "user-list", label: "User List" },
      { key: "buyer-profiles", label: "Buyer Profiles" },
    ],
  },
  {
    key: "digital-assets",
    label: "Digital Assets",
    type: "group",
    children: [
      {
        key: "inquiries",
        label: (
          <span className="flex items-center justify-between gap-[8px]">
            詢問
            {/* Badge hides itself at 0 */}
            <Badge count={newInquiryCount} size="small" />
          </span>
        ),
      },
    ],
  },
];

export default function AdminSidebar() {
  const router = useRouter();
  const menuKey = useAdminMenuKey();
  const { idToken } = useAdminAuth();
  const [newInquiryCount, setNewInquiryCount] = useAtom(newInquiryCountAtom);

  // Refetch on entering admin and on each admin page change — no polling.
  // menuKey (not idToken) drives it so the hourly token refresh doesn't refetch.
  useEffect(() => {
    if (!idToken) return;
    let active = true;
    authedFetch(idToken, "/api/admin/inquiries/count")
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (active && data) setNewInquiryCount(data.new);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [menuKey, Boolean(idToken)]);

  const handleMenuClick: MenuProps["onClick"] = (e) => {
    switch (e.key) {
      case "store-create":
        router.push("/admin/store/create");
        break;
      case "store-list":
        router.push("/admin/store/list");
        break;
      case "store-drafts":
        router.push("/admin/store/drafts");
        break;
      case "store-batch":
        router.push("/admin/store/batch");
        break;
      case "store-analytics":
        router.push("/admin/store/analytics");
        break;
      case "user-list":
        router.push("/admin/users");
        break;
      case "buyer-profiles":
        router.push("/admin/buyer-profiles");
        break;
      case "inquiries":
        router.push("/admin/inquiries");
        break;
    }
  };

  return (
    <Menu
      onClick={handleMenuClick}
      style={{ width: 256 }}
      defaultSelectedKeys={[menuKey]}
      mode="inline"
      items={buildItems(newInquiryCount)}
    />
  );
}
