"use client";

import { ArrowLeft, CircleAlert, Clock3, InfoIcon, LoaderCircle, Scale } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { useAppModal } from "@/components/ui/app-modal";
import { useOptionalSellerNotifications } from "@/hooks/api/useSellerNotifications";
import { formatCurrency } from "@/lib/format";
import { getApiErrorMessage } from "@/services/api";
import { disputeService } from "@/services/dispute.service";
import type { Dispute } from "@/types";

import { DisputeStatusBadge } from "./DisputeStatusBadge";

type Mode = "buyer" | "seller" | "admin";
type ActionConfirmation = {
  title: string;
  description: string;
  confirmLabel: string;
  danger?: boolean;
};

const RESOLUTION_LABELS: Record<NonNullable<Dispute["resolution"]>, string> = {
  BUYER_WIN: "Buyer thắng — đã hoàn tiền",
  SELLER_WIN: "Seller thắng — tiếp tục thời gian giữ tiền",
  SELLER_REFUND: "Seller chủ động hoàn 100%",
  BUYER_WITHDREW: "Buyer tự hủy khiếu nại",
  WARRANTY_ACCEPTED: "Buyer xác nhận bảo hành thành công",
  BUYER_CONFIRMATION_TIMEOUT: "Buyer không phản hồi trong thời hạn xác nhận",
};

