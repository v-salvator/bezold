import { Suspense } from "react";
import { cn } from "@/lib/utils";

import { Header, Switcher, Footer } from "@/components";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense>
      <Header withSearchBar />
      <div className="fixed top-header z-10 w-[100%] bg-primary ">
        <Switcher className={cn("mx-auto text-center")}></Switcher>
      </div>
      <div
        className={cn(
          "pt-header-and-switcher pb-[16px]",
          "min-h-[calc(100vh-100px)]", // * for footer height
          "overflow-x-hidden" // * for template animating not showing x scroll bar
        )}
      >
        {children}
      </div>
      <Footer />
    </Suspense>
  );
}
