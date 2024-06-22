import { usePathname } from "next/navigation";

const useAdminMenuKey = () => {
  const pathname = usePathname();
  const adminMenuKey = pathname.replace("/admin/", "").replace("/", "-");

  return adminMenuKey;
};

export default useAdminMenuKey;
