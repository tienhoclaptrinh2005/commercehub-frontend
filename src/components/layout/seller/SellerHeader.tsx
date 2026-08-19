"use client";

import { Bell, Menu, Store, X } from "lucide-react";

import { AuthStatus } from "@/components/auth/AuthStatus";
import { BrandLogo } from "@/components/auth/BrandLogo";

import { SellerNavigation } from "./SellerSidebar";

export function SellerHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <details className="group relative lg:hidden">
            <summary
              className="grid size-10 cursor-pointer list-none place-items-center rounded-xl border border-slate-200 text-slate-600 transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700 [&::-webkit-details-marker]:hidden"
              aria-label="Mở hoặc đóng menu người bán"
            >
              <Menu className="size-5 group-open:hidden" />
              <X className="hidden size-5 group-open:block" />
            </summary>
            <div className="absolute left-0 top-12 w-[min(310px,calc(100vw-2rem))] rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl shadow-slate-950/15">
              <div className="mb-3 rounded-xl bg-violet-50 px-3 py-2 text-xs font-bold uppercase tracking-[0.12em] text-violet-700">
                Kênh người bán
              </div>
              <SellerNavigation compact />
            </div>
          </details>

          <div className="[&>a>span:last-child]:hidden sm:[&>a>span:last-child]:inline lg:hidden">
            <BrandLogo />
          </div>

          <div className="hidden lg:block">
            <p className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <Store className="size-4 text-violet-600" />
              Kênh người bán
            </p>
            <p className="mt-0.5 text-xs text-slate-500">Quản lý hoạt động kinh doanh của bạn</p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            className="relative grid size-10 place-items-center rounded-xl border border-slate-200 text-slate-600 transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700"
            aria-label="Thông báo người bán"
            title="Thông báo đang dùng dữ liệu minh họa"
          >
            <Bell className="size-[18px]" />
            <span className="absolute right-2 top-2 size-2 rounded-full bg-rose-500 ring-2 ring-white" />
          </button>
          <AuthStatus />
        </div>
      </div>
    </header>
  );
}
