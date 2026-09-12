"use client";

import { CircleAlert, Clock3, LoaderCircle, RefreshCw, Scale } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

import { getApiErrorMessage } from "@/services/api";
import { disputeService } from "@/services/dispute.service";
import { useOptionalSellerNotifications } from "@/hooks/api/useSellerNotifications";
import type { Dispute, PageResponse } from "@/types";

import { DisputeStatusBadge } from "./DisputeStatusBadge";

type Mode = "buyer" | "seller" | "admin";

const RESOLUTION_LABELS: Record<NonNullable<Dispute["resolution"]>, string> = {
  BUYER_WIN: "Buyer thắng",
  SELLER_WIN: "Seller thắng",
  BUYER_WITHDREW: "Buyer tự hủy",
  WARRANTY_ACCEPTED: "Buyer đã đồng ý bảo hành",
  BUYER_CONFIRMATION_TIMEOUT: "Buyer quá hạn xác nhận",
};

const EMPTY: PageResponse<Dispute> = {
  data: [], totalElements: 0, totalPages: 0, pageSize: 20, currentPage: 0,
};

export function DisputeListScreen({ mode }: { mode: Mode }) {
  const [page, setPage] = useState(0);
  const [status, setStatus] = useState("");
  const [result, setResult] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const sellerNotifications = useOptionalSellerNotifications();
  const markedNotificationRef = useRef(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const next = mode === "seller"
        ? await disputeService.listSeller(page)
        : mode === "admin"
          ? await disputeService.listAdmin(status, page)
          : await disputeService.listBuyer(page);
      setResult(next);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Không thể tải danh sách khiếu nại"));
    } finally {
      setLoading(false);
    }
  }, [mode, page, status]);

  useEffect(() => {
    let cancelled = false;
    const request = mode === "seller"
      ? disputeService.listSeller(page)
      : mode === "admin"
        ? disputeService.listAdmin(status, page)
        : disputeService.listBuyer(page);
    request
      .then((next) => { if (!cancelled) setResult(next); })
      .catch((requestError: unknown) => {
        if (!cancelled) setError(getApiErrorMessage(requestError, "Không thể tải danh sách khiếu nại"));
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [mode, page, status]);

  useEffect(() => {
    if (
      mode !== "seller"
      || markedNotificationRef.current
      || loading
      || error
      || !sellerNotifications
    ) return;

    markedNotificationRef.current = true;
    void sellerNotifications.markRead("DISPUTES")
      .catch(() => {
        markedNotificationRef.current = false;
        /* Không chặn danh sách khi chỉ cập nhật mốc đã xem thất bại. */
      });
  }, [error, loading, mode, sellerNotifications]);

  const baseHref = mode === "seller" ? "/seller/disputes" : mode === "admin" ? "/admin/disputes" : "/disputes";

  return (
    <div className="mx-auto w-full max-w-[1500px] space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-violet-700">Tranh chấp giao dịch</p>
          <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">Khiếu nại</h1>
          <p className="mt-2 text-sm text-slate-500">Theo dõi đúng tiến trình bảo hành, xác nhận và phán quyết.</p>
        </div>
        <div className="flex items-center gap-2">
          {mode === "admin" ? (
            <select
              value={status}
              onChange={(event) => { setLoading(true); setPage(0); setStatus(event.target.value); }}
              className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold outline-none focus:border-violet-500"
              aria-label="Lọc trạng thái tranh chấp"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="ADMIN_REVIEW">Chờ admin xử lý</option>
              <option value="RESOLVED">Đã giải quyết</option>
            </select>
          ) : null}
          <button type="button" onClick={() => void load()} className="grid size-11 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50" aria-label="Tải lại">
            <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {error ? <div className="flex gap-2 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700" role="alert"><CircleAlert className="size-5 shrink-0" />{error}</div> : null}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4 text-sm font-semibold text-slate-500">{result.totalElements} khiếu nại</div>
        {loading && result.data.length === 0 ? (
          <div className="flex min-h-56 items-center justify-center gap-2 text-sm text-slate-500"><LoaderCircle className="size-5 animate-spin" />Đang tải dữ liệu...</div>
        ) : result.data.length === 0 ? (
          <div className="grid min-h-56 place-items-center px-6 text-center"><div><Scale className="mx-auto size-10 text-slate-300" /><p className="mt-3 font-bold text-slate-700">Chưa có khiếu nại nào</p></div></div>
        ) : (
          <div className="divide-y divide-slate-100">
            {result.data.map((dispute) => (
              <Link key={dispute.id} href={`${baseHref}/${dispute.id}`} className="grid gap-3 px-5 py-5 transition hover:bg-slate-50 sm:grid-cols-[1fr_auto] sm:items-center">
                <div>
                  <div className="flex flex-wrap items-center gap-2"><span className="break-all font-black text-slate-900">{dispute.orderCode ? `Đơn hàng ${dispute.orderCode}` : "Mã đơn chưa cập nhật"}</span><DisputeStatusBadge status={dispute.status} /></div>
                  {dispute.status === "RESOLVED" && dispute.resolution ? <p className="mt-1 text-xs font-semibold text-slate-500">Kết quả: {RESOLUTION_LABELS[dispute.resolution]}</p> : null}
                  {mode === "seller" && dispute.status === "WAITING_BUYER_CONFIRMATION" ? (
                    <p className="mt-2 flex items-start gap-1.5 rounded-lg border border-sky-100 bg-sky-50 px-2.5 py-2 text-xs font-semibold leading-5 text-sky-800">
                      <Clock3 className="mt-0.5 size-3.5 shrink-0" />
                      Đã hoàn tất bảo hành. Nếu buyer không phản hồi trước {new Date(dispute.deadlineAt).toLocaleString("vi-VN")}, khiếu nại sẽ tự đóng và khoản tiền tiếp tục thời gian giữ T+7 còn lại.
                    </p>
                  ) : null}
                  <p className="mt-2 line-clamp-2 text-sm text-slate-600">{dispute.reason}</p>
                  <p className="mt-2 text-xs font-semibold text-slate-500">Gian hàng: {dispute.shopName || "Chưa cập nhật"}</p>
                  <p className="mt-1 text-xs text-slate-500">{dispute.productName || "Sản phẩm"} · Biến thể: {dispute.variantName || "Mặc định"}</p>
                  <p className="mt-1 text-xs text-slate-400">{new Date(dispute.createdAt).toLocaleString("vi-VN")}</p>
                </div>
                <span className="text-sm font-bold text-violet-700">Xem chi tiết →</span>
              </Link>
            ))}
          </div>
        )}
      </section>

      {result.totalPages > 1 ? (
        <div className="flex justify-end gap-2">
          <button type="button" disabled={result.currentPage === 0 || loading} onClick={() => { setLoading(true); setPage((value) => Math.max(0, value - 1)); }} className="h-10 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold disabled:opacity-40">Trang trước</button>
          <span className="grid h-10 place-items-center px-3 text-sm text-slate-500">{result.currentPage + 1}/{result.totalPages}</span>
          <button type="button" disabled={result.currentPage + 1 >= result.totalPages || loading} onClick={() => { setLoading(true); setPage((value) => value + 1); }} className="h-10 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold disabled:opacity-40">Trang sau</button>
        </div>
      ) : null}
    </div>
  );
}
