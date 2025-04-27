import { HomepageLayout } from "@/components/layouts";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <HomepageLayout>{children}</HomepageLayout>;
}
