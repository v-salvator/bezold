"use client";
import { useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/firebase/client";

type AdminAuthState = {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  idToken: string | null;
};

export default function useAdminAuth(): AdminAuthState {
  const [state, setState] = useState<AdminAuthState>({
    user: null,
    isAdmin: false,
    loading: true,
    idToken: null,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setState({ user: null, isAdmin: false, loading: false, idToken: null });
        return;
      }
      const token = await user.getIdTokenResult();
      setState({
        user,
        isAdmin: token.claims.admin === true,
        loading: false,
        idToken: await user.getIdToken(),
      });
    });
    return unsubscribe;
  }, []);

  return state;
}
