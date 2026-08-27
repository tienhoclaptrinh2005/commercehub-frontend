"use client";

import {
  AlertCircle,
  CalendarDays,
  Clock3,
  PackageCheck,
  ReceiptText,
  RefreshCw,
  Search,
  ShoppingBag,
  Store,
  WalletCards,
} from "lucide-react";
import Link from "next/link";
import { type FormEvent, useState } from "react";

import { Pagination } from "@/components/common/Pagination";
import { useOrders } from "@/hooks/api/useOrders";
import { formatCurrency } from "@/lib/format";

import { OrderStatusBadge } from "./OrderStatusBadge";

const PAYMENT_STATUS: Record<string, { label: string; className: string }> = {
  PAID: { label: "Đã thanh toán", className: "text-emerald-700" },
  REFUNDED: { label: "Đã hoàn tiền", className: "text-cyan-700" },
  PARTIAL_REFUND: { label: "Hoàn tiền một phần", className: "text-amber-700" },
  UNPAID: { label: "Chưa thanh toán", className: "text-rose-700" },
};

function formatOrderTime(value: string): string {
  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

export function OrderHistoryScreen() {
  const [page, setPage] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [orderCode, setOrderCode] = useState("");
  const { result, error, isLoading, refresh } = useOrders(page, 10, orderCode);

  function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPage(0);
    setOrderCode(searchInput.trim());
  }

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-8 sm:px-6 sm:py-10">
      <nav className="flex items-center gap-2 text-sm text-slate-500" aria-label="Đường dẫn">
        <Link href="/" className="font-semibold text-emerald-700 hover:text-emerald-800">
          Trang chủ
        </Link>
        <span>/</span>
        <span>Lịch sử đơn hàng</span>
      </nav>

      <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.14em] text-emerald-700">
            Giao dịch đã mua
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
            Lịch sử đơn hàng
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Theo dõi đơn giao ngay và đơn đặt hàng từ dữ liệu giao dịch thực tế.
          </p>
        </div>

        <button
          type="button"
          onClick={refresh}
          disabled={isLoading}
          className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 shadow-sm transition hover:border-emerald-300 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw className={`size-4 ${isLoading ? "animate-spin" : ""}`} />
          Tải lại
        </button>
      </div>

      <section className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <form
          onSubmit={search}
          className="grid gap-3 border-b border-slate-100 bg-slate-50/70 p-4 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:p-5"
        >
          <label className="relative block">
            <span className="sr-only">Tìm theo mã đơn hàng</span>
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              maxLength={50}
              placeholder="Nhập mã đơn hàng, ví dụ ORD-S1-..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
            />
          </label>
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:opacity-60"
          >
            <Search className="size-4" />
            Tìm kiếm
          </button>
          {orderCode ? (
            <button
              type="button"
              onClick={() => {
                setSearchInput("");
                setOrderCode("");
                setPage(0);
              }}
              className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600 transition hover:text-emerald-700"
            >
              Xóa tìm kiếm
            </button>
          ) : null}
        </form>

        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
              <ReceiptText className="size-5" />
            </span>
            <div>
              <h2 className="font-black text-slate-900">Đơn hàng đã mua</h2>
              <p className="text-xs text-slate-500">{result.totalElements} đơn hàng</p>
            </div>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
            Mới nhất trước
          </span>
        </div>

        {error ? (
          <div className="m-5 flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-700" role="alert">
            <AlertCircle className="mt-0.5 size-5 shrink-0" />
            <span>{error}</span>
          </div>
        ) : null}

        {isLoading ? (
          <div className="space-y-4 p-5 sm:p-6">
            {Array.from({ length: 4 }, (_, index) => (
              <div key={index} className="h-32 animate-pulse rounded-2xl bg-slate-100" />
            ))}
          </div>
        ) : result.content.length === 0 && !error ? (
          <div className="grid min-h-[340px] place-items-center px-6 py-12 text-center">
            <div>
              <span className="mx-auto grid size-16 place-items-center rounded-full bg-emerald-50 text-emerald-600">
                <ShoppingBag className="size-8" />
              </span>
              <h2 className="mt-5 text-xl font-black text-slate-900">
                {orderCode ? "Không tìm thấy mã đơn phù hợp" : "Bạn chưa có đơn hàng nào"}
              </h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                {orderCode
                  ? "Hãy kiểm tra lại mã đơn hoặc xóa tìm kiếm để xem toàn bộ lịch sử."
                  : "Khi thanh toán sản phẩm thành công, đơn hàng sẽ xuất hiện tại đây."}
              </p>
              {!orderCode ? (
                <Link
                  href="/products"
                  className="mt-6 inline-flex h-11 items-center rounded-xl bg-emerald-600 px-5 text-sm font-bold text-white transition hover:bg-emerald-700"
                >
                  Khám phá sản phẩm
                </Link>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {result.content.map((order) => {
              const payment = PAYMENT_STATUS[order.paymentStatus] ?? {
                label: order.paymentStatus.replaceAll("_", " "),
                className: "text-slate-600",
              };
              const isInstant = order.deliveryType === "INSTANT";

              return (
                <article key={order.id} className="px-5 py-5 transition hover:bg-slate-50/70 sm:px-6">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <h3 className="text-base font-black text-slate-950">
                          {order.orderCode || `Đơn hàng #${order.id}`}
                        </h3>
                        <OrderStatusBadge status={order.status} />
                      </div>
                      <p className="mt-2 flex items-center gap-2 text-sm text-slate-500">
                        <CalendarDays className="size-4 shrink-0 text-slate-400" />
                        {formatOrderTime(order.placedAt)}
                      </p>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Tổng thanh toán</p>
                      <p className="mt-1 text-xl font-black text-emerald-700">
                        {formatCurrency(order.totalAmount)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 rounded-xl border border-slate-100 bg-slate-50/80 p-4 sm:grid-cols-3">
                    <div className="flex items-center gap-3">
                      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-white text-emerald-700 shadow-sm">
                        <Store className="size-[18px]" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-400">Người bán</p>
                        <p className="truncate text-sm font-bold text-slate-800">{order.shopName}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-white text-sky-700 shadow-sm">
                        {isInstant ? <PackageCheck className="size-[18px]" /> : <Clock3 className="size-[18px]" />}
                      </span>
                      <div>
                        <p className="text-xs font-semibold text-slate-400">Loại giao hàng</p>
                        <p className="text-sm font-bold text-slate-800">
                          {isInstant ? "Giao ngay" : "Đơn đặt hàng"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-white text-violet-700 shadow-sm">
                        <WalletCards className="size-[18px]" />
                      </span>
                      <div>
                        <p className="text-xs font-semibold text-slate-400">Thanh toán</p>
                        <p className={`text-sm font-bold ${payment.className}`}>{payment.label}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-end">
                    <Link
                      href={`/orders/${order.id}`}
                      className="inline-flex h-10 items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 px-4 text-sm font-black text-emerald-700 transition hover:border-emerald-300 hover:bg-emerald-100"
                    >
                      Xem chi tiết
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <Pagination
        ariaLabel="Phân trang lịch sử đơn hàng"
        currentPage={result.number}
        totalPages={result.totalPages}
        onPageChange={(nextPage) => {
          setPage(nextPage);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      />
    </div>
  );
}
