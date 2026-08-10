import {
  CircleHelp,
  Clock3,
  MessageSquareText,
  Search,
  ShieldCheck,
  ShoppingCart,
  Store,
  WalletCards,
} from "lucide-react";
import Link from "next/link";

import { AuthStatus } from "@/components/auth/AuthStatus";
import { BrandLogo } from "@/components/auth/BrandLogo";

import { CategoryBar } from "./CategoryBar";
import { MobileNav } from "./MobileNav";

export function Header() {
  return (
    <header className="relative z-40 bg-white">
      <div className="hidden border-b border-slate-200 lg:block">
        <div className="mx-auto flex h-10 max-w-[1200px] items-center justify-between px-6 text-xs text-slate-600">
          <div className="flex items-center gap-5">
            <span className="font-semibold text-slate-800">CommerceHub Digital</span>
            <span className="flex items-center gap-1.5">
              <Clock3 className="size-3.5" />
              08h00 - 22h00 mỗi ngày
            </span>
            <Link href="/contact" className="transition hover:text-emerald-700">
              Liên hệ
            </Link>
            <span className="rounded bg-emerald-100 px-2 py-0.5 font-semibold text-emerald-700">2FA</span>
            <span className="rounded bg-emerald-100 px-2 py-0.5 font-semibold text-emerald-700">Giao dịch an toàn</span>
          </div>
          <div className="flex items-center gap-5">
            <Link href="/help" className="flex items-center gap-1.5 transition hover:text-emerald-700">
              <CircleHelp className="size-3.5" />
              Hỗ trợ
            </Link>
            <Link href="/wallet/deposit" className="flex items-center gap-1.5 transition hover:text-emerald-700">
              <WalletCards className="size-3.5" />
              Nạp tiền
            </Link>
            <span className="font-semibold text-slate-900">0đ</span>
            <Link href="/chat" className="transition hover:text-emerald-700" aria-label="Tin nhắn">
              <MessageSquareText className="size-4" />
            </Link>
          </div>
        </div>
      </div>

      <div className="border-b border-slate-100">
        <div className="mx-auto max-w-[1200px] px-4 py-4 sm:px-6">
          <div className="flex items-center justify-between gap-4 lg:grid lg:grid-cols-[210px_minmax(300px,1fr)_auto]">
            <BrandLogo />

            <form action="/search" className="relative hidden md:block" role="search">
              <label htmlFor="site-search" className="sr-only">
                Tìm kiếm sản phẩm
              </label>
              <input
                id="site-search"
                name="q"
                type="search"
                placeholder="Tìm kiếm sản phẩm, dịch vụ, phần mềm..."
                className="h-12 w-full rounded-lg border border-slate-300 bg-white pl-4 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10"
              />
              <button
                type="submit"
                className="absolute right-1 top-1 grid size-10 place-items-center rounded-md text-slate-700 transition hover:bg-emerald-50 hover:text-emerald-700"
                aria-label="Tìm kiếm"
              >
                <Search className="size-5" />
              </button>
            </form>

            <div className="hidden items-center justify-end gap-4 lg:flex">
              <Link
                href="/cart"
                className="group flex flex-col items-center gap-1 text-xs font-medium text-slate-700 transition hover:text-emerald-700"
              >
                <span className="relative">
                  <ShoppingCart className="size-6" />
                  <span className="absolute -right-2 -top-2 grid size-4 place-items-center rounded-full bg-emerald-600 text-[10px] font-bold text-white">
                    0
                  </span>
                </span>
                Giỏ hàng
              </Link>
              <Link
                href="/seller/shop/setup"
                className="inline-flex h-11 items-center gap-2 rounded-lg bg-emerald-500 px-4 text-sm font-bold text-emerald-950 transition hover:bg-emerald-400"
              >
                <Store className="size-4" />
                Mở shop
              </Link>
              <AuthStatus />
            </div>

            <div className="flex items-center gap-2 lg:hidden">
              <Link
                href="/cart"
                className="grid size-11 place-items-center rounded-lg border border-slate-200 text-slate-700"
                aria-label="Giỏ hàng"
              >
                <ShoppingCart className="size-5" />
              </Link>
              <MobileNav />
            </div>
          </div>

          <form action="/search" className="relative mt-4 md:hidden" role="search">
            <label htmlFor="mobile-site-search" className="sr-only">
              Tìm kiếm sản phẩm
            </label>
            <input
              id="mobile-site-search"
              name="q"
              type="search"
              placeholder="Tìm kiếm sản phẩm, dịch vụ..."
              className="h-11 w-full rounded-lg border border-slate-300 bg-white pl-4 pr-11 text-sm outline-none focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10"
            />
            <button
              type="submit"
              className="absolute right-1 top-0.5 grid size-10 place-items-center text-slate-700"
              aria-label="Tìm kiếm"
            >
              <Search className="size-5" />
            </button>
          </form>
        </div>
      </div>

      <CategoryBar />

      <div className="border-b border-emerald-900/10 bg-emerald-50 lg:hidden">
        <div className="mx-auto flex max-w-[1200px] items-center justify-center gap-2 px-4 py-2 text-xs font-medium text-emerald-800">
          <ShieldCheck className="size-4" />
          Mua bán sản phẩm số an toàn và minh bạch
        </div>
      </div>
    </header>
  );
}

