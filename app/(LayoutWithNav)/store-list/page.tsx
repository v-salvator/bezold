import { StoreCard } from "@/components";
import { Store } from "@/types";

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

  return (
    <div // TODO: turn this into grid layout
      className="flex flex-wrap justify-evenly py-[16px] gap-y-[24px] gap-x-[8px] bg-[white] mx-[48px]"
      style={{ border: "1px solid green" }}
    >
      {stores.map((store: Store) => (
        <StoreCard key={store.id} store={store}></StoreCard>
      ))}
    </div>
  );
}
