"use client";

import { ArrowLeft, CircleAlert, Clock3, LoaderCircle, Scale } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { formatCurrency } from "@/lib/format";
import { getApiErrorMessage } from "@/services/api";
import { disputeService } from "@/services/dispute.service";
import type { Dispute } from "@/types";

import { DisputeStatusBadge } from "./DisputeStatusBadge";

type Mode = "buyer" | "seller" | "admin";

export function DisputeDetailScreen({ id, mode }: { id: number; mode: Mode }) {
  const [dispute, setDispute] = useState<Dispute | null>(null);
  const [response, setResponse] = useState("");
  const [adminNote, setAdminNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const request = mode === "seller"
      ? disputeService.getSeller(id)
      : mode === "admin"
        ? disputeService.getAdmin(id)
        : disputeService.getBuyer(id);
    request
      .then((next) => {
        if (!cancelled) {
          setDispute(next);
          setResponse(next.shopResponse ?? "");
        }
      })
      .catch((requestError: unknown) => {
        if (!cancelled) setError(getApiErrorMessage(requestError, "Không thể tải khiếu nại"));
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [id, mode]);

  async function run(action: () => Promise<Dispute>, success: string) {
    setSubmitting(true);
    setError(null);
    setNotice(null);
    try {
      setDispute(await action());
      setNotice(success);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Không thể cập nhật khiếu nại"));
    } finally {
      setSubmitting(false);
    }
  }

  const backHref = mode === "seller" ? "/seller/disputes" : mode === "admin" ? "/admin/disputes" : "/disputes";

  if (loading && !dispute) {
    return <div className="flex min-h-[420px] items-center justify-center gap-2 text-sm text-slate-500"><LoaderCircle className="size-5 animate-spin" />Đang tải khiếu nại...</div>;
  }
  if (!dispute) {
    return <div className="mx-auto max-w-3xl p-6"><div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-rose-700">{error || "Không tìm thấy khiếu nại"}</div></div>;
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-5 p-4 sm:p-6 lg:p-8">
      <Link href={backHref} className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-violet-700"><ArrowLeft className="size-4" />Quay lại danh sách</Link>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div><p className="text-xs font-bold uppercase tracking-widest text-violet-700">Tranh chấp #{dispute.id}</p><h1 className="mt-2 text-2xl font-black text-slate-950">Đơn hàng #{dispute.orderId}</h1></div>
          <DisputeStatusBadge status={dispute.status} />
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <Info label="Order item" value={`#${dispute.orderItemId}`} />
          <Info label="Tạo lúc" value={new Date(dispute.createdAt).toLocaleString("vi-VN")} />
          <Info label="Hạn xử lý" value={new Date(dispute.deadlineAt).toLocaleString("vi-VN")} icon />
        </div>
        <div className="mt-6 rounded-xl bg-slate-50 p-4"><p className="text-xs font-bold uppercase tracking-wide text-slate-500">Lý do buyer</p><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-800">{dispute.reason}</p></div>
        {dispute.shopResponse ? <div className="mt-4 rounded-xl bg-sky-50 p-4"><p className="text-xs font-bold uppercase tracking-wide text-sky-700">Phản hồi seller</p><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-800">{dispute.shopResponse}</p></div> : null}
        {dispute.adminNote ? <div className="mt-4 rounded-xl bg-violet-50 p-4"><p className="text-xs font-bold uppercase tracking-wide text-violet-700">Ghi chú admin</p><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-800">{dispute.adminNote}</p></div> : null}
        {dispute.refundAmount !== null ? <p className="mt-5 text-sm font-bold text-emerald-700">Số tiền hoàn: {formatCurrency(Number(dispute.refundAmount))}</p> : null}
      </section>

      {error ? <div className="flex gap-2 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700" role="alert"><CircleAlert className="size-5 shrink-0" />{error}</div> : null}
      {notice ? <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700" role="status">{notice}</div> : null}

      {mode === "seller" && ["OPEN", "WARRANTY_IN_PROGRESS"].includes(dispute.status) ? (
        <ActionPanel title="Phản hồi khiếu nại">
          <textarea value={response} onChange={(event) => setResponse(event.target.value)} maxLength={5000} rows={5} placeholder="Mô tả cách xử lý hoặc lý do chuyển admin..." className="w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-violet-500" />
          <div className="mt-3 flex flex-wrap gap-2">
            {dispute.status === "OPEN" ? <ActionButton disabled={submitting} onClick={() => void run(() => disputeService.startWarranty(dispute, { response }), "Đã bắt đầu bảo hành")}>Nhận bảo hành</ActionButton> : null}
            {dispute.status === "WARRANTY_IN_PROGRESS" ? <ActionButton disabled={submitting} onClick={() => void run(() => disputeService.completeWarranty(dispute, { response }), "Đã chuyển sang chờ buyer xác nhận")}>Báo đã xử lý xong</ActionButton> : null}
            <ActionButton danger disabled={submitting} onClick={() => void run(() => disputeService.escalateSeller(dispute, { response }), "Đã chuyển tranh chấp cho admin")}>Từ chối / chuyển Admin</ActionButton>
          </div>
        </ActionPanel>
      ) : null}

      {mode === "buyer" && dispute.status === "WAITING_BUYER_CONFIRMATION" ? (
        <ActionPanel title="Xác nhận kết quả bảo hành">
          <p className="text-sm leading-6 text-slate-600">Nếu đồng ý, đồng hồ giữ tiền T+7 tiếp tục. Nếu từ chối, tranh chấp chuyển sang admin.</p>
          <div className="mt-3 flex flex-wrap gap-2"><ActionButton disabled={submitting} onClick={() => void run(() => disputeService.confirmWarranty(dispute.id), "Đã xác nhận bảo hành hoàn tất")}>Tôi đồng ý</ActionButton><ActionButton danger disabled={submitting} onClick={() => void run(() => disputeService.rejectWarranty(dispute.id), "Đã chuyển tranh chấp cho admin")}>Tôi không đồng ý</ActionButton></div>
        </ActionPanel>
      ) : null}

      {mode === "admin" && dispute.status === "PROCESSING" ? (
        <ActionPanel title="Phán quyết của admin">
          <textarea value={adminNote} onChange={(event) => setAdminNote(event.target.value)} maxLength={5000} rows={4} placeholder="Ghi chú phán quyết..." className="w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-violet-500" />
          <div className="mt-3 flex flex-wrap gap-2"><ActionButton disabled={submitting} onClick={() => void run(() => disputeService.resolveAdmin(dispute.id, "BUYER_WIN", adminNote), "Đã phán buyer thắng và hoàn 100%")}>Buyer thắng</ActionButton><ActionButton danger disabled={submitting} onClick={() => void run(() => disputeService.resolveAdmin(dispute.id, "SELLER_WIN", adminNote), "Đã phán seller thắng; T+7 tiếp tục")}>Seller thắng</ActionButton></div>
        </ActionPanel>
      ) : null}
    </div>
  );
}

function Info({ label, value, icon = false }: { label: string; value: string; icon?: boolean }) {
  return <div className="rounded-xl border border-slate-100 bg-slate-50 p-4"><p className="text-xs font-bold uppercase text-slate-400">{label}</p><p className="mt-2 flex items-center gap-2 text-sm font-bold text-slate-800">{icon ? <Clock3 className="size-4 text-violet-600" /> : null}{value}</p></div>;
}
function ActionPanel({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"><h2 className="mb-4 flex items-center gap-2 font-black text-slate-900"><Scale className="size-5 text-violet-600" />{title}</h2>{children}</section>;
}
function ActionButton({ children, danger = false, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { danger?: boolean }) {
  return <button type="button" {...props} className={`h-11 rounded-xl px-5 text-sm font-black text-white transition disabled:cursor-not-allowed disabled:opacity-50 ${danger ? "bg-rose-600 hover:bg-rose-700" : "bg-emerald-600 hover:bg-emerald-700"}`}>{children}</button>;
}
