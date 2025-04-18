import { StoreCard } from "@/components";
import { Slider3D } from "@/components/animated";
import { Store } from "@/types";

async function getHighlightedStores() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/stores/highlight`,
    process.env.NODE_ENV === "development"
      ? {
          cache: "no-store",
        }
      : undefined
  );
  return res.json();
}

export default async function Home() {
  const { data: highlightedStores } = await getHighlightedStores();

  return (
    <div>
      <div className="h-[100px] bg-red-500 text-white"> banner</div>
      <Slider3D />
      <div
        className="grid grid-cols-4 gap-4 py-[16px] mx-[48px] justify-items-center"
        style={{ border: "1px solid green" }}
      >
        {highlightedStores.map((store: Store) => (
          <StoreCard key={store.id} store={store} />
        ))}
      </div>
      <div>bezold guide 3 steps or 3 features</div>
    </div>
  );
}
