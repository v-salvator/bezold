import { useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAtomValue } from "jotai";
import { filtersAtom } from "@/atoms/SearchFilterAtom";

const useHandleSearch = () => {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { city, tag, amountFilter } = useAtomValue(filtersAtom);

  const handleSearchClick = () => {
    startTransition(() => {
      const cityName = city?.key;
      const tagName = tag?.key;
      const amountMinMax = amountFilter?.value;

      const newSearchParams = new URLSearchParams({
        ...(cityName && { city: cityName }),
        ...(tagName && { tag: tagName }),
        ...(amountMinMax && {
          amountMin: amountMinMax[0].toString(),
          amountMax: amountMinMax[1].toString(),
        }),
        ...(searchParams.has("category") && {
          category: searchParams.get("category")!,
        }),
      });
      router.push(`/store-list?${newSearchParams.toString()}`);
    });
  };

  return {
    handleSearchClick,
    isPending,
  };
};

export default useHandleSearch;
