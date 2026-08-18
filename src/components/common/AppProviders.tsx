"use client";

import { useEffect, type ReactNode } from "react";

import { AUTH_SESSION_CHANGED_EVENT } from "@/lib/auth";
import { useAuthStore } from "@/stores/authStore";
import type { AuthSession } from "@/types";

export function AppProviders({ children }: { children: ReactNode }) {
  const hydrate = useAuthStore((state) => state.hydrate);
  const syncSession = useAuthStore((state) => state.syncSession);
  const syncCurrentUser = useAuthStore((state) => state.syncCurrentUser);

  useEffect(() => {
    const initializeAuth = async () => {
      await hydrate();
      await syncCurrentUser();
    };

    void initializeAuth();

    const handleSessionChange = (event: Event) => {
      syncSession((event as CustomEvent<AuthSession | null>).detail);
    };

    window.addEventListener(AUTH_SESSION_CHANGED_EVENT, handleSessionChange);
    const handleFocus = () => void syncCurrentUser();
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") void syncCurrentUser();
    };
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      window.removeEventListener(AUTH_SESSION_CHANGED_EVENT, handleSessionChange);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [hydrate, syncCurrentUser, syncSession]);

  return children;
}
