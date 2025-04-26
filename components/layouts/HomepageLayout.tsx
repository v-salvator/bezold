import { Header, Footer } from "@/components";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header withSearchBar={false} withNavLinks />
      <div className="mt-header">{children}</div>
      <Footer />
    </>
  );
}
