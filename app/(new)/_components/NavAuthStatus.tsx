"use client";

import { useEffect, useRef, useState } from "react";
import { onIdTokenChanged, signOut } from "firebase/auth";
import type { User } from "firebase/auth";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { auth } from "@/firebase/client";
import Pill from "@/components/refactored/Pill";
import { cn } from "@/lib/utils";
import { isLatinChar } from "@/utils/string";
import { verifyEmailHref } from "@/lib/auth/verification";
import styles from "./NavAuthStatus.module.css";

function getInitial(user: User): string {
  if (user.displayName) return user.displayName[0];
  if (user.email) return user.email[0];
  return "?";
}

export default function NavAuthStatus() {
  const [user, setUser] = useState<User | null>(null);
  const [isVerified, setIsVerified] = useState(true);
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // onIdTokenChanged so the row disappears as soon as a verification
    // elsewhere on the page force-refreshes the token.
    const unsubscribe = onIdTokenChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      setIsVerified(firebaseUser?.emailVerified ?? true);
      if (firebaseUser) {
        const token = await firebaseUser.getIdTokenResult();
        setIsAdmin(token.claims.admin === true);
      } else {
        setIsAdmin(false);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleLogout() {
    await signOut(auth);
    setOpen(false);
  }

  if (!user) {
    return (
      <NextLink href="/login" style={{ textDecoration: "none" }}>
        <Pill>登入</Pill>
      </NextLink>
    );
  }

  return (
    <div className={styles.wrapper} ref={wrapperRef}>
      <button
        type="button"
        className={cn(
          styles.avatar,
          isLatinChar(getInitial(user)) && styles.avatarLatin,
        )}
        onClick={() => setOpen((previous) => !previous)}
        aria-label="帳號選單"
      >
        {getInitial(user)}
      </button>

      {open && (
        <div className={styles.dropdown}>
          <span className={styles.dropdownEmail}>
            {user.displayName ?? user.email}
          </span>
          {!isVerified && (
            <NextLink
              href={verifyEmailHref(pathname)}
              className={styles.dropdownVerify}
              onClick={() => setOpen(false)}
            >
              信箱未驗證
              <span className={styles.dropdownVerifyHint}>點此完成驗證</span>
            </NextLink>
          )}
          <NextLink
            href="/my-listings"
            className={styles.dropdownLink}
            onClick={() => setOpen(false)}
          >
            我的刊登
          </NextLink>
          <NextLink
            href="/acceleration"
            className={styles.dropdownLink}
            onClick={() => setOpen(false)}
          >
            頂讓加速
          </NextLink>
          {isAdmin && (
            <NextLink
              href="/admin"
              className={styles.dropdownLink}
              onClick={() => setOpen(false)}
            >
              後台管理
            </NextLink>
          )}
          <button
            type="button"
            className={styles.logoutBtn}
            onClick={handleLogout}
          >
            登出
          </button>
        </div>
      )}
    </div>
  );
}
