import { redirect } from "next/navigation";
import { Header, Footer } from "@/components";

export default function Home({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  // You can access search params like this:
  // const category = searchParams.category;
  // const query = searchParams.q;
  console.log("Test parameter:", searchParams.test);

  return (
    <>
      <Header withSearchBar={false} withNavLinks />
      <div className="mt-header">Home</div>
      <Footer />
    </>
  );
}
