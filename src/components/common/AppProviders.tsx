"use client";

import { useEffect, type ReactNode } from "react";

import { AUTH_SESSION_CHANGED_EVENT } from "@/lib/auth";
import { useAuthStore } from "@/stores/authStore";
import type { AuthSession } from "@/types";

export function AppProviders({ children }: { children: ReactNode }) {
  const hydrate = useAuthStore((state) => state.hydrate);
  const syncSession = useAuthStore((state) => state.syncSession);

  useEffect(() => {
    hydrate();

    const handleSessionChange = (event: Event) => {
      syncSession((event as CustomEvent<AuthSession | null>).detail);
    };

    window.addEventListener(AUTH_SESSION_CHANGED_EVENT, handleSessionChange);
    return () => {
      window.removeEventListener(AUTH_SESSION_CHANGED_EVENT, handleSessionChange);
    };
  }, [hydrate, syncSession]);

  return children;
}
