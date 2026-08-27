"use client";

import { useEffect } from "react";

import { useAuth } from "@/hooks/auth/useAuth";
import { useCartStore } from "@/stores/cartStore";

export function useCart() {
  const { user, isHydrated } = useAuth();
  const store = useCartStore();
  const loadCart = useCartStore((state) => state.loadCart);
  const reset = useCartStore((state) => state.reset);

  useEffect(() => {
    if (!isHydrated) return;
    if (!user) {
      reset();
      return;
    }
    void loadCart(user.id);
  }, [isHydrated, loadCart, reset, user]);

  return { ...store, user, isHydrated };
}
