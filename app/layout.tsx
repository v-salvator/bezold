import "./globals.css";
import type { Metadata } from "next";
import { Suspense } from "react";
import { Noto_Sans_Mono, Noto_Sans_TC } from "next/font/google";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { ConfigProvider } from "antd";
import { Provider } from "jotai";
import AnalyticsTracker from "@/components/AnalyticsTracker";

const notoSansMono = Noto_Sans_Mono({
  subsets: ["latin"],
  variable: "--font-noto-sans-mono",
});

const notoSansTC = Noto_Sans_TC({
  subsets: ["latin"],
  variable: "--font-noto-sans-tc",
});

const SITE_TITLE = "頂讓網｜全台店面頂讓平台 - Bezold 頂讓必售";
const SITE_DESCRIPTION =
  "頂讓網 Bezold — 全台店面頂讓平台。買家直接接手已有客群、設備、營運的店面；賣家把心血交給合適的人。店面頂讓、生意頂讓真實刊登，早鳥前 3 個月免費刊登，永久不抽成。";
const SITE_KEYWORDS = [
  "頂讓網",
  "頂讓",
  "店面頂讓",
  "生意頂讓",
  "店面轉讓",
  "頂讓平台",
  "餐廳頂讓",
  "頂讓金",
  "接手店面",
  "台灣頂讓網",
];

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL!),
  title: {
    default: SITE_TITLE,
    template: "%s｜頂讓網 Bezold",
  },
  description: SITE_DESCRIPTION,
  keywords: SITE_KEYWORDS,
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    siteName: "Bezold 頂讓必售",
    type: "website",
    locale: "zh_TW",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: ["/bezold-og.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="zh-Hant"
      className={`${notoSansMono.variable} ${notoSansTC.variable} font-noto`}
    >
      <body>
        <Suspense fallback={null}>
          <AnalyticsTracker />
        </Suspense>
        <Provider>
          <AntdRegistry>
            <ConfigProvider
              theme={{
                token: {
                  fontFamily:
                    "var(--font-noto-sans-mono), var(--font-noto-sans-tc)",
                  colorPrimary: "#ff4a31",
                },
              }}
            >
              {children}
            </ConfigProvider>
          </AntdRegistry>
        </Provider>
      </body>
    </html>
  );
}
