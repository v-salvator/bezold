import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";
import { Inter } from "next/font/google";

import { AnimatedImage } from "@/components/animated";
import { SearchBar } from "@/components";
import { cn } from "@/utils";

import StyledComponentsRegistry from "../lib/AntdRegistry";

const inter = Inter({ subsets: ["latin"] });

const LogoLink = () => {
  return (
    <Link
      href="/store-list?category=all"
      className="w-[144px] h-[32px] relative"
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

const SupportIcon = () => {
  return <div className="w-[32px] h-[32px] bg-gray-300 rounded-[50%]"></div>;
};

export const metadata: Metadata = {
  title: "Bezold",
  description: "get to startup right now",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <StyledComponentsRegistry>
          <div
            className={cn(
              "h-header px-[16px] w-[100%] bg-primary",
              "border-b-[1px] border-b-gray-200",
              "flex items-center justify-between",
              "fixed top-0 z-10"
            )}
          >
            <LogoLink />
            <SearchBar className="absolute left-1/2 -translate-x-1/2" />
            <SupportIcon />
          </div>
          {children}
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
