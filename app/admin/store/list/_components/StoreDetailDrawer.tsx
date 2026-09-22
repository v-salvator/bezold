"use client";
import { useEffect, useState } from "react";
import {
  Button as AntButton,
  Descriptions,
  Drawer,
  Image,
  Input,
  Segmented,
  Space,
  Tag,
} from "antd";
import dayjs from "dayjs";
import Link from "next/link";

import type { Store } from "@/types";
import { STORE_STATUS, type StoreStatus } from "@/types";
import { getImageByPath } from "@/firebase/clientUtils";
import { formatPriceDisplay } from "@/utils/store";
import { STORE_CATEGORIES } from "@/constant/storeType";
import { EQUIPMENT_LABEL } from "@/constant/storeEquipment";
import { STATUS_LABEL, TAG_COLOR } from "@/constant/adminStore";

// Appending this to a store URL force-opens the buyer club popup for
// logged-out visitors (see app/(new)/store/[storeId]/page.tsx).
const BUYER_CLUB_MODAL_PARAM = "modal=buyer-club";

const STATUS_OPTIONS = [
  STORE_STATUS.PENDING,
  STORE_STATUS.APPROVED,
  STORE_STATUS.REJECTED,
  STORE_STATUS.SOLD,
].map((status) => ({ label: STATUS_LABEL[status], value: status }));

interface StoreDetailDrawerProps {
  store: Store | null;
  statusUpdating: boolean;
  deleting: boolean;
  onClose: () => void;
  onStatusChange: (storeId: string, status: StoreStatus) => void;
  onDelete: (store: Store) => void;
  onCopyLink: (url: string) => void;
}

export default function StoreDetailDrawer({
  store,
  statusUpdating,
  deleting,
  onClose,
  onStatusChange,
  onDelete,
  onCopyLink,
}: StoreDetailDrawerProps) {
  return (
    <Drawer
      open={Boolean(store)}
      onClose={onClose}
      title={store?.storeName || "商店詳情"}
      width={400}
      // No mask, so the admin can click another row to switch stores
      // without closing the panel first.
      mask={false}
      destroyOnClose
      footer={
        store && (
          <div className="flex justify-between gap-[8px]">
            <AntButton
              danger
              loading={deleting}
              onClick={() => onDelete(store)}
            >
              刪除
            </AntButton>
            <Space>
              <AntButton href={`/store/${store.id}`} target="_blank">
                查看
              </AntButton>
              <Link href={`/admin/store/edit/${store.id}`}>
                <AntButton type="primary">編輯</AntButton>
              </Link>
            </Space>
          </div>
        )
      }
    >
      {store && (
        <div className="flex flex-col gap-[20px]">
          <CoverImage imagePath={store.images?.[0]} />

          <DrawerSection title="狀態">
            <Segmented
              block
              options={STATUS_OPTIONS}
              value={store.status ?? STORE_STATUS.PENDING}
              disabled={statusUpdating}
              onChange={(status) => onStatusChange(store.id, status)}
            />
          </DrawerSection>

          <DrawerSection title="資料">
            <Descriptions
              column={1}
              size="small"
              labelStyle={{ width: 88 }}
              items={buildDetailItems(store)}
            />
          </DrawerSection>

          <DrawerSection title="店家連結">
            <StoreLinks storeId={store.id} onCopy={onCopyLink} />
          </DrawerSection>
        </div>
      )}
    </Drawer>
  );
}

function buildDetailItems(store: Store) {
  const categoryLabel =
    STORE_CATEGORIES.find((category) => category.key === store.category)
      ?.label ?? store.category;
  const address = `${store.city ?? ""}${store.district ?? ""}${store.location ?? ""}`;

  return [
    {
      key: "price",
      label: "頂讓金",
      children: formatPriceDisplay(store.price, store.priceNegotiable),
    },
    { key: "address", label: "地址", children: address || "—" },
    { key: "category", label: "類別", children: categoryLabel || "—" },
    {
      key: "area",
      label: "坪數",
      children: store.areaPing ? `${store.areaPing} 坪` : "—",
    },
    {
      key: "rent",
      label: "月租",
      children: store.monthlyRent
        ? `NT$ ${store.monthlyRent.toLocaleString()}`
        : "—",
    },
    {
      key: "equipment",
      label: "設備",
      children: store.equipment ? EQUIPMENT_LABEL[store.equipment] : "—",
    },
    {
      key: "tags",
      label: "標籤",
      children: store.tags?.length
        ? store.tags.map((tag) => (
            <Tag color={TAG_COLOR[tag] ?? "default"} key={tag}>
              {tag.toUpperCase()}
            </Tag>
          ))
        : "—",
    },
    {
      key: "user",
      label: "刊登者",
      children: store.userInfo?.userName
        ? `${store.userInfo.userName}（${store.user}）`
        : store.user || "—",
    },
    {
      key: "createTime",
      label: "建立",
      children: dayjs(store.createTime).format("YYYY-MM-DD HH:mm"),
    },
    {
      key: "updateTime",
      label: "更新",
      children: dayjs(store.updateTime).format("YYYY-MM-DD HH:mm"),
    },
  ];
}

function DrawerSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-[8px]">
      <h4 className="m-0 text-[13px] font-semibold text-black/45">{title}</h4>
      {children}
    </section>
  );
}

// Store images are raw Storage paths — resolve to a download URL first.
function CoverImage({ imagePath }: { imagePath?: string }) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!imagePath) return;
    let cancelled = false;
    getImageByPath(imagePath).then((url) => {
      if (!cancelled && url !== "no-image") setImageUrl(url);
    });
    return () => {
      cancelled = true;
    };
  }, [imagePath]);

  if (!imageUrl) {
    return (
      <div className="flex h-[180px] items-center justify-center rounded-[8px] bg-black/[0.04] text-black/25">
        {imagePath ? "載入圖片中…" : "沒有圖片"}
      </div>
    );
  }
  return (
    <Image
      src={imageUrl}
      alt=""
      width="100%"
      height={180}
      className="rounded-[8px] object-cover"
    />
  );
}

function StoreLinks({
  storeId,
  onCopy,
}: {
  storeId: string;
  onCopy: (url: string) => void;
}) {
  // NEXT_PUBLIC_APP_URL is the public domain; fall back to the current origin
  // so the links still work if the env var is missing locally.
  const origin = (
    process.env.NEXT_PUBLIC_APP_URL || window.location.origin
  ).replace(/\/$/, "");
  const storeUrl = `${origin}/store/${storeId}`;
  const links = [
    { label: "一般連結", url: storeUrl },
    { label: "廣告連結", url: `${storeUrl}?${BUYER_CLUB_MODAL_PARAM}` },
  ];

  return (
    <div className="flex flex-col gap-[8px]">
      {links.map((link) => (
        <div key={link.label} className="flex items-center gap-[8px]">
          <span className="w-[64px] shrink-0 text-[12px] text-black/45">
            {link.label}
          </span>
          <Space.Compact className="min-w-0 flex-1">
            <Input
              size="small"
              readOnly
              value={link.url}
              onFocus={(event) => event.target.select()}
            />
            <AntButton size="small" onClick={() => onCopy(link.url)}>
              複製
            </AntButton>
          </Space.Compact>
        </div>
      ))}
    </div>
  );
}
