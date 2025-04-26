import { WithoutNavLayout } from "@/components/layouts";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <WithoutNavLayout>{children}</WithoutNavLayout>;
}
