import * as React from "react";
import Link from "next/link";

import { AnimatedImage } from "@/components/animated";
import { cn } from "@/utils";

const LogoLink = ({ className }: { className: string }) => {
  return (
    <Link href="/" className={cn("w-[144px] h-[32px] relative", className)}>
      <AnimatedImage
        className="bg-transparent"
        isRounded={false}
        src="/bezold-removebg-rect.png"
        alt="bezold logo"
      />
    </Link>
  );
};

export default function Header({
  withNavLinks = false,
  rightSlot,
}: {
  withNavLinks?: boolean;
  rightSlot?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        // Layout & Positioning
        "fixed top-0 z-10",
        "h-header w-[100%]",
        // Spacing & Background
        "px-[16px] bg-primary",
        // Border
        "border-b-[1px] border-b-gray-200",
        // Flexbox
        "flex items-center justify-between",
      )}
    >
      <LogoLink className="max-sm:hidden" />
      {rightSlot && <div className="ml-auto">{rightSlot}</div>}
      {withNavLinks && (
        <div>
          {/* <Link className="mx-[4px] font-extralight" href="/about">
            關於我們
          </Link> */}
          <Link
            className="mx-[4px] font-extralight"
            href="/store-list?category=all"
          >
            店家列表
          </Link>
          <Link className="mx-[4px] font-extralight sliding-bg" href="/how">
            如何刊登
          </Link>
          <Link
            className="mx-[4px] font-extralight cross-swap"
            href="https://line.me/R/ti/p/@316zvvmj"
            target="_blank"
          >
            加入line
          </Link>
        </div>
      )}
    </div>
  );
}
