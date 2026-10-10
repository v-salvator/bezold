"use client";
import { Suspense, useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Alert, Button, Segmented, Select, Space, Spin } from "antd";
import { getStores } from "@/firebase/clientUtils";
import { useStoreAnalytics } from "@/hooks";
import {
  STORE_STATUS,
  type Store,
  type StoreAnalyticsRange,
  type StoreStatus,
} from "@/types";
import { STATUS_LABEL } from "@/constant/adminStore";
import { DEFAULT_RANGE, RANGE_OPTIONS } from "@/constant/storeAnalytics";
import {
  emptyStoreAnalytics,
  type StoreAnalyticsRow,
} from "@/utils/storeAnalytics";
import AnalyticsKpiRow from "./_components/AnalyticsKpiRow";
import StoreAnalyticsTable from "./_components/StoreAnalyticsTable";
import ViewsRanking from "./_components/ViewsRanking";

type StatusFilter = StoreStatus | "all";

const ALL_CITIES = "all";

const STATUS_FILTER_OPTIONS: { label: string; value: StatusFilter }[] = [
  { label: "所有狀態", value: "all" },
  ...[
    STORE_STATUS.APPROVED,
    STORE_STATUS.PENDING,
    STORE_STATUS.REJECTED,
    STORE_STATUS.SOLD,
  ].map((status) => ({ label: STATUS_LABEL[status], value: status })),
];

const RANGE_SEGMENTS = RANGE_OPTIONS.map((days) => ({
  label: `${days} 天`,
  value: days,
}));

const parseRange = (value: string | null): StoreAnalyticsRange => {
  const days = Number(value);
  return RANGE_OPTIONS.includes(days as StoreAnalyticsRange)
    ? (days as StoreAnalyticsRange)
    : DEFAULT_RANGE;
};

// useSearchParams needs a Suspense boundary for the static build.
export default function StoreAnalyticsPage() {
  return (
    <Suspense fallback={<Spin className="m-[24px]" />}>
      <StoreAnalyticsContent />
    </Suspense>
  );
}

function StoreAnalyticsContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  // URL params are the source of truth so links and reloads keep the view.
  const range = parseRange(searchParams.get("range"));
  const expandedStoreId = searchParams.get("store");
  // Set only when arriving with ?store= (e.g. from Store List): that row gets
  // revealed once. Expanding rows on this page doesn't scroll.
  const revealStoreIdRef = useRef(expandedStoreId);

  const [stores, setStores] = useState<Store[]>([]);
  const [storesLoading, setStoresLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(
    STORE_STATUS.APPROVED,
  );
  const [cityFilter, setCityFilter] = useState(ALL_CITIES);
  const {
    data: analytics,
    loading: analyticsLoading,
    error: analyticsError,
    refetch,
  } = useStoreAnalytics(range);

  useEffect(() => {
    getStores()
      .then(setStores)
      .finally(() => setStoresLoading(false));
  }, []);

  const replaceParams = (changes: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(changes).forEach(([key, value]) => {
      if (value === null) params.delete(key);
      else params.set(key, value);
    });
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleRangeChange = (days: StoreAnalyticsRange) =>
    replaceParams({ range: String(days) });

  const handleExpandedChange = (storeId: string | null) =>
    replaceParams({ store: storeId });

  // Widen the filters if the linked store would otherwise be hidden (e.g. it
  // is sold, or in another city).
  useEffect(() => {
    const storeId = revealStoreIdRef.current;
    if (!storeId || storesLoading) return;
    const target = stores.find((store) => store.id === storeId);
    if (!target) {
      revealStoreIdRef.current = null;
      return;
    }
    if (
      statusFilter !== "all" &&
      (target.status ?? STORE_STATUS.PENDING) !== statusFilter
    ) {
      setStatusFilter("all");
    }
    if (cityFilter !== ALL_CITIES && target.city !== cityFilter) {
      setCityFilter(ALL_CITIES);
    }
  }, [stores, storesLoading, statusFilter, cityFilter]);

  const cityOptions = [
    { label: "所有城市", value: ALL_CITIES },
    ...Array.from(new Set(stores.map((store) => store.city).filter(Boolean)))
      .sort((left, right) =>
        (left as string).localeCompare(right as string, "zh-Hant"),
      )
      .map((city) => ({ label: city as string, value: city as string })),
  ];

  const rows: StoreAnalyticsRow[] = stores
    .filter(
      (store) =>
        (statusFilter === "all" ||
          (store.status ?? STORE_STATUS.PENDING) === statusFilter) &&
        (cityFilter === ALL_CITIES || store.city === cityFilter),
    )
    .map((store) => ({
      store,
      analytics: analytics?.stores[store.id] ?? emptyStoreAnalytics(range),
    }));

  const loading = storesLoading || (analyticsLoading && !analytics);

  useEffect(() => {
    const storeId = revealStoreIdRef.current;
    if (!storeId || loading) return;
    const rowElement = document.querySelector(
      `tr[data-row-key="${CSS.escape(storeId)}"]`,
    );
    if (!rowElement) return;
    rowElement.scrollIntoView({ block: "center", behavior: "smooth" });
    revealStoreIdRef.current = null;
  }, [loading, rows.length]);

  return (
    // contain:inline-size stops the wide table from stretching the admin
    // layout's flex column; the table scrolls inside its card instead.
    <div className="p-[16px] [contain:inline-size]">
      <div className="mb-[12px] flex flex-wrap items-center gap-[8px]">
        <Space wrap>
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            options={STATUS_FILTER_OPTIONS}
            className="w-[128px]"
          />
          <Select
            value={cityFilter}
            onChange={setCityFilter}
            options={cityOptions}
            showSearch
            optionFilterProp="label"
            className="w-[128px]"
          />
        </Space>
        <div className="flex-1" />
        <Segmented
          value={range}
          onChange={(value) => handleRangeChange(value as StoreAnalyticsRange)}
          options={RANGE_SEGMENTS}
        />
      </div>

      {analyticsError ? (
        <Alert
          type="error"
          showIcon
          message="成效資料無法載入"
          description={analyticsError}
          action={
            <Button size="small" onClick={refetch} loading={analyticsLoading}>
              重試
            </Button>
          }
        />
      ) : (
        <>
          <AnalyticsKpiRow rows={rows} days={range} loading={loading} />

          <div className="grid grid-cols-[minmax(0,1fr)] gap-[16px]">
            <ViewsRanking rows={rows} days={range} loading={loading} />
            <StoreAnalyticsTable
              rows={rows}
              days={range}
              startDate={analytics?.range.startDate ?? ""}
              generatedAt={analytics?.generatedAt ?? null}
              loading={loading}
              expandedStoreId={expandedStoreId}
              onExpandedChange={handleExpandedChange}
            />
          </div>
        </>
      )}
    </div>
  );
}
