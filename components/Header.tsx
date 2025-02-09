import * as React from "react";
import Link from "next/link";

import { AnimatedImage } from "@/components/animated";
import { SearchBar, SearchDrawer } from "@/components";
import { cn } from "@/utils";

const LogoLink = ({ className }: { className: string }) => {
  return (
    <Link
      href="/store-list?category=all"
      className={cn("w-[144px] h-[32px] relative", className)}
    >
      <AnimatedImage
        className="bg-transparent"
        isRounded={false}
        src="/bezold-removebg-rect.png"
        alt="bezold logo"
      />
    </Link>
  );
};

export default function Header({ withSearchBar = true }) {
  return (
    <div
      className={cn(
        "h-header px-[16px] w-[100%] bg-primary",
        "border-b-[1px] border-b-gray-200",
        "flex items-center justify-between",
        "fixed top-0 z-10"
      )}
    >
      <LogoLink className="max-sm:hidden" />
      {withSearchBar && (
        <SearchBar className="absolute left-1/2 -translate-x-1/2 max-sm:hidden" />
      )}
      {withSearchBar && (
        <SearchDrawer className="absolute left-1/2 -translate-x-1/2 w-[80%] sm:hidden" />
      )}
    </div>
  );
}
