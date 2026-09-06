"use client";
import { useEffect, useState } from "react";
import { onIdTokenChanged, User } from "firebase/auth";
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
    // onIdTokenChanged (not onAuthStateChanged) so state re-syncs whenever the
    // SDK refreshes the ID token — keeps idToken from going stale on long-open
    // admin sessions, which would otherwise 401 authenticated API calls.
    const unsubscribe = onIdTokenChanged(auth, async (user) => {
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
