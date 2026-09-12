import type { OrderCancellationCode, OrderCancelledBy, OrderStatus } from "@/types";

const ORDER_STATUS: Record<OrderStatus, { label: string; className: string }> = {
  WAITING_SELLER_ACCEPTANCE: {
    label: "Chờ shop nhận đơn",
    className: "border-amber-200 bg-amber-50 text-amber-700",
  },
  PROCESSING: {
    label: "Đang thực hiện",
    className: "border-sky-200 bg-sky-50 text-sky-700",
  },
  DELIVERED: {
    label: "Đã giao hàng",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  REJECTED: {
    label: "Shop từ chối",
    className: "border-rose-200 bg-rose-50 text-rose-700",
  },
  CANCELLED: {
    label: "Đã hủy",
    className: "border-slate-200 bg-slate-100 text-slate-600",
  },
};

const CANCELLED_BY_LABEL: Record<OrderCancelledBy, string> = {
  BUYER: "Buyer đã hủy",
  SELLER: "Shop đã hủy",
  SYSTEM: "Hệ thống đã hủy",
  ADMIN: "Admin đã hủy",
};

const CANCELLATION_CODE_LABEL: Record<OrderCancellationCode, string> = {
  BUYER_REQUEST: "Người mua yêu cầu hủy",
  SELLER_CANCELLED: "Người bán hủy đơn",
  SELLER_ACCEPTANCE_TIMEOUT: "Shop không nhận đơn trong 24 giờ",
  SELLER_PROCESSING_TIMEOUT: "Shop không hoàn thành trong 24 giờ",
  ADMIN_CANCELLED: "Admin hủy đơn",
};

export function cancellationCodeLabel(code?: OrderCancellationCode | null): string {
  return code ? CANCELLATION_CODE_LABEL[code] : "Không có mã lý do";
}

export function OrderStatusBadge({ status, cancelledBy }: {
  status: OrderStatus;
  cancelledBy?: OrderCancelledBy | null;
}) {
  const base = ORDER_STATUS[status];
  const label = status === "CANCELLED" && cancelledBy
    ? CANCELLED_BY_LABEL[cancelledBy]
    : base.label;

  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-bold ${base.className}`}>
      {label}
    </span>
  );
}

export function ActiveDisputeBadge() {
  return (
    <span className="inline-flex rounded-full border border-violet-200 bg-violet-50 px-2.5 py-1 text-xs font-bold text-violet-700">
      Đang khiếu nại
    </span>
  );
}
