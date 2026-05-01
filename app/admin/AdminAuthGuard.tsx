"use client";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/firebase/client";
import { useRouter, usePathname } from "next/navigation";

export default function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const [checked, setChecked] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (pathname === "/admin/login") {
        setChecked(true);
        return;
      }
      if (!user) {
        router.replace("/admin/login");
        return;
      }
      const token = await user.getIdTokenResult();
      if (!token.claims.admin) {
        router.replace("/admin/login");
        return;
      }
      setChecked(true);
    });
    return unsubscribe;
  }, [pathname, router]);

  if (!checked) return null;
  return <>{children}</>;
}
