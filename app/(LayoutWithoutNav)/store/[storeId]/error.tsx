"use client"; // Error components must be Client Components

import { useEffect } from "react";
import { Button } from "antd";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.log(error);
  }, [error]);

  return (
    <div
      className="w-[480px] mt-[64px] mx-auto text-center"
      style={{ border: "1px solid green" }}
    >
      <h2>Oops! Cannot find Store</h2>
      <Button
        onClick={
          // Attempt to recover by trying to re-render the segment
          () => reset()
        }
      >
        Try again
      </Button>
    </div>
  );
}
