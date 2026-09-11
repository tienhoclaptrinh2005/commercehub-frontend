"use client";

import {
  AlertCircle,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Eye,
  LoaderCircle,
  PackageCheck,
  RefreshCw,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import Link from "next/link";
import { type FormEvent, useMemo, useState } from "react";

import { OrderStatusBadge } from "@/components/order/OrderStatusBadge";
import { useAppModal } from "@/components/ui/app-modal";
import { useSellerOrders } from "@/hooks/api/useSellerOrders";
import { formatCurrency } from "@/lib/format";
import { getApiErrorMessage } from "@/services/api";
import {
  sellerOrderService,
  type SellerOrderCursor,
  type SellerOrderDeliveryType,
  type SellerOrderFilters,
} from "@/services/seller-order.service";
import type { OrderSummary } from "@/types";

const PAGE_SIZE = 10;

const STATUS_OPTIONS = [
  { value: "", label: "Tất cả trạng thái" },
  { value: "WAITING_APPROVAL", label: "Chờ shop nhận đơn" },
  { value: "PROCESSING", label: "Đang thực hiện" },
  { value: "DELIVERED", label: "Đã giao hàng" },
  { value: "DISPUTED", label: "Đang khiếu nại" },
  { value: "REJECTED", label: "Shop đã từ chối" },
  { value: "CANCELLED", label: "Buyer đã hủy" },
  { value: "CANCELLED_BY_SELLER", label: "Shop đã hủy" },
  { value: "CANCELLED_BY_SYSTEM", label: "Hệ thống đã hủy" },
] as const;

interface SellerOrdersScreenProps {
  deliveryType?: SellerOrderDeliveryType;
}

interface FilterInputs {
  search: string;
  status: string;
  fromDate: string;
  toDate: string;
}

const EMPTY_INPUTS: FilterInputs = {
  search: "",
  status: "",
  fromDate: "",
  toDate: "",
};

const PAGE_COPY: Record<"ALL" | SellerOrderDeliveryType, {
  eyebrow?: string;
  title: string;
  description: string;
}> = {
  ALL: {
    title: "Tất cả đơn hàng",
    description: "Tra cứu toàn bộ đơn giao ngay và đơn đặt hàng của gian hàng.",
  },
  INSTANT: {
    eyebrow: "Đơn giao tự động",
    title: "Đơn giao ngay",
    description: "Theo dõi các đơn đã được hệ thống xuất kho và giao tự động.",
  },
  PRE_ORDER: {
    eyebrow: "Yêu cầu cần xử lý",
    title: "Đơn đặt hàng",
    description: "Nhận đơn, giao kết quả hoặc hủy và hoàn tiền đúng trạng thái.",
  },
};

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

function deliveryTypeLabel(value: string): string {
  return value === "PRE_ORDER" ? "Đặt hàng" : "Giao ngay";
}

function ReasonField({ onChange }: { onChange: (value: string) => void }) {
  const [value, setValue] = useState("");
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-bold text-slate-600">
        Lý do <span className="font-normal text-slate-400">(không bắt buộc)</span>
      </span>
      <textarea
        value={value}
        onChange={(event) => {
          const nextValue = event.target.value.slice(0, 500);
          setValue(nextValue);
          onChange(nextValue);
        }}
        rows={3}
        maxLength={500}
        placeholder="Nhập lý do để lưu trong lịch sử đơn..."
        className="w-full resize-y rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
      />
      <span className="mt-1 block text-right text-[11px] text-slate-400">
        {value.length}/500
      </span>
    </label>
  );
}

