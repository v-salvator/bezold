"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Button as AntButton,
  Input,
  Modal,
  Progress,
  Space,
  Table,
  Tooltip,
  message,
} from "antd";
import dayjs from "dayjs";
import Link from "next/link";

import type { TableProps } from "antd";
import type { Store } from "@/types";
import { STORE_STATUS } from "@/types";
import {
  getStores,
  getUserById,
  updateStoreStatus,
} from "@/firebase/clientUtils";
import { authedFetch } from "@/lib/authedFetch";
import { useAdminAuth } from "@/hooks";
import { formatPriceDisplay } from "@/utils/store";
import { getDraftChecklist, type DraftChecklist } from "@/utils/storeDraft";

type DraftRow = Store & { checklist: DraftChecklist };

const loadDrafts = async (): Promise<DraftRow[]> => {
  const stores = await getStores();
  const drafts = stores.filter((store) => store.status === STORE_STATUS.DRAFT);
  // getStores() doesn't join seller docs, which completeness needs.
  const sellers = await Promise.all(
    drafts.map((draft) =>
      draft.user
        ? getUserById(draft.user).catch(() => undefined)
        : Promise.resolve(undefined),
    ),
  );
  return drafts.map((draft, index) => ({
    ...draft,
    checklist: getDraftChecklist(draft, sellers[index]),
  }));
};

const isReady = (draft: DraftRow) =>
  draft.checklist.missingRequired.length === 0;

