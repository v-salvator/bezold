"use client";

import { useEffect, useRef, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import type { User } from "firebase/auth";
import NextLink from "next/link";
import { auth } from "@/firebase/client";
import Pill from "@/components/refactored/Pill";
import styles from "./NavAuthStatus.module.css";

function getInitial(user: User): string {
  if (user.displayName) return user.displayName[0];
  if (user.email) return user.email[0];
  return "?";
}

export default function NavAuthStatus() {
  const [user, setUser] = useState<User | null>(null);
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, setUser);
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
        className={styles.avatar}
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
          <NextLink
            href="/my-listings"
            className={styles.dropdownLink}
            onClick={() => setOpen(false)}
          >
            我的刊登
          </NextLink>
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
