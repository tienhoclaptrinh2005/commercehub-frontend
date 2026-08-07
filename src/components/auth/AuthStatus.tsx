"use client";

import { LogOut, UserRound } from "lucide-react";
import Link from "next/link";

import { useAuth } from "@/hooks/auth/useAuth";

export function AuthStatus() {
  const { user, isHydrated, isSubmitting, logout } = useAuth();

  if (!isHydrated) {
    return <div className="h-10 w-40 animate-pulse rounded-xl bg-slate-100" />;
  }

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href="/login"
          className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
        >
          Đăng nhập
        </Link>
        <Link
          href="/register"
          className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-700"
        >
          Đăng ký
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div className="hidden text-right sm:block">
        <p className="text-sm font-semibold text-slate-900">{user.fullName}</p>
        <p className="text-xs text-slate-500">{user.email}</p>
      </div>
      <span className="grid size-10 place-items-center rounded-full bg-emerald-100 text-emerald-700">
        <UserRound className="size-5" />
      </span>
      <button
        type="button"
        onClick={() => void logout()}
        disabled={isSubmitting}
        className="grid size-10 place-items-center rounded-xl text-slate-500 transition hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50"
        aria-label="Đăng xuất"
      >
        <LogOut className="size-[18px]" />
      </button>
    </div>
  );
}
