import type { DisputeStatus } from "@/types";

const STATUS: Record<DisputeStatus, { label: string; tone: string }> = {
  OPEN: { label: "Chờ seller phản hồi", tone: "bg-amber-50 text-amber-700" },
  WARRANTY_IN_PROGRESS: { label: "Đang bảo hành", tone: "bg-sky-50 text-sky-700" },
  WAITING_BUYER_CONFIRMATION: {
    label: "Chờ buyer xác nhận",
    tone: "bg-violet-50 text-violet-700",
  },
  ADMIN_REVIEW: { label: "Admin đang xử lý", tone: "bg-rose-50 text-rose-700" },
  RESOLVED: { label: "Đã giải quyết", tone: "bg-slate-100 text-slate-600" },
};

export function DisputeStatusBadge({ status }: { status: DisputeStatus }) {
  const item = STATUS[status] ?? { label: status, tone: "bg-slate-100 text-slate-600" };
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${item.tone}`}>
      {item.label}
    </span>
  );
}
