"use client";

import type { LucideIcon } from "lucide-react";
import {
  Ban,
  CircleAlert,
  CircleDollarSign,
  Clock3,
  Eye,
  PackageCheck,
  RefreshCw,
  RotateCcw,
  ShoppingBag,
  WalletCards,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { useSellerDashboard } from "@/hooks/api/useSellerDashboard";
import { useSellerNotifications } from "@/hooks/api/useSellerNotifications";
import { formatCurrency } from "@/lib/format";
import type { SellerOrderStatusCount } from "@/types";

import { SellerRevenueChart } from "./SellerRevenueChart";

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Đang khởi tạo",
  WAITING_APPROVAL: "Chờ shop xác nhận",
  APPROVED: "Đã xác nhận",
  PROCESSING: "Đang xử lý",
  DELIVERED: "Đã giao hàng",
  DISPUTED: "Đang khiếu nại",
  REFUNDED: "Đã hoàn tiền",
  REJECTED: "Shop từ chối",
  CANCELLED: "Đã hủy",
  CANCELLED_BY_SELLER: "Shop đã hủy",
  CANCELLED_BY_SYSTEM: "Hệ thống đã hủy",
};

function currentBusinessMonth() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
  }).formatToParts(new Date());
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  return `${year}-${month}`;
}

function formatMonthLabel(value: string) {
  const [year, month] = value.split("-");
  return `Tháng ${month}/${year}`;
}

function formatCount(value: number) {
  return new Intl.NumberFormat("vi-VN").format(value);
}

