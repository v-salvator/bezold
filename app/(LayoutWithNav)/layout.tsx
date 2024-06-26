import "../globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { cn } from "@/utils";

import { Header, Switcher } from "@/components";
import { AntdRegistry } from "@ant-design/nextjs-registry";

const inter = Inter({ subsets: ["latin"] });

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
        <AntdRegistry>
          <Header withSearchBar />
          <Switcher
            className={cn("bg-primary w-[100%]", "fixed top-header z-10")}
          ></Switcher>
          <div className="pt-header-and-switcher">{children}</div>
        </AntdRegistry>
      </body>
    </html>
  );
}
