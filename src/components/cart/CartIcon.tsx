"use client";

import { ShoppingCart } from "lucide-react";
import Link from "next/link";

import { useCart } from "@/hooks/api/useCart";

export function CartIcon({ mobile = false }: { mobile?: boolean }) {
  const { cart, user, isHydrated, isLoading } = useCart();
  const count = isHydrated && user ? cart.totalQuantity : 0;
  const badge = count > 99 ? "99+" : String(count);

  if (mobile) {
    return (
      <Link
        href="/cart"
        className="relative grid size-11 place-items-center rounded-lg border border-slate-200 text-slate-700 transition hover:border-emerald-300 hover:text-emerald-700"
        aria-label={`Giỏ hàng, ${count} sản phẩm`}
      >
        <ShoppingCart className="size-5" />
        {count > 0 ? (
          <span className="absolute -right-1 -top-1 grid min-w-4 place-items-center rounded-full bg-emerald-600 px-1 text-[9px] font-bold leading-4 text-white">
            {badge}
          </span>
        ) : null}
      </Link>
    );
  }

  return (
    <Link
      href="/cart"
      className="group flex flex-col items-center gap-1 text-xs font-medium text-slate-700 transition hover:text-emerald-700"
      aria-label={`Giỏ hàng, ${count} sản phẩm`}
    >
      <span className="relative">
        <ShoppingCart className="size-6" />
        <span className="absolute -right-2 -top-2 grid min-w-4 place-items-center rounded-full bg-emerald-600 px-1 text-[9px] font-bold leading-4 text-white">
          {isLoading && user ? "…" : badge}
        </span>
      </span>
      Giỏ hàng
    </Link>
  );
}