function formatOrderTime(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function statusPresentation(status: string): {
  label: string;
  icon: LucideIcon;
  color: string;
} {
  if (["WAITING_APPROVAL", "PENDING", "APPROVED", "PROCESSING"].includes(status)) {
    return {
      label: STATUS_LABELS[status] ?? status,
      icon: Clock3,
      color: "bg-amber-50 text-amber-700",
    };
  }
  if (status === "DELIVERED") {
    return {
      label: STATUS_LABELS[status],
      icon: PackageCheck,
      color: "bg-emerald-50 text-emerald-700",
    };
  }
  if (status === "DISPUTED") {
    return {
      label: STATUS_LABELS[status],
      icon: CircleAlert,
      color: "bg-orange-50 text-orange-700",
    };
  }
  if (status === "REFUNDED") {
    return {
      label: STATUS_LABELS[status],
      icon: RotateCcw,
      color: "bg-sky-50 text-sky-700",
    };
  }
  return {
    label: STATUS_LABELS[status] ?? status,
    icon: Ban,
    color: "bg-slate-100 text-slate-600",
  };
}

export function SellerDashboard() {
  const [selectedMonth, setSelectedMonth] = useState(currentBusinessMonth);
  const { data, error, isLoading, refresh } = useSellerDashboard(selectedMonth);
  const { data: liveNotifications } = useSellerNotifications();
  const newPreOrderRequestCount = liveNotifications?.newPreOrderRequestCount
    ?? data?.newPreOrderRequestCount
    ?? null;

  const overviewCards: Array<{
    label: string;
    value: string;
    note: string;
    icon: LucideIcon;
    tone: string;
    notificationCount?: number;
    actionHref?: string;
    actionLabel?: string;
  }> = [
    {
      label: "Đơn trong tháng",
      value: data ? formatCount(data.orderCount) : "—",
      note: `Tổng đơn được tạo trong ${formatMonthLabel(selectedMonth).toLowerCase()}`,
      icon: ShoppingBag,
      tone: "bg-violet-50 text-violet-600",
    },
    {
      label: "Doanh thu tháng",
      value: data ? formatCurrency(data.revenue) : "—",
      note: "Đã loại đơn hủy và phần đã hoàn tiền",
      icon: CircleDollarSign,
      tone: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Số dư khả dụng",
      value: data ? formatCurrency(data.availableBalance) : "—",
      note: "Có thể rút hoặc sử dụng ngay",
      icon: WalletCards,
      tone: "bg-sky-50 text-sky-600",
    },
    {
      label: "Doanh thu tạm giữ",
      value: data ? formatCurrency(data.holdBalance) : "—",
      note: "Chờ hết thời gian đối soát",
      icon: CircleDollarSign,
      tone: "bg-indigo-50 text-indigo-600",
    },
    {
      label: "Yêu cầu Đặt hàng",
      value: newPreOrderRequestCount === null ? "—" : formatCount(newPreOrderRequestCount),
      note: "Đang chờ bạn xác nhận",
      icon: Clock3,
      tone: "bg-orange-50 text-orange-600",
      notificationCount: newPreOrderRequestCount ?? undefined,
      actionHref: "/seller/orders/pre-orders",
      actionLabel: "Xem các yêu cầu đặt hàng",
    },
    {
      label: "Đặt hàng đang làm",
      value: data ? formatCount(data.processingPreOrderCount ?? 0) : "—",
      note: "Đã nhận, chưa hoàn thành",
      icon: RefreshCw,
      tone: "bg-blue-50 text-blue-600",
    },
  ];

  return (
    <div className="mx-auto w-full max-w-[1500px] space-y-4 p-4 sm:p-5 lg:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-violet-700">Tổng quan</p>
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700">
              Dữ liệu thực
            </span>
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-[-0.035em] text-slate-950 sm:text-3xl">
            Hoạt động bán hàng
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Theo dõi nhanh doanh thu, đơn hàng và tình trạng gian hàng của bạn.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void refresh()}
          disabled={isLoading}
          className="inline-flex h-10 items-center justify-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600 transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700 disabled:cursor-wait disabled:opacity-60 sm:self-auto"
        >
          <RefreshCw className={`size-4 ${isLoading ? "animate-spin" : ""}`} />
          Làm mới
        </button>
      </div>

      {error ? (
        <div className="flex flex-col gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 sm:flex-row sm:items-center sm:justify-between" role="alert">
          <span className="flex items-start gap-2">
            <CircleAlert className="mt-0.5 size-4 shrink-0" />
            {error}
          </span>
          <button type="button" onClick={() => void refresh()} className="font-bold hover:underline">
            Thử lại
          </button>
        </div>
      ) : null}

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6" aria-label="Chỉ số bán hàng">
        {overviewCards.map(({
          label,
          value,
          note,
          icon: Icon,
          tone,
          notificationCount,
          actionHref,
          actionLabel,
        }) => (
          <article key={label} className="relative min-h-28 overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs font-semibold leading-5 text-slate-500">{label}</p>
                {isLoading ? (
                  <div className="mt-2 h-6 w-20 animate-pulse rounded-lg bg-slate-100" />
                ) : (
                  <p className="mt-1.5 truncate text-xl font-extrabold tracking-[-0.035em] text-slate-950" title={value}>{value}</p>
                )}
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {actionHref ? (
                  <Link
                    href={actionHref}
                    className="grid size-9 place-items-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700"
                    aria-label={actionLabel}
                    title={actionLabel}
                  >
                    <Eye className="size-[17px]" />
                  </Link>
                ) : null}
                <span className={`relative grid size-9 place-items-center rounded-xl ${tone}`}>
                  <Icon className="size-[18px]" />
                  {notificationCount ? (
                    <span
                      className="absolute -right-2 -top-2 grid min-w-5 place-items-center rounded-full bg-rose-600 px-1.5 py-0.5 text-[10px] font-black leading-4 text-white shadow-sm ring-2 ring-white"
                      aria-label={`${formatCount(notificationCount)} yêu cầu đặt hàng mới`}
                      title={`${formatCount(notificationCount)} yêu cầu đặt hàng mới`}
                    >
                      {notificationCount > 9 ? "9+" : notificationCount}
                    </span>
                  ) : null}
                </span>
              </div>
            </div>
            <p className="mt-3 line-clamp-2 text-[11px] font-medium leading-4 text-slate-400">{note}</p>
          </article>
        ))}
      </section>

      <SellerRevenueChart
        month={selectedMonth}
        dailyRevenue={data?.dailyRevenue ?? []}
        totalRevenue={data?.revenue ?? 0}
        isLoading={isLoading}
        onMonthChange={setSelectedMonth}
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(300px,0.75fr)]">
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
            <div>
              <h2 className="font-bold text-slate-950">Đơn hàng gần đây</h2>
              <p className="mt-1 text-xs text-slate-500">5 đơn mới nhất của gian hàng</p>
            </div>
            <ShoppingBag className="size-5 text-violet-600" />
          </div>

          {isLoading && !data ? (
            <div className="divide-y divide-slate-100">
              {Array.from({ length: 3 }, (_, index) => (
                <div key={index} className="grid gap-3 px-5 py-5 sm:grid-cols-4 sm:px-6">
                  {Array.from({ length: 4 }, (__, cellIndex) => (
                    <div key={cellIndex} className="h-4 animate-pulse rounded bg-slate-100" />
                  ))}
                </div>
              ))}
            </div>
          ) : data?.recentOrders.length ? (
            <div className="divide-y divide-slate-100">
              {data.recentOrders.map((order) => {
                const status = statusPresentation(order.status);
                return (
                  <Link
                    key={order.orderId}
                    href={`/seller/orders/${order.orderId}`}
                    className="grid gap-2 px-5 py-4 transition hover:bg-slate-50 sm:grid-cols-[minmax(155px,0.8fr)_minmax(0,1.5fr)_120px_145px] sm:items-center sm:px-6"
                  >
                    <span>
                      <span className="block truncate text-xs font-bold text-violet-700">{order.orderCode}</span>
                      <time className="mt-1 block text-[11px] text-slate-400" dateTime={order.placedAt}>
                        {formatOrderTime(order.placedAt)}
                      </time>
                    </span>
                    <span className="truncate text-sm font-semibold text-slate-700">{order.productSummary}</span>
                    <span className="text-sm font-bold text-slate-900">{formatCurrency(order.totalAmount)}</span>
                    <span className={`w-fit rounded-full px-2.5 py-1 text-[11px] font-bold ${status.color}`}>
                      {status.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="grid min-h-44 place-items-center px-6 py-10 text-center">
              <div>
                <ShoppingBag className="mx-auto size-8 text-slate-300" />
                <p className="mt-3 text-sm font-semibold text-slate-500">Gian hàng chưa có đơn hàng.</p>
              </div>
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="font-bold text-slate-950">Trạng thái đơn hàng</h2>
          <p className="mt-1 text-xs text-slate-500">{formatMonthLabel(selectedMonth)}</p>
          {isLoading && !data ? (
            <div className="mt-5 space-y-3">
              {Array.from({ length: 3 }, (_, index) => (
                <div key={index} className="h-16 animate-pulse rounded-xl bg-slate-100" />
              ))}
            </div>
          ) : data?.orderStatusCounts.length ? (
            <div className="mt-5 space-y-3">
              {data.orderStatusCounts.map((item) => (
                <OrderStatusRow key={item.status} item={item} />
              ))}
            </div>
          ) : (
            <p className="mt-6 rounded-xl bg-slate-50 px-4 py-6 text-center text-sm font-semibold text-slate-400">
              Tháng này chưa có đơn hàng.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}

function OrderStatusRow({ item }: { item: SellerOrderStatusCount }) {
  const presentation = statusPresentation(item.status);
  const Icon = presentation.icon;

  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-100 p-3">
      <span className={`grid size-9 place-items-center rounded-xl ${presentation.color}`}>
        <Icon className="size-[18px]" />
      </span>
      <span className="min-w-0 flex-1 text-sm font-semibold text-slate-600">{presentation.label}</span>
      <span className="text-lg font-extrabold text-slate-950">{formatCount(item.count)}</span>
    </div>
  );
}