export function SellerOrdersScreen({ deliveryType }: SellerOrdersScreenProps) {
  const modal = useAppModal();
  const [cursorStack, setCursorStack] = useState<Array<SellerOrderCursor | null>>([null]);
  const [inputs, setInputs] = useState<FilterInputs>(EMPTY_INPUTS);
  const [applied, setApplied] = useState<FilterInputs>(EMPTY_INPUTS);
  const [filterError, setFilterError] = useState<string | null>(null);
  const [mutatingOrderId, setMutatingOrderId] = useState<number | null>(null);
  const cursor = cursorStack.at(-1) ?? null;
  const copy = PAGE_COPY[deliveryType ?? "ALL"];
  const filters = useMemo<SellerOrderFilters>(() => ({
    search: applied.search,
    status: applied.status,
    fromDate: applied.fromDate,
    toDate: applied.toDate,
    deliveryType,
  }), [applied, deliveryType]);
  const { result, error, isLoading, refresh } = useSellerOrders(cursor, PAGE_SIZE, filters);

  function submitFilters(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (inputs.fromDate && inputs.toDate && inputs.fromDate > inputs.toDate) {
      setFilterError("Ngày bắt đầu không được sau ngày kết thúc.");
      return;
    }
    setFilterError(null);
    setApplied({ ...inputs, search: inputs.search.trim() });
    setCursorStack([null]);
  }

  function clearFilters() {
    setInputs(EMPTY_INPUTS);
    setApplied(EMPTY_INPUTS);
    setFilterError(null);
    setCursorStack([null]);
  }

  async function runPreOrderAction(
    order: OrderSummary,
    action: "accept" | "reject" | "cancel",
  ) {
    let reason = "";
    const destructive = action !== "accept";
    const confirmed = await modal.confirm({
      title: action === "accept"
        ? "Nhận đơn đặt hàng?"
        : action === "reject"
          ? "Từ chối đơn và hoàn tiền?"
          : "Hủy đơn đang thực hiện?",
      description: action === "accept"
        ? `Đơn ${order.orderCode} sẽ chuyển sang Đang thực hiện.`
        : `Toàn bộ ${formatCurrency(Number(order.totalAmount))} sẽ được hoàn về ví người mua.`,
      details: destructive ? <ReasonField onChange={(value) => { reason = value; }} /> : undefined,
      confirmLabel: action === "accept" ? "Nhận đơn" : action === "reject" ? "Từ chối & hoàn tiền" : "Hủy & hoàn tiền",
      cancelLabel: "Quay lại",
      danger: destructive,
    });
    if (!confirmed) return;

    setMutatingOrderId(order.id);
    try {
      if (action === "accept") await sellerOrderService.accept(order.id);
      else if (action === "reject") await sellerOrderService.reject(order.id, reason);
      else await sellerOrderService.cancel(order.id, reason);
      modal.showSuccess({
        title: action === "accept" ? "Đã nhận đơn" : "Đã hoàn tiền cho người mua",
        description: action === "accept"
          ? "Hãy hoàn tất trước thời hạn xử lý hiển thị trong chi tiết đơn."
          : `Đơn ${order.orderCode} đã được cập nhật.`,
      });
      refresh();
    } catch (requestError: unknown) {
      modal.showError({
        title: "Không thể cập nhật đơn hàng",
        description: getApiErrorMessage(requestError),
      });
      refresh();
    } finally {
      setMutatingOrderId(null);
    }
  }

  function nextPage() {
    if (result.last || result.content.length === 0) return;
    const lastOrder = result.content.at(-1);
    if (!lastOrder) return;
    setCursorStack((current) => [
      ...current,
      { beforePlacedAt: lastOrder.placedAt, beforeId: lastOrder.id },
    ]);
  }

  function previousPage() {
    setCursorStack((current) => current.length > 1 ? current.slice(0, -1) : current);
  }

  const hasFilters = Object.values(applied).some(Boolean);

  return (
    <div className="mx-auto w-full max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          {copy.eyebrow ? (
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-violet-600">{copy.eyebrow}</p>
          ) : null}
          <h1 className="mt-1 text-2xl font-black text-slate-950 sm:text-3xl">{copy.title}</h1>
          <p className="mt-1 text-sm text-slate-500">{copy.description}</p>
        </div>
        <button
          type="button"
          onClick={refresh}
          disabled={isLoading}
          className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 shadow-sm transition hover:border-violet-200 hover:text-violet-700 disabled:opacity-50"
        >
          <RefreshCw className={`size-4 ${isLoading ? "animate-spin" : ""}`} />
          Làm mới
        </button>
      </div>

      <form onSubmit={submitFilters} className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 xl:grid-cols-[minmax(260px,1.4fr)_220px_170px_170px_auto]">
          <label className="relative block">
            <span className="sr-only">Tìm kiếm đơn hàng</span>
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={inputs.search}
              onChange={(event) => setInputs((current) => ({ ...current, search: event.target.value.slice(0, 100) }))}
              placeholder="Tìm mã đơn hoặc username người mua..."
              className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none transition focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
            />
          </label>
          <select
            aria-label="Trạng thái đơn"
            value={inputs.status}
            onChange={(event) => setInputs((current) => ({ ...current, status: event.target.value }))}
            className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value || "all"} value={option.value}>{option.label}</option>
            ))}
          </select>
          <input
            type="date"
            aria-label="Từ ngày"
            value={inputs.fromDate}
            onChange={(event) => setInputs((current) => ({ ...current, fromDate: event.target.value }))}
            className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
          />
          <input
            type="date"
            aria-label="Đến ngày"
            value={inputs.toDate}
            onChange={(event) => setInputs((current) => ({ ...current, toDate: event.target.value }))}
            className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
          />
          <button
            type="submit"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 text-sm font-black text-white transition hover:bg-violet-700"
          >
            <SlidersHorizontal className="size-4" />
            Áp dụng
          </button>
        </div>
        <div className="mt-2 flex min-h-6 items-center justify-between gap-3 text-xs">
          <span className={filterError ? "font-semibold text-rose-600" : "text-slate-400"}>
            {filterError ?? "Dữ liệu được lọc trực tiếp từ đơn thuộc gian hàng của bạn."}
          </span>
          {hasFilters ? (
            <button type="button" onClick={clearFilters} className="font-bold text-violet-600 hover:text-violet-700">
              Xóa bộ lọc
            </button>
          ) : null}
        </div>
      </form>

      <section className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="hidden grid-cols-[minmax(250px,1.4fr)_150px_170px_150px_minmax(250px,1fr)] gap-4 border-b border-slate-100 bg-slate-50 px-5 py-3 text-xs font-black uppercase tracking-[0.06em] text-slate-500 lg:grid">
          <span>Đơn hàng / người mua</span>
          <span>Loại đơn</span>
          <span>Thời gian</span>
          <span>Thanh toán</span>
          <span className="text-right">Trạng thái / thao tác</span>
        </div>

        {isLoading ? (
          <div className="grid min-h-64 place-items-center text-sm font-semibold text-slate-500">
            <span className="inline-flex items-center gap-2"><LoaderCircle className="size-5 animate-spin text-violet-600" />Đang tải đơn hàng...</span>
          </div>
        ) : error ? (
          <div className="grid min-h-64 place-items-center px-5 text-center">
            <div>
              <AlertCircle className="mx-auto size-9 text-rose-500" />
              <p className="mt-3 font-bold text-slate-800">Không thể tải danh sách</p>
              <p className="mt-1 text-sm text-slate-500">{error}</p>
            </div>
          </div>
        ) : result.content.length === 0 ? (
          <div className="grid min-h-64 place-items-center px-5 text-center">
            <div>
              <PackageCheck className="mx-auto size-10 text-slate-300" />
              <p className="mt-3 font-bold text-slate-800">Chưa có đơn phù hợp</p>
              <p className="mt-1 text-sm text-slate-500">Thử thay đổi từ khóa, trạng thái hoặc khoảng ngày.</p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {result.content.map((order) => {
              const effectiveStatus = order.effectiveStatus || order.status;
              const busy = mutatingOrderId === order.id;
              return (
                <article key={order.id} className="grid gap-4 px-5 py-4 transition hover:bg-slate-50/70 lg:grid-cols-[minmax(250px,1.4fr)_150px_170px_150px_minmax(250px,1fr)] lg:items-center">
                  <div className="min-w-0">
                    <Link href={`/seller/orders/${order.id}`} className="break-all text-sm font-black text-violet-700 hover:underline">
                      {order.orderCode}
                    </Link>
                    <p className="mt-1 truncate text-xs text-slate-500">Người mua: <span className="font-bold text-slate-700">@{order.buyerUsername || "không xác định"}</span></p>
                  </div>
                  <span className={`inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${order.deliveryType === "PRE_ORDER" ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"}`}>
                    {order.deliveryType === "PRE_ORDER" ? <Clock3 className="size-3.5" /> : <Check className="size-3.5" />}
                    {deliveryTypeLabel(order.deliveryType)}
                  </span>
                  <p className="text-sm font-semibold text-slate-700">{formatDateTime(order.placedAt)}</p>
                  <div>
                    <p className="font-black text-slate-950">{formatCurrency(Number(order.totalAmount))}</p>
                    <p className="mt-0.5 text-xs font-semibold text-emerald-700">{order.paymentStatus === "REFUNDED" ? "Đã hoàn tiền" : "Đã thanh toán"}</p>
                  </div>
                  <div className="flex flex-wrap items-center justify-start gap-2 lg:justify-end">
                    <OrderStatusBadge status={effectiveStatus} />
                    <Link
                      href={`/seller/orders/${order.id}`}
                      title="Xem chi tiết"
                      className="inline-grid size-9 place-items-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700"
                    >
                      <Eye className="size-4" />
                    </Link>
                    {order.deliveryType === "PRE_ORDER" && order.status === "WAITING_APPROVAL" ? (
                      <>
                        <button
                          type="button"
                          onClick={() => void runPreOrderAction(order, "accept")}
                          disabled={busy || isLoading}
                          className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-emerald-600 px-3 text-xs font-black text-white hover:bg-emerald-700 disabled:opacity-50"
                        >
                          {busy ? <LoaderCircle className="size-3.5 animate-spin" /> : <Check className="size-3.5" />} Nhận đơn
                        </button>
                        <button
                          type="button"
                          onClick={() => void runPreOrderAction(order, "reject")}
                          disabled={busy || isLoading}
                          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-rose-200 px-3 text-xs font-black text-rose-600 hover:bg-rose-50 disabled:opacity-50"
                        >
                          <X className="size-3.5" /> Từ chối
                        </button>
                      </>
                    ) : null}
                    {order.deliveryType === "PRE_ORDER" && order.status === "PROCESSING" ? (
                      <>
                        <Link href={`/seller/orders/${order.id}#complete-order`} className="inline-flex h-9 items-center rounded-lg bg-violet-600 px-3 text-xs font-black text-white hover:bg-violet-700">
                          Hoàn thành
                        </Link>
                        <button
                          type="button"
                          onClick={() => void runPreOrderAction(order, "cancel")}
                          disabled={busy || isLoading}
                          className="inline-flex h-9 items-center rounded-lg border border-rose-200 px-3 text-xs font-black text-rose-600 hover:bg-rose-50 disabled:opacity-50"
                        >
                          Hủy đơn
                        </button>
                      </>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>
        )}

        <footer className="flex items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/70 px-5 py-3">
          <span className="text-xs font-semibold text-slate-500">Trang {cursorStack.length} · tối đa {PAGE_SIZE} đơn/trang</span>
          <div className="flex gap-2">
            <button type="button" onClick={previousPage} disabled={cursorStack.length === 1 || isLoading} className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold text-slate-600 hover:border-violet-300 hover:text-violet-700 disabled:cursor-not-allowed disabled:opacity-40">
              <ChevronLeft className="size-4" /> Trước
            </button>
            <button type="button" onClick={nextPage} disabled={result.last || isLoading} className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 text-xs font-bold text-slate-600 hover:border-violet-300 hover:text-violet-700 disabled:cursor-not-allowed disabled:opacity-40">
              Sau <ChevronRight className="size-4" />
            </button>
          </div>
        </footer>
      </section>
    </div>
  );
}
