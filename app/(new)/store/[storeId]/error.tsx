"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/refactored/Button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.log(error);
  }, [error]);

  return (
    <div className="w-[480px] mt-[64px] mx-auto text-center pt-[150px]">
      <h2>找不到這個物件</h2>
      <div className="flex justify-center mt-[16px] gap-x-[16px]">
        <Button variant="ghost" onClick={reset}>
          再試一次
        </Button>
        <Button onClick={() => router.push("/store-list")}>回到找店列表</Button>
      </div>
    </div>
  );
}
