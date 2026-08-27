const ORDER_STATUS: Record<string, { label: string; className: string }> = {
  WAITING_APPROVAL: {
    label: "Chờ shop xác nhận",
    className: "border-amber-200 bg-amber-50 text-amber-700",
  },
  PROCESSING: {
    label: "Đang xử lý",
    className: "border-sky-200 bg-sky-50 text-sky-700",
  },
  DELIVERED: {
    label: "Đã giao hàng",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  DISPUTED: {
    label: "Đang khiếu nại",
    className: "border-violet-200 bg-violet-50 text-violet-700",
  },
  REFUNDED: {
    label: "Đã hoàn tiền",
    className: "border-cyan-200 bg-cyan-50 text-cyan-700",
  },
  REJECTED: {
    label: "Shop từ chối",
    className: "border-rose-200 bg-rose-50 text-rose-700",
  },
  CANCELLED: {
    label: "Đã hủy",
    className: "border-slate-200 bg-slate-100 text-slate-600",
  },
  CANCELLED_BY_SELLER: {
    label: "Shop đã hủy",
    className: "border-rose-200 bg-rose-50 text-rose-700",
  },
  CANCELLED_BY_SYSTEM: {
    label: "Hệ thống đã hủy",
    className: "border-slate-200 bg-slate-100 text-slate-600",
  },
  PENDING: {
    label: "Chờ xử lý",
    className: "border-amber-200 bg-amber-50 text-amber-700",
  },
  APPROVED: {
    label: "Đã xác nhận",
    className: "border-blue-200 bg-blue-50 text-blue-700",
  },
};

export function OrderStatusBadge({ status }: { status: string }) {
  const display = ORDER_STATUS[status] ?? {
    label: status.replaceAll("_", " "),
    className: "border-slate-200 bg-slate-50 text-slate-600",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-bold ${display.className}`}
    >
      {display.label}
    </span>
  );
}
