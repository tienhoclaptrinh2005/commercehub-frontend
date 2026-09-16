"use client";

import { LogOut, Menu, MessageSquareText, ShoppingCart, UserRound, X } from "lucide-react";
import Link from "next/link";

import { useAuth } from "@/hooks/auth/useAuth";
import { ChatUnreadBadge } from "@/components/chat/ChatUnreadBadge";

import { buyerNavigation } from "./navigation";

export function MobileNav() {
  const { user, isHydrated, isSubmitting, logout } = useAuth();

  return (
    <details className="group lg:hidden">
      <summary
        className="grid size-11 cursor-pointer list-none place-items-center rounded-lg border border-slate-200 bg-white text-slate-700 transition hover:border-emerald-300 hover:text-emerald-700 [&::-webkit-details-marker]:hidden"
        aria-label="Mở hoặc đóng menu"
      >
        <Menu className="size-5 group-open:hidden" />
        <X className="hidden size-5 group-open:block" />
      </summary>

      <div className="absolute inset-x-0 top-full z-50 border-t border-slate-100 bg-white px-4 py-5 shadow-xl shadow-slate-950/10">
        <nav className="mx-auto grid max-w-[1200px] gap-1" aria-label="Menu di động">
          {buyerNavigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-emerald-50 hover:text-emerald-700"
            >
              {item.label}
            </Link>
          ))}

          <div className="my-3 border-t border-slate-100" />

          <Link
            href="/cart"
            className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700"
          >
            <ShoppingCart className="size-5" />
            Giỏ hàng
          </Link>
          {isHydrated && user ? (
            <Link
              href="/chat"
              className="relative flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700"
            >
              <span className="relative"><MessageSquareText className="size-5" /><ChatUnreadBadge /></span>
              Tin nhắn
            </Link>
          ) : null}
          {isHydrated && user ? (
            <div className="mt-2 flex items-center gap-3 rounded-lg bg-slate-50 p-3">
              <Link href="/profile" className="flex min-w-0 flex-1 items-center gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-700">
                  <UserRound className="size-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-slate-900">{user.fullName}</span>
                  <span className="block truncate text-xs text-slate-500">{user.email}</span>
                </span>
              </Link>
              <button
                type="button"
                onClick={() => void logout()}
                disabled={isSubmitting}
                className="grid size-10 place-items-center rounded-lg text-slate-500 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50"
                aria-label="Đăng xuất"
              >
                <LogOut className="size-[18px]" />
              </button>
            </div>
          ) : (
            <div className="mt-2 grid grid-cols-2 gap-2">
              <Link
                href="/login"
                className="rounded-lg border border-slate-200 px-4 py-2.5 text-center text-sm font-semibold text-slate-700"
              >
                Đăng nhập
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-emerald-600 px-4 py-2.5 text-center text-sm font-semibold text-white"
              >
                Đăng ký
              </Link>
            </div>
          )}
        </nav>
      </div>
    </details>
  );
}
