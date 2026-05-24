"use client";

import { useRouter } from "next/navigation";
import { auth } from "@/firebase/client";
import Button from "@/components/refactored/Button";

export default function SellButton() {
  const router = useRouter();

  function handleClick() {
    if (auth.currentUser) {
      router.push("/new/sell");
    } else {
      router.push("/new/login?redirect=/new/sell");
    }
  }

  return (
    <Button variant="mus" className="px-2 py-1 text-xs" onClick={handleClick}>
      + 限時免費刊登
    </Button>
  );
}
