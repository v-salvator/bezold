import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";
import { Inter } from "next/font/google";
import { AnimatedImage } from "@/components/animated";
import StyledComponentsRegistry from "../lib/AntdRegistry";

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
        <StyledComponentsRegistry>
          <div className="h-16 px-4 flex items-center border-b-[1px] border-b-gray-200">
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
          </div>
          {children}
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
