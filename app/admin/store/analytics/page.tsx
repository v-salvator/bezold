"use client";
import { Suspense, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Segmented, Select, Space, Spin } from "antd";
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

  const [stores, setStores] = useState<Store[]>([]);
  const [storesLoading, setStoresLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(
    STORE_STATUS.APPROVED,
  );
  const [cityFilter, setCityFilter] = useState(ALL_CITIES);
  const { data: analytics, loading: analyticsLoading } =
    useStoreAnalytics(range);

  useEffect(() => {
    getStores()
      .then(setStores)
      .finally(() => setStoresLoading(false));
  }, []);

  const handleRangeChange = (days: StoreAnalyticsRange) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("range", String(days));
    router.replace(`${pathname}?${params.toString()}`);
  };

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

      <AnalyticsKpiRow rows={rows} loading={loading} />

      <div className="grid grid-cols-[minmax(0,1fr)] gap-[16px] xl:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] xl:items-start">
        <ViewsRanking rows={rows} days={range} loading={loading} />
        <StoreAnalyticsTable rows={rows} days={range} loading={loading} />
      </div>
    </div>
  );
}
