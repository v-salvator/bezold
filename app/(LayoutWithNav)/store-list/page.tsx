import { StoreCard } from "@/components";
import { Store } from "@/types";
import { cn } from "@/utils";

interface StorePageProps {
  searchParams: URLSearchParams;
}

async function getStores(searchParams: StorePageProps["searchParams"]) {
  const storeSearchParams = new URLSearchParams(searchParams);
  // TODO: add get store by category
  const res = await fetch(
    `http://localhost:3000/api/stores?${storeSearchParams.toString()}`,
    {
      cache: "no-store",
    }
  );
  return res.json();
}

export default async function Home({ searchParams }: StorePageProps) {
  const { data: stores } = await getStores(searchParams);
  if (stores.length === 0) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <h1 className="text-3xl">No stores found</h1>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "grid grid-cols-[repeat(auto-fill,_minmax(240px,_1fr))] ",
        "justify-items-center gap-y-[24px] gap-x-[8px]",
        "py-[16px] mx-[48px]"
      )}
    >
      {stores.map((store: Store) => (
        <StoreCard key={store.id} store={store} />
      ))}
    </div>
  );
}
