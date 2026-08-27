"use client";

import { ArrowLeft, CircleAlert, LoaderCircle, Scale } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";

import { useAppModal } from "@/components/ui/app-modal";
import { getApiErrorMessage } from "@/services/api";
import { disputeService } from "@/services/dispute.service";

interface CreateDisputeScreenProps {
  orderId: number;
  orderItemId: number;
}

export function CreateDisputeScreen({ orderId, orderItemId }: CreateDisputeScreenProps) {
  const router = useRouter();
  const modal = useAppModal();
  const [reason, setReason] = useState("");
  const [evidenceText, setEvidenceText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validIds = Number.isSafeInteger(orderId) && orderId > 0
    && Number.isSafeInteger(orderItemId) && orderItemId > 0;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedReason = reason.trim();
    if (!validIds) {
      setError("Mã đơn hàng hoặc mã sản phẩm trong đơn không hợp lệ.");
      return;
    }
    if (!trimmedReason) {
      setError("Vui lòng nhập lý do khiếu nại.");
      return;
    }

    const evidenceUrls = evidenceText
      .split(/\r?\n/)
      .map((value) => value.trim())
      .filter(Boolean);

    if (evidenceUrls.length > 10) {
      setError("Chỉ được gửi tối đa 10 đường dẫn bằng chứng.");
      return;
    }
    if (evidenceUrls.some((value) => value.length > 500)) {
      setError("Mỗi đường dẫn bằng chứng chỉ được dài tối đa 500 ký tự.");
      return;
    }

    const confirmed = await modal.confirm({
      title: "Xác nhận gửi khiếu nại",
      description: "Sau khi gửi, giao dịch sẽ chuyển vào quy trình xử lý khiếu nại.",
      details: (
        <dl className="space-y-1.5">
          <div className="flex justify-between gap-4"><dt className="text-slate-500">Đơn hàng</dt><dd className="font-bold">#{orderId}</dd></div>
          <div className="flex justify-between gap-4"><dt className="text-slate-500">Sản phẩm trong đơn</dt><dd className="font-bold">#{orderItemId}</dd></div>
          <div className="flex justify-between gap-4"><dt className="text-slate-500">Bằng chứng</dt><dd className="font-bold">{evidenceUrls.length} đường dẫn</dd></div>
        </dl>
      ),
      confirmLabel: "Gửi khiếu nại",
    });
    if (!confirmed) return;

    setSubmitting(true);
    setError(null);
    try {
      const dispute = await disputeService.create(orderId, orderItemId, {
        reason: trimmedReason,
        evidenceUrls,
      });
      modal.showSuccess({
        title: "Gửi khiếu nại thành công",
        description: "Khiếu nại đã được ghi nhận và đang chờ seller phản hồi theo thời hạn quy định.",
        details: <p className="text-center">Mã khiếu nại: <strong className="text-slate-950">#{dispute.id}</strong></p>,
        confirmLabel: "Xem khiếu nại",
      });
      router.replace(`/disputes/${dispute.id}`);
    } catch (requestError) {
      modal.showError({
        title: "Không thể gửi khiếu nại",
        description: getApiErrorMessage(requestError, "Không thể tạo khiếu nại"),
        confirmLabel: "Đã hiểu",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl space-y-5 p-4 sm:p-6 lg:p-8">
      <Link href={`/orders/${orderId}`} className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-violet-700">
        <ArrowLeft className="size-4" />Quay lại đơn hàng
      </Link>

      <form onSubmit={submit} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <div className="flex items-start gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-violet-50 text-violet-700"><Scale className="size-5" /></span>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-violet-700">Đơn #{orderId} · Item #{orderItemId}</p>
            <h1 className="mt-1 text-2xl font-black text-slate-950">Tạo khiếu nại</h1>
            <p className="mt-2 text-sm leading-6 text-slate-500">Chỉ đơn đang giữ tiền và còn thời hạn T+7 mới có thể khiếu nại.</p>
          </div>
        </div>

        {!validIds ? <div className="mt-5 flex gap-2 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700" role="alert"><CircleAlert className="size-5 shrink-0" />Đường dẫn không chứa mã đơn hàng hợp lệ.</div> : null}
        {error ? <div className="mt-5 flex gap-2 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700" role="alert"><CircleAlert className="size-5 shrink-0" />{error}</div> : null}

        <label className="mt-6 block text-sm font-bold text-slate-800" htmlFor="dispute-reason">Lý do khiếu nại <span className="text-rose-600">*</span></label>
        <textarea id="dispute-reason" required maxLength={5000} rows={7} value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Mô tả vấn đề và kết quả bạn mong muốn..." className="mt-2 w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-violet-500" />
        <p className="mt-1 text-right text-xs text-slate-400">{reason.length}/5000</p>

        <label className="mt-4 block text-sm font-bold text-slate-800" htmlFor="dispute-evidence">Đường dẫn bằng chứng</label>
        <textarea id="dispute-evidence" rows={4} value={evidenceText} onChange={(event) => setEvidenceText(event.target.value)} placeholder="Mỗi dòng một URL ảnh hoặc tài liệu, tối đa 10 URL" className="mt-2 w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-violet-500" />

        <button type="submit" disabled={submitting || !validIds} className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-violet-600 px-6 text-sm font-black text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50">
          {submitting ? <LoaderCircle className="size-4 animate-spin" /> : null}
          {submitting ? "Đang gửi..." : "Gửi khiếu nại"}
        </button>
      </form>
    </div>
  );
}