export function DisputeDetailScreen({ id, mode }: { id: number; mode: Mode }) {
  const modal = useAppModal();
  const sellerNotifications = useOptionalSellerNotifications();
  const [dispute, setDispute] = useState<Dispute | null>(null);
  const [response, setResponse] = useState("");
  const [escalationReason, setEscalationReason] = useState("");
  const [resolutionNote, setResolutionNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  async function run(
    action: () => Promise<Dispute>,
    success: string,
    confirmation: ActionConfirmation,
  ) {
    const confirmed = await modal.confirm({
      ...confirmation,
      details: (
        <div className="space-y-1 text-center">
          <p>Đơn hàng <strong className="text-slate-950">{dispute?.orderCode || "Chưa cập nhật mã đơn"}</strong></p>
          <p className="text-xs text-slate-500">{dispute?.productName || "Sản phẩm"} · {dispute?.variantName || "Mặc định"}</p>
          {dispute?.disputedAmount != null ? <p className="font-black text-emerald-700">{formatCurrency(Number(dispute.disputedAmount))}</p> : null}
        </div>
      ),
      cancelLabel: "Hủy",
    });
    if (!confirmed) return;

    setSubmitting(true);
    setError(null);
    try {
      setDispute(await action());
      if (mode === "admin") window.dispatchEvent(new Event("admin-disputes-updated"));
      if (mode === "seller") await sellerNotifications?.refresh();
      modal.showSuccess({
        title: success,
        description: "Trạng thái khiếu nại đã được cập nhật thành công.",
        confirmLabel: "Hoàn tất",
      });
    } catch (requestError) {
      modal.showError({
        title: "Không thể cập nhật khiếu nại",
        description: getApiErrorMessage(requestError, "Không thể cập nhật khiếu nại"),
        confirmLabel: "Đã hiểu",
      });
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
          <div><p className="text-xs font-bold uppercase tracking-widest text-violet-700">Khiếu nại đơn hàng</p><h1 className="mt-2 break-all text-2xl font-black text-slate-950">{dispute.orderCode || "Mã đơn chưa cập nhật"}</h1></div>
          <DisputeStatusBadge status={dispute.status} />
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Info label="Gian hàng" value={dispute.shopName || "Chưa cập nhật"} />
          <Info label="Sản phẩm / biến thể" value={`${dispute.productName || "Sản phẩm"} · ${dispute.variantName || "Mặc định"}`} />
          <Info label="Tạo lúc" value={new Date(dispute.createdAt).toLocaleString("vi-VN")} />
          <Info label="Hạn xử lý" value={new Date(dispute.deadlineAt).toLocaleString("vi-VN")} icon />
        </div>
        {mode === "admin" ? (
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm font-semibold">
            <UserProfileLink label="Buyer" username={dispute.buyerUsername} />
            <UserProfileLink label="Seller" username={dispute.sellerUsername} />
          </div>
        ) : null}
        {mode === "admin" && dispute.adminOverdue ? (
          <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm leading-6 text-rose-800" role="alert">
            <CircleAlert className="mt-0.5 size-4 shrink-0" />
            <p><strong>Đã quá hạn 72 giờ xử lý.</strong> Hồ sơ cần được ưu tiên nhưng hệ thống không tự động xử Buyer hoặc Seller thắng.</p>
          </div>
        ) : null}
        {dispute.status === "RESOLVED" && dispute.resolution ? (
          <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            <InfoIcon className="mt-0.5 size-4 shrink-0 text-slate-500" />
            <div>
              <p><strong>Kết quả xử lý:</strong> {RESOLUTION_LABELS[dispute.resolution]}</p>
              {mode === "buyer" ? <p className="mt-1 text-xs leading-5 text-slate-500">Nếu sản phẩm tiếp tục phát sinh lỗi, hãy liên hệ shop để được hỗ trợ; nếu shop không hỗ trợ, hãy liên hệ Admin.</p> : null}
            </div>
          </div>
        ) : null}
        {dispute.status === "WARRANTY_IN_PROGRESS" ? (
          <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
            <Clock3 className="mt-0.5 size-4 shrink-0" />
            <p>Seller có tối đa <strong>24 giờ kể từ lúc nhận bảo hành</strong> để hoàn tất xử lý. Quá hạn, hệ thống tự động hoàn 100% tiền cho buyer mà không cần Admin phán quyết.</p>
          </div>
        ) : null}
        {mode === "seller" && dispute.status === "WAITING_BUYER_CONFIRMATION" ? (
          <div className="mt-4 flex items-start gap-2.5 rounded-xl border border-sky-200 bg-sky-50 p-4 text-sm leading-6 text-sky-900" role="status">
            <Clock3 className="mt-0.5 size-4 shrink-0" />
            <p>
              <strong>Đã hoàn tất bảo hành.</strong> Nếu buyer không phản hồi trước <strong>{new Date(dispute.deadlineAt).toLocaleString("vi-VN")}</strong>, khiếu nại sẽ tự đóng và khoản tiền tiếp tục thời gian giữ T+7 còn lại.
            </p>
          </div>
        ) : null}
        <div className="mt-6 rounded-xl bg-slate-50 p-4"><p className="text-xs font-bold uppercase tracking-wide text-slate-500">Lý do buyer</p><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-800">{dispute.reason}</p></div>
        {dispute.shopResponse ? <div className="mt-4 rounded-xl bg-sky-50 p-4"><p className="text-xs font-bold uppercase tracking-wide text-sky-700">Phản hồi seller</p><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-800">{dispute.shopResponse}</p></div> : null}
        {dispute.escalationReason ? <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4"><p className="text-xs font-bold uppercase tracking-wide text-amber-800">Lý do chuyển Admin · {dispute.escalatedBy === "SELLER" ? "Seller" : "Buyer"}</p><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-800">{dispute.escalationReason}</p>{dispute.escalatedAt ? <p className="mt-2 text-xs text-amber-700">Chuyển lúc {new Date(dispute.escalatedAt).toLocaleString("vi-VN")}</p> : null}</div> : null}
        {dispute.resolutionNote ? <div className="mt-4 rounded-xl bg-violet-50 p-4"><p className="text-xs font-bold uppercase tracking-wide text-violet-700">Ghi chú phán quyết</p><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-800">{dispute.resolutionNote}</p></div> : null}
        {dispute.refundAmount !== null ? <p className="mt-5 text-sm font-bold text-emerald-700">Số tiền hoàn: {formatCurrency(Number(dispute.refundAmount))}</p> : null}
      </section>

      {error ? <div className="flex gap-2 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700" role="alert"><CircleAlert className="size-5 shrink-0" />{error}</div> : null}

      {mode === "seller" && ["OPEN", "WARRANTY_IN_PROGRESS"].includes(dispute.status) ? (
        <ActionPanel title="Phản hồi khiếu nại">
          <textarea value={response} onChange={(event) => setResponse(event.target.value)} maxLength={5000} rows={4} placeholder="Mô tả cách xử lý hoặc kết quả bảo hành..." className="w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-violet-500" />
          <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 p-3">
            <label className="text-xs font-black uppercase tracking-wide text-rose-700" htmlFor="seller-escalation-reason">Lý do từ chối / chuyển Admin</label>
            <textarea id="seller-escalation-reason" value={escalationReason} onChange={(event) => setEscalationReason(event.target.value)} maxLength={200} rows={3} placeholder="Bắt buộc khi chuyển Admin, tối đa 200 ký tự..." className="mt-2 w-full rounded-xl border border-rose-200 bg-white p-3 text-sm outline-none focus:border-rose-500" />
            <p className="mt-1 text-right text-xs text-rose-600">{escalationReason.length}/200</p>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {dispute.status === "OPEN" ? <ActionButton disabled={submitting} onClick={() => void run(() => disputeService.startWarranty(dispute, { response }), "Đã bắt đầu bảo hành", { title: "Xác nhận nhận bảo hành", description: "Bạn xác nhận tiếp nhận và xử lý khiếu nại này cho buyer.", confirmLabel: "Nhận bảo hành" })}>Nhận bảo hành</ActionButton> : null}
            {dispute.status === "WARRANTY_IN_PROGRESS" ? <ActionButton disabled={submitting} onClick={() => void run(() => disputeService.completeWarranty(dispute, { response }), "Đã chuyển sang chờ buyer xác nhận", { title: "Xác nhận đã xử lý xong", description: "Khiếu nại sẽ chuyển sang chờ buyer xác nhận kết quả bảo hành.", confirmLabel: "Báo đã xử lý" })}>Báo đã xử lý xong</ActionButton> : null}
            <ActionButton refund disabled={submitting} onClick={() => void run(
              () => disputeService.refundSeller(dispute, { response }),
              "Đã hoàn tiền cho buyer",
              {
                title: "Hoàn tiền sản phẩm khiếu nại?",
                description: `Hệ thống sẽ hoàn 100%${dispute.disputedAmount != null ? ` (${formatCurrency(Number(dispute.disputedAmount))})` : ""} vào ví CommerceHub của buyer. Khiếu nại sẽ đóng ngay và thao tác này không thể hoàn tác.`,
                confirmLabel: "Xác nhận hoàn tiền",
                danger: true,
              },
            )}>Hoàn tiền sản phẩm</ActionButton>
            <ActionButton danger disabled={submitting || !escalationReason.trim()} onClick={() => void run(() => disputeService.escalateSeller(dispute, { reason: escalationReason.trim() }), "Đã chuyển tranh chấp cho admin", { title: "Chuyển tranh chấp cho Admin?", description: "Seller từ chối hoặc không thể bảo hành; lý do sẽ được lưu trong hồ sơ phán quyết.", confirmLabel: "Chuyển Admin", danger: true })}>Từ chối / chuyển Admin</ActionButton>
          </div>
        </ActionPanel>
      ) : null}

      {mode === "buyer" && dispute.status === "WAITING_BUYER_CONFIRMATION" ? (
        <ActionPanel title="Xác nhận kết quả bảo hành">
          <p className="text-sm leading-6 text-slate-600">Nếu đồng ý, đồng hồ giữ tiền T+7 tiếp tục. Nếu từ chối, tranh chấp chuyển sang admin.</p>
          <textarea value={escalationReason} onChange={(event) => setEscalationReason(event.target.value)} maxLength={200} rows={3} placeholder="Nhập lý do không đồng ý kết quả bảo hành (bắt buộc, tối đa 200 ký tự)..." className="mt-3 w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-violet-500" />
          <p className="mt-1 text-right text-xs text-slate-500">{escalationReason.length}/200</p>
          <div className="mt-3 flex flex-wrap gap-2"><ActionButton disabled={submitting} onClick={() => void run(() => disputeService.confirmWarranty(dispute.id), "Đã xác nhận bảo hành hoàn tất", { title: "Xác nhận đồng ý kết quả", description: "Đồng hồ giữ tiền T+7 sẽ tiếp tục sau khi bạn xác nhận.", confirmLabel: "Tôi đồng ý" })}>Tôi đồng ý</ActionButton><ActionButton danger disabled={submitting || !escalationReason.trim()} onClick={() => void run(() => disputeService.rejectWarranty(dispute.id, { reason: escalationReason.trim() }), "Đã chuyển tranh chấp cho admin", { title: "Không đồng ý kết quả?", description: "Lý do từ chối sẽ được lưu và tranh chấp chuyển sang Admin để phán quyết.", confirmLabel: "Chuyển Admin", danger: true })}>Tôi không đồng ý</ActionButton></div>
        </ActionPanel>
      ) : null}

      {mode === "buyer" && ["OPEN", "WARRANTY_IN_PROGRESS"].includes(dispute.status) ? (
        <ActionPanel title="Tùy chọn của buyer">
          <div className="flex gap-2.5 rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-xs leading-5 text-amber-900">
            <InfoIcon className="mt-0.5 size-4 shrink-0" />
            <p>Mỗi sản phẩm trong đơn chỉ được khiếu nại một lần trong thời gian giữ tiền T+7. Sau khi tự hủy, đồng hồ T+7 tiếp tục và bạn không thể mở lại khiếu nại này.</p>
          </div>
          <div className="mt-3">
            <ActionButton danger disabled={submitting} onClick={() => void run(
              () => disputeService.withdraw(dispute.id),
              "Đã hủy khiếu nại",
              {
                title: "Tự hủy khiếu nại?",
                description: "Thao tác này không thể hoàn tác. Bạn không thể khiếu nại lại sản phẩm này; thời gian giữ tiền T+7 sẽ tiếp tục phần còn lại.",
                confirmLabel: "Xác nhận hủy",
                danger: true,
              },
            )}>Tự hủy khiếu nại</ActionButton>
          </div>
        </ActionPanel>
      ) : null}

      {mode === "admin" && dispute.status === "ADMIN_REVIEW" ? (
        <ActionPanel title="Phán quyết của admin">
          <textarea value={resolutionNote} onChange={(event) => setResolutionNote(event.target.value)} maxLength={5000} rows={4} placeholder="Ghi chú phán quyết bắt buộc..." className="w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-violet-500" />
          <p className="mt-1 text-right text-xs text-slate-500">{resolutionNote.length}/5000</p>
          <div className="mt-3 flex flex-wrap gap-2"><ActionButton disabled={submitting || !resolutionNote.trim()} onClick={() => void run(() => disputeService.resolveAdmin(dispute.id, "BUYER_WIN", resolutionNote.trim()), "Đã phán buyer thắng và hoàn 100%", { title: "Xác nhận Buyer thắng", description: "Hệ thống sẽ hoàn 100% tiền của sản phẩm khiếu nại cho buyer và hủy phí liên quan.", confirmLabel: "Hoàn tiền cho Buyer" })}>Buyer thắng</ActionButton><ActionButton danger disabled={submitting || !resolutionNote.trim()} onClick={() => void run(() => disputeService.resolveAdmin(dispute.id, "SELLER_WIN", resolutionNote.trim()), "Đã phán seller thắng; T+7 tiếp tục", { title: "Xác nhận Seller thắng", description: "Khoản giữ tiền sẽ quay lại luồng T+7 và tiếp tục chờ quyết toán cho seller.", confirmLabel: "Xác nhận Seller thắng", danger: true })}>Seller thắng</ActionButton></div>
        </ActionPanel>
      ) : null}
    </div>
  );
}

function Info({ label, value, icon = false }: { label: string; value: string; icon?: boolean }) {
  return <div className="rounded-xl border border-slate-100 bg-slate-50 p-4"><p className="text-xs font-bold uppercase text-slate-400">{label}</p><p className="mt-2 flex items-center gap-2 text-sm font-bold text-slate-800">{icon ? <Clock3 className="size-4 text-violet-600" /> : null}{value}</p></div>;
}
function UserProfileLink({ label, username }: { label: string; username: string | null }) {
  if (!username) return <span className="text-slate-400">{label}: chưa cập nhật username</span>;
  return <Link href={`/users/${encodeURIComponent(username)}`} className="text-violet-700 hover:underline">{label}: @{username}</Link>;
}
function ActionPanel({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"><h2 className="mb-4 flex items-center gap-2 font-black text-slate-900"><Scale className="size-5 text-violet-600" />{title}</h2>{children}</section>;
}
function ActionButton({ children, danger = false, refund = false, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { danger?: boolean; refund?: boolean }) {
  const tone = danger
    ? "bg-rose-600 hover:bg-rose-700"
    : refund
      ? "bg-amber-500 hover:bg-amber-600"
      : "bg-emerald-600 hover:bg-emerald-700";
  return <button type="button" {...props} className={`h-11 rounded-xl px-5 text-sm font-black text-white transition disabled:cursor-not-allowed disabled:opacity-50 ${tone}`}>{children}</button>;
}
