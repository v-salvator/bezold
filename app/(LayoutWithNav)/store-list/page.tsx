import { StoreCard } from "@/components";
import { Store } from "@/types";
import { cn } from "@/utils";
import { getStores } from "@/firebase/serverUtils";

interface StorePageProps {
  searchParams: URLSearchParams;
}

async function getStoresData(searchParams: StorePageProps["searchParams"]) {
  const storeSearchParams = new URLSearchParams(searchParams);
  const searchObj = Object.fromEntries(storeSearchParams);
  // * query data from firebase
  const mockStoresByDB = await getStores(searchObj);
  return mockStoresByDB;
}

export default async function Home({ searchParams }: StorePageProps) {
  const stores = await getStoresData(searchParams);

  if (stores.length === 0) {
    return (
      <div className="flex items-center justify-center pt-[150px]">
        <h1 className="text-3xl">沒有找到商店</h1>
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
