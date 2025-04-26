import { Suspense } from "react";
import { cn } from "@/utils";

import { Header, Switcher } from "@/components";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense>
      <Header withSearchBar />
      <div className="fixed top-header z-10 w-[100%] bg-primary">
        <Switcher className={cn("mx-auto text-center")}></Switcher>
      </div>
      <div className="pt-header-and-switcher">{children}</div>
    </Suspense>
  );
}
