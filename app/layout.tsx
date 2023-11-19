import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
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
          <div className="border-test h-16 px-4 flex items-center">
            <div className="border-test w-36 h-8">logogg</div>
          </div>
          {children}
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
