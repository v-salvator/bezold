"use client"; // Error components must be Client Components

import { useEffect } from "react";
import { Button } from "antd";
import { useRouter } from "next/navigation";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();
  useEffect(() => {
    // Log the error to an error reporting service
    console.log(error);
  }, [error]);

  return (
    <div className="w-[480px] mt-[64px] mx-auto text-center pt-[150px]">
      <h2>Oops! Cannot find Store</h2>
      <div className="flex justify-center mt-[16px] gap-x-[16px]">
        <Button
          onClick={
            // Attempt to recover by trying to re-render the segment
            () => reset()
          }
        >
          Try again
        </Button>
        <Button
          type="primary"
          onClick={
            // Attempt to recover by trying to re-render the segment
            () => router.push("/store-list")
          }
        >
          Back to List
        </Button>
      </div>
    </div>
  );
}
