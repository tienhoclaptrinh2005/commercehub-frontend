import type { Metadata } from "next";
import {
  ArrowRight,
  CircleHelp,
  House,
  Radar,
  Search,
  ShieldCheck,
  SignalZero,
  ShoppingBag,
  Store,
  UsersRound,
} from "lucide-react";
import Link from "next/link";

import { Footer } from "@/components/layout/buyer/Footer";
import { Header } from "@/components/layout/buyer/Header";

export const metadata: Metadata = {
  title: "404 - Không tìm thấy trang",
  description: "Trang bạn đang tìm kiếm không tồn tại trên CommerceHub.",
};

const quickLinks = [
  {
    label: "Sản phẩm số",
    description: "Tài khoản và tài nguyên số",
    href: "/products",
    icon: ShoppingBag,
  },
  {
    label: "Dịch vụ đặt hàng",
    description: "Dịch vụ được xử lý bởi shop",
    href: "/categories/dich-vu",
    icon: Store,
  },
  {
    label: "Danh sách người bán",
    description: "Gian hàng đã được duyệt",
    href: "/shops",
    icon: UsersRound,
  },
  {
    label: "Chính sách bảo hành",
    description: "Giữ tiền T+7 và hoàn tiền",
    href: "/warranty-policy",
    icon: ShieldCheck,
  },
] as const;

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-[#f7f9ff]">
      <Header />

      <main className="relative flex-1 overflow-hidden px-4 py-12 sm:px-6 sm:py-16">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-45 [background-image:radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px]"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-16 size-80 -translate-x-1/2 rounded-full bg-emerald-200/45 blur-3xl"
        />

        <div className="relative mx-auto flex w-full max-w-[960px] flex-col items-center text-center">
          <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap items-center justify-center gap-2 rounded-full border border-slate-200 bg-white/90 px-4 py-2 text-xs font-semibold text-slate-500 shadow-sm backdrop-blur"
          >
            <Link href="/" className="flex items-center gap-1.5 transition hover:text-emerald-700">
              <House className="size-3.5" />
              CommerceHub
            </Link>
            <span aria-hidden="true">/</span>
            <span>Mã trạng thái HTTP</span>
            <span aria-hidden="true">/</span>
            <span className="flex items-center gap-1.5 text-rose-600">
              <SignalZero className="size-3.5" />
              404 Not Found
            </span>
          </nav>

          <div className="mt-9 flex select-none items-center justify-center" aria-hidden="true">
            <span className="text-[88px] font-black leading-none tracking-[-0.09em] text-emerald-700 sm:text-[132px]">
              4
            </span>
            <div className="relative mx-3 grid size-24 place-items-center rounded-[26px] border border-emerald-200 bg-white p-2 shadow-[0_22px_60px_-28px_rgba(5,150,105,0.65)] sm:mx-6 sm:size-32">
              <div className="grid size-full place-items-center rounded-[20px] border border-emerald-100 bg-emerald-50">
                <Radar className="size-11 text-emerald-700 sm:size-14" strokeWidth={1.8} />
              </div>
              <span className="absolute -right-3 -top-3 flex items-center gap-1 rounded-full bg-rose-600 px-2.5 py-1 text-[10px] font-black tracking-wide text-white shadow-lg">
                <SignalZero className="size-3" />
                LOST
              </span>
            </div>
            <span className="text-[88px] font-black leading-none tracking-[-0.09em] text-emerald-700 sm:text-[132px]">
              4
            </span>
          </div>

          <h1 className="mt-8 max-w-2xl text-3xl font-black tracking-[-0.04em] text-slate-950 sm:text-4xl">
            Rất tiếc, trang bạn đang tìm kiếm không tồn tại!
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
            Đường dẫn có thể đã bị thay đổi, xóa hoặc tạm thời không khả dụng.
            Hãy kiểm tra lại liên kết hoặc tìm sản phẩm bạn cần trên CommerceHub.
          </p>

          <form
            action="/products"
            className="mt-7 flex w-full max-w-xl flex-col gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-lg shadow-slate-200/60 sm:flex-row"
            role="search"
          >
            <label htmlFor="not-found-search" className="sr-only">
              Tìm kiếm sản phẩm
            </label>
            <div className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-slate-400" />
              <input
                id="not-found-search"
                name="keyword"
                type="search"
                maxLength={100}
                placeholder="Tìm sản phẩm hoặc dịch vụ..."
                className="h-11 w-full rounded-xl bg-transparent pl-11 pr-4 text-sm text-slate-900 outline-none placeholder:text-slate-400"
              />
            </div>
            <button
              type="submit"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-6 text-sm font-bold text-white transition hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-600/20"
            >
              Tìm kiếm
              <ArrowRight className="size-4" />
            </button>
          </form>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/"
              className="inline-flex h-11 items-center gap-2 rounded-xl bg-emerald-700 px-5 text-sm font-bold text-white transition hover:bg-emerald-800"
            >
              <House className="size-[18px]" />
              Về trang chủ
            </Link>
            <Link
              href="/products"
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-emerald-700 bg-white px-5 text-sm font-bold text-emerald-800 transition hover:bg-emerald-50"
            >
              <ShoppingBag className="size-[18px]" />
              Khám phá sản phẩm
            </Link>
            <Link
              href="/contact"
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-slate-100 px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
            >
              <CircleHelp className="size-[18px]" />
              Báo lỗi liên kết
            </Link>
          </div>

          <section className="mt-12 w-full rounded-3xl border border-slate-200 bg-white/95 p-5 text-left shadow-lg shadow-slate-200/50 backdrop-blur sm:p-7">
            <div className="border-b border-slate-200 pb-4">
              <h2 className="text-xl font-black tracking-[-0.025em] text-slate-950">
                Khám phá nhanh
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Những khu vực chính vẫn luôn sẵn sàng phục vụ bạn.
              </p>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {quickLinks.map(({ label, description, href, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  className="group rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-emerald-50 hover:shadow-md"
                >
                  <span className="grid size-10 place-items-center rounded-xl bg-white text-emerald-700 shadow-sm transition group-hover:bg-emerald-700 group-hover:text-white">
                    <Icon className="size-5" />
                  </span>
                  <span className="mt-3 block text-sm font-bold text-slate-900">{label}</span>
                  <span className="mt-1 block text-xs leading-5 text-slate-500">{description}</span>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
