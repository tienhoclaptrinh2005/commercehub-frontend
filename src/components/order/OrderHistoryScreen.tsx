"use client";

import {
  AlertCircle,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  PackageCheck,
  ReceiptText,
  RefreshCw,
  Search,
  ShoppingBag,
  SlidersHorizontal,
  Store,
  WalletCards,
} from "lucide-react";
import Link from "next/link";
import { type FormEvent, useState } from "react";

import { useOrders } from "@/hooks/api/useOrders";
import { formatCurrency } from "@/lib/format";
import type { OrderHistoryCursor } from "@/services/order.service";

import { OrderStatusBadge } from "./OrderStatusBadge";

const ORDER_STATUS_FILTERS = [
  { value: "", label: "Tất cả trạng thái" },
  { value: "DISPUTED", label: "Đang khiếu nại" },
  { value: "WAITING_APPROVAL", label: "Chờ shop xác nhận" },
  { value: "PROCESSING", label: "Đang xử lý" },
  { value: "DELIVERED", label: "Đã giao hàng" },
  { value: "REFUNDED", label: "Đã hoàn tiền" },
  { value: "REJECTED", label: "Shop từ chối" },
  { value: "CANCELLED", label: "Đã hủy" },
  { value: "CANCELLED_BY_SELLER", label: "Shop đã hủy" },
  { value: "CANCELLED_BY_SYSTEM", label: "Hệ thống đã hủy" },
] as const;

interface AppliedFilters {
  orderCode: string;
  status: string;
  fromDate: string;
  toDate: string;
}

const EMPTY_FILTERS: AppliedFilters = {
  orderCode: "",
  status: "",
  fromDate: "",
  toDate: "",
};

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
  const [cursorStack, setCursorStack] = useState<
    Array<OrderHistoryCursor | null>
  >([null]);
  const [searchInput, setSearchInput] = useState("");
  const [statusInput, setStatusInput] = useState("");
  const [fromDateInput, setFromDateInput] = useState("");
  const [toDateInput, setToDateInput] = useState("");
  const [filterError, setFilterError] = useState<string | null>(null);
  const [filters, setFilters] = useState<AppliedFilters>(EMPTY_FILTERS);
  const cursor = cursorStack.at(-1) ?? null;
  const currentPage = cursorStack.length - 1;
  const { result, error, isLoading, refresh } = useOrders(cursor, 10, filters);
  const hasFilters = Object.values(filters).some(Boolean);

  function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (fromDateInput && toDateInput && fromDateInput > toDateInput) {
      setFilterError("Ngày bắt đầu không được sau ngày kết thúc.");
      return;
    }
    setFilterError(null);
    setCursorStack([null]);
    setFilters({
      orderCode: searchInput.trim(),
      status: statusInput,
      fromDate: fromDateInput,
      toDate: toDateInput,
    });
  }

  function clearFilters() {
    setSearchInput("");
    setStatusInput("");
    setFromDateInput("");
    setToDateInput("");
    setFilterError(null);
    setFilters(EMPTY_FILTERS);
    setCursorStack([null]);
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
          className="border-b border-slate-100 bg-slate-50/70 p-4 sm:p-5"
        >
          <div className="grid gap-3 lg:grid-cols-[minmax(220px,1.4fr)_minmax(180px,0.9fr)_minmax(150px,0.7fr)_minmax(150px,0.7fr)_auto]">
            <label className="block">
              <span className="mb-1.5 block text-xs font-bold text-slate-600">Mã đơn hàng</span>
              <span className="relative block">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-slate-400" />
                <input
                  type="search"
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  maxLength={50}
                  placeholder="Ví dụ ORD-S1-..."
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                />
              </span>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-bold text-slate-600">Trạng thái đơn</span>
              <select
                value={statusInput}
                onChange={(event) => setStatusInput(event.target.value)}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
              >
                {ORDER_STATUS_FILTERS.map((option) => (
                  <option key={option.value || "all"} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-bold text-slate-600">Từ ngày</span>
              <input
                type="date"
                value={fromDateInput}
                onChange={(event) => setFromDateInput(event.target.value)}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-bold text-slate-600">Đến ngày</span>
              <input
                type="date"
                value={toDateInput}
                onChange={(event) => setToDateInput(event.target.value)}
                className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
              />
            </label>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-auto inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:opacity-60"
            >
              <SlidersHorizontal className="size-4" />
              Áp dụng
            </button>
          </div>

          <div className="mt-3 flex min-h-6 items-center justify-between gap-3">
            {filterError ? <p className="text-sm font-semibold text-rose-600" role="alert">{filterError}</p> : <span />}
            {hasFilters ? (
              <button
                type="button"
                onClick={clearFilters}
                className="text-sm font-bold text-slate-500 transition hover:text-emerald-700"
              >
                Xóa toàn bộ bộ lọc
              </button>
            ) : null}
          </div>
        </form>

        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
              <ReceiptText className="size-5" />
            </span>
            <div>
              <h2 className="font-black text-slate-900">Đơn hàng đã mua</h2>
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
                {hasFilters ? "Không tìm thấy đơn hàng phù hợp" : "Bạn chưa có đơn hàng nào"}
              </h2>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                {hasFilters
                  ? "Hãy thay đổi khoảng ngày, trạng thái, mã đơn hoặc xóa bộ lọc để xem toàn bộ lịch sử."
                  : "Khi thanh toán sản phẩm thành công, đơn hàng sẽ xuất hiện tại đây."}
              </p>
              {!hasFilters ? (
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
                        <OrderStatusBadge status={order.effectiveStatus || order.status} />
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
                        <Link
                          href={`/users/${encodeURIComponent(order.sellerUsername)}`}
                          className="block truncate text-sm font-bold text-slate-800 transition hover:text-emerald-700 hover:underline"
                        >
                          {order.shopName}
                        </Link>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-white text-sky-700 shadow-sm">
                        {isInstant ? <PackageCheck className="size-[18px]" /> : <Clock3 className="size-[18px]" />}
                      </span>
                      <div>
                        <p className="text-xs font-semibold text-slate-400">Loại giao hàng</p>
                        <p className="text-sm font-bold text-slate-800">
                          {isInstant ? "Giao ngay" : "Đặt hàng"}
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
                      href={`/orders/${encodeURIComponent(order.orderCode)}`}
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

      {!result.empty && (currentPage > 0 || !result.last) ? (
        <nav
          className="mt-6 flex items-center justify-center gap-3"
          aria-label="Phân trang lịch sử đơn hàng"
        >
          <button
            type="button"
            disabled={currentPage === 0 || isLoading}
            onClick={() => {
              setCursorStack((current) =>
                current.length > 1 ? current.slice(0, -1) : current,
              );
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:border-emerald-300 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft className="size-4" />
            Trang trước
          </button>
          <span className="text-sm font-bold text-slate-500">
            Trang {currentPage + 1}
          </span>
          <button
            type="button"
            disabled={result.last || isLoading}
            onClick={() => {
              const lastOrder = result.content.at(-1);
              if (!lastOrder) return;
              setCursorStack((current) => [
                ...current,
                {
                  beforePlacedAt: lastOrder.placedAt,
                  beforeId: lastOrder.id,
                },
              ]);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:border-emerald-300 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Trang sau
            <ChevronRight className="size-4" />
          </button>
        </nav>
      ) : null}
    </div>
  );
}