export default function DraftStores() {
  const { idToken } = useAdminAuth();
  const [modal, modalHolder] = Modal.useModal();
  const [messageApi, messageHolder] = message.useMessage();
  const [drafts, setDrafts] = useState<DraftRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  // storeId being sent for review from its row.
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [bulkUpdating, setBulkUpdating] = useState(false);
  // guards against opening a second confirm (e.g. a same-tick double-click).
  const confirmOpenRef = useRef(false);

  const fetchDrafts = useCallback(async () => {
    setLoading(true);
    try {
      setDrafts(await loadDrafts());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDrafts();
  }, [fetchDrafts]);

  // Sent-for-review and deleted drafts both simply leave this page.
  const removeDrafts = (storeIds: string[]) => {
    setDrafts((previous) =>
      previous.filter((draft) => !storeIds.includes(draft.id)),
    );
    setSelectedIds((previous) =>
      previous.filter((storeId) => !storeIds.includes(storeId)),
    );
  };

  const handleSubmit = async (storeId: string) => {
    setSubmittingId(storeId);
    try {
      await updateStoreStatus(storeId, STORE_STATUS.PENDING);
      removeDrafts([storeId]);
      messageApi.success("已送審");
    } catch {
      messageApi.error("送審失敗，請稍後再試");
    } finally {
      setSubmittingId(null);
    }
  };

  const handleBulkSubmit = async () => {
    const selected = drafts.filter((draft) => selectedIds.includes(draft.id));
    const readyIds = selected.filter(isReady).map((draft) => draft.id);
    const notReadyIds = selected
      .filter((draft) => !isReady(draft))
      .map((draft) => draft.id);

    setBulkUpdating(true);
    const results = await Promise.allSettled(
      readyIds.map((storeId) =>
        updateStoreStatus(storeId, STORE_STATUS.PENDING),
      ),
    );
    const succeededIds = readyIds.filter(
      (_, index) => results[index].status === "fulfilled",
    );
    const failedIds = readyIds.filter(
      (_, index) => results[index].status === "rejected",
    );
    removeDrafts(succeededIds);
    // Keep whatever wasn't sent selected so the admin can fix and retry.
    setSelectedIds([...notReadyIds, ...failedIds]);
    setBulkUpdating(false);

    if (succeededIds.length > 0) {
      messageApi.success(`已送審 ${succeededIds.length} 筆`);
    }
    if (notReadyIds.length > 0) {
      messageApi.warning(`${notReadyIds.length} 筆缺少必填，未送審`);
    }
    if (failedIds.length > 0) {
      messageApi.error(`${failedIds.length} 筆送審失敗（仍保持選取）`);
    }
  };

  // Resolves to the ids that were deleted; failures are left in place.
  const deleteDrafts = async (storeIds: string[]) => {
    if (!idToken) {
      messageApi.error("尚未取得管理員權限，請稍後再試");
      return [];
    }
    const results = await Promise.allSettled(
      storeIds.map(async (storeId) => {
        const res = await authedFetch(idToken, `/api/stores/${storeId}`, {
          method: "DELETE",
        });
        if (!res.ok) throw new Error("Failed to delete store");
      }),
    );
    const deletedIds = storeIds.filter(
      (_, index) => results[index].status === "fulfilled",
    );
    removeDrafts(deletedIds);
    return deletedIds;
  };

  const confirmDelete = (storeIds: string[]) => {
    if (confirmOpenRef.current || storeIds.length === 0) return;
    confirmOpenRef.current = true;
    const isSingle = storeIds.length === 1;
    const draft = drafts.find((item) => item.id === storeIds[0]);
    const subject = isSingle
      ? `「${draft?.storeName || "（未命名）"}」`
      : `${storeIds.length} 筆草稿`;

    modal.confirm({
      title: "刪除草稿",
      okText: "刪除",
      okType: "danger",
      cancelText: "取消",
      content: (
        <span>
          確定要刪除{subject}嗎？此操作將永久移除商店與其圖片，無法復原。
        </span>
      ),
      onCancel: () => {
        confirmOpenRef.current = false;
      },
      onOk: async () => {
        if (!isSingle) setBulkUpdating(true);
        const deletedIds = await deleteDrafts(storeIds);
        if (!isSingle) setBulkUpdating(false);
        confirmOpenRef.current = false;

        const failedCount = storeIds.length - deletedIds.length;
        if (failedCount === 0) {
          messageApi.success(
            isSingle ? "草稿已刪除" : `已刪除 ${deletedIds.length} 筆草稿`,
          );
        } else {
          messageApi.error(
            isSingle
              ? "刪除失敗，請稍後再試"
              : `${failedCount} 筆刪除失敗（仍保持選取），${deletedIds.length} 筆成功`,
          );
        }
      },
    });
  };

  const normalizedSearch = search.trim().toLowerCase();
  const filteredDrafts = drafts.filter(
    (draft) =>
      !normalizedSearch ||
      draft.storeName?.toLowerCase().includes(normalizedSearch),
  );

  const columns: TableProps<DraftRow>["columns"] = [
    {
      title: "店名",
      dataIndex: "storeName",
      key: "storeName",
      render: (_, { storeName }) =>
        storeName ? (
          <span className="font-semibold">{storeName}</span>
        ) : (
          <span className="text-black/45">（未命名）</span>
        ),
    },
    {
      title: "完成度",
      key: "checklist",
      sorter: (left, right) => left.checklist.percent - right.checklist.percent,
      render: (_, { checklist }) => (
        <Progress
          percent={checklist.percent}
          size="small"
          className="!m-0 w-[140px]"
          format={() => `${checklist.done}/${checklist.total}`}
        />
      ),
    },
    {
      title: "城市／區域",
      key: "area",
      render: (_, { city, district }) =>
        [city, district].filter(Boolean).join(" ") || "—",
    },
    {
      title: "頂讓金",
      dataIndex: "price",
      key: "price",
      align: "right",
      render: (_, record) =>
        formatPriceDisplay(record.price, record.priceNegotiable),
    },
    {
      title: "建立",
      dataIndex: "createTime",
      key: "createTime",
      defaultSortOrder: "descend",
      sorter: (left, right) =>
        dayjs(left.createTime).valueOf() - dayjs(right.createTime).valueOf(),
      render: (_, { createTime }) => (
        <span className="whitespace-nowrap text-black/45">
          {dayjs(createTime).format("YYYY-MM-DD")}
        </span>
      ),
    },
    {
      title: "最後編輯",
      dataIndex: "updateTime",
      key: "updateTime",
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
    {
      title: "操作",
      key: "actions",
      render: (_, draft) => (
        <Space size={4}>
          <Link href={`/admin/store/edit/${draft.id}`}>
            <AntButton size="small" type="link">
              編輯
            </AntButton>
          </Link>
          <Tooltip
            title={
              isReady(draft)
                ? null
                : `缺少：${draft.checklist.missingRequired.join("、")}`
            }
          >
            {/* span keeps the tooltip working while the button is disabled */}
            <span>
              <AntButton
                size="small"
                type="primary"
                disabled={!isReady(draft) || bulkUpdating}
                loading={submittingId === draft.id}
                onClick={() => handleSubmit(draft.id)}
              >
                送審
              </AntButton>
            </span>
          </Tooltip>
          <AntButton
            size="small"
            type="text"
            danger
            disabled={bulkUpdating}
            onClick={() => confirmDelete([draft.id])}
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
      <Space className="mb-[12px]" wrap>
        <Input.Search
          allowClear
          placeholder="Search by store name"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="w-[320px] max-w-full"
        />
        <Link href="/admin/store/create">
          <AntButton type="primary">＋ 新增草稿</AntButton>
        </Link>
      </Space>

      {selectedIds.length > 0 && (
        <div className="mb-[12px] flex flex-wrap items-center gap-[8px] rounded-[8px] border border-solid border-[#ffd8d1] bg-[#fff1ee] px-[12px] py-[8px]">
          <span className="font-semibold">已選取 {selectedIds.length} 筆</span>
          <AntButton
            size="small"
            disabled={bulkUpdating}
            onClick={handleBulkSubmit}
          >
            送審
          </AntButton>
          <AntButton
            size="small"
            danger
            disabled={bulkUpdating}
            onClick={() => confirmDelete(selectedIds)}
          >
            刪除
          </AntButton>
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
        dataSource={filteredDrafts}
        rowKey="id"
        loading={loading || bulkUpdating}
        scroll={{ x: 1080 }}
        rowSelection={{
          selectedRowKeys: selectedIds,
          onChange: (keys) => setSelectedIds(keys as string[]),
        }}
        locale={{ emptyText: "目前沒有草稿" }}
      />
    </div>
  );
}
