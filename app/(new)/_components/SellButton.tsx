"use client";

import { useRouter } from "next/navigation";
import { auth, trackEvent } from "@/firebase/client";
import Button from "@/components/refactored/Button";

export default function SellButton() {
  const router = useRouter();

  function handleClick() {
    trackEvent("sell_cta_click", { cta_location: "nav" });
    if (auth.currentUser) {
      router.push("/sell");
    } else {
      router.push("/login?redirect=/sell");
    }
  }

  return (
    <Button variant="mus" className="px-2 py-1 text-xs" onClick={handleClick}>
      + 限時免費刊登
    </Button>
  );
}
