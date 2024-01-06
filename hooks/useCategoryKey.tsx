import { usePathname, useSearchParams } from "next/navigation";

const useCategoryKey = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const fallBackKey = pathname === "/about" ? "about" : "all";
  const categoryKey = searchParams.get("category") ?? fallBackKey;

  return categoryKey;
};

export default useCategoryKey;
