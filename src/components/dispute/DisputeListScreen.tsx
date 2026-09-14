"use client";

import { CircleAlert, Clock3, LoaderCircle, RefreshCw, Scale, Search, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { FormEvent, useCallback, useEffect, useRef, useState } from "react";

import { useOptionalSellerNotifications } from "@/hooks/api/useSellerNotifications";
import { getApiErrorMessage } from "@/services/api";
import { disputeService } from "@/services/dispute.service";
import type { AdminDisputeSummary, Dispute, DisputeStatus, PageResponse } from "@/types";

import { DisputeStatusBadge } from "./DisputeStatusBadge";

type Mode = "buyer" | "seller" | "admin";
type AdminScope = "QUEUE" | "ALL";

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

const EMPTY_SUMMARY: AdminDisputeSummary = { pendingCount: 0, overdueCount: 0 };

export function DisputeListScreen({ mode }: { mode: Mode }) {
  const [page, setPage] = useState(0);
  const [scope, setScope] = useState<AdminScope>("QUEUE");
  const [status, setStatus] = useState<"" | DisputeStatus>("");
  const [searchInput, setSearchInput] = useState("");
  const [keyword, setKeyword] = useState("");
  const [overdueOnly, setOverdueOnly] = useState(false);
  const [summary, setSummary] = useState(EMPTY_SUMMARY);
  const [result, setResult] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const sellerNotifications = useOptionalSellerNotifications();
  const markedNotificationRef = useRef(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (mode === "admin") {
        const [next, nextSummary] = await Promise.all([
          disputeService.listAdmin({
            scope,
            status: scope === "ALL" && status ? status : undefined,
            keyword,
            overdue: overdueOnly,
            page,
          }),
          disputeService.getAdminSummary(),
        ]);
        setResult(next);
        setSummary(nextSummary);
      } else {
        const next = mode === "seller"
          ? await disputeService.listSeller(page)
          : await disputeService.listBuyer(page);
        setResult(next);
      }
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, "Không thể tải danh sách khiếu nại"));
    } finally {
      setLoading(false);
    }
  }, [keyword, mode, overdueOnly, page, scope, status]);

  useEffect(() => {
    let cancelled = false;
    const request = mode === "admin"
      ? Promise.all([
          disputeService.listAdmin({
            scope,
            status: scope === "ALL" && status ? status : undefined,
            keyword,
            overdue: overdueOnly,
            page,
          }),
          disputeService.getAdminSummary(),
        ]).then(([next, nextSummary]) => ({ next, nextSummary }))
      : (mode === "seller" ? disputeService.listSeller(page) : disputeService.listBuyer(page))
          .then((next) => ({ next, nextSummary: null }));

    request
      .then(({ next, nextSummary }) => {
        if (cancelled) return;
        setResult(next);
        if (nextSummary) setSummary(nextSummary);
      })
      .catch((requestError: unknown) => {
        if (!cancelled) setError(getApiErrorMessage(requestError, "Không thể tải danh sách khiếu nại"));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [keyword, mode, overdueOnly, page, scope, status]);

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

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setPage(0);
    setKeyword(searchInput.trim());
  }

  function selectQueue(overdue: boolean) {
    setLoading(true);
    setPage(0);
    setScope("QUEUE");
    setOverdueOnly(overdue);
  }

  function selectAll() {
    setLoading(true);
    setPage(0);
    setScope("ALL");
    setOverdueOnly(false);
  }

  const baseHref = mode === "seller"
    ? "/seller/disputes"
    : mode === "admin"
      ? "/admin/disputes"
      : "/disputes";

  return (
    <div className="mx-auto w-full max-w-[1500px] space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-violet-700">Tranh chấp giao dịch</p>
          <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl">Khiếu nại</h1>
          <p className="mt-2 text-sm text-slate-500">
            {mode === "admin"
              ? "Ưu tiên các hồ sơ đã chuyển cấp và đang chờ Admin phán quyết."
              : "Theo dõi đúng tiến trình bảo hành, xác nhận và phán quyết."}
          </p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          className="grid size-11 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
          aria-label="Tải lại"
        >
          <RefreshCw className={`size-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {mode === "admin" ? (
        <section className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => selectQueue(false)}
              className={`rounded-2xl border p-4 text-left shadow-sm transition ${scope === "QUEUE" && !overdueOnly ? "border-violet-400 bg-violet-50 ring-2 ring-violet-100" : "border-slate-200 bg-white hover:border-violet-200"}`}
            >
              <div className="flex items-center justify-between gap-3">
                <div><p className="text-xs font-black uppercase tracking-wide text-slate-500">Cần xử lý</p><p className="mt-1 text-2xl font-black text-slate-950">{summary.pendingCount}</p></div>
                <span className="grid size-10 place-items-center rounded-xl bg-rose-100 text-rose-600"><Scale className="size-5" /></span>
              </div>
              <p className="mt-2 text-xs text-slate-500">Chỉ các hồ sơ ở trạng thái ADMIN_REVIEW</p>
            </button>
            <button
              type="button"
              onClick={() => selectQueue(true)}
              className={`rounded-2xl border p-4 text-left shadow-sm transition ${overdueOnly ? "border-rose-400 bg-rose-50 ring-2 ring-rose-100" : "border-slate-200 bg-white hover:border-rose-200"}`}
            >
              <div className="flex items-center justify-between gap-3">
                <div><p className="text-xs font-black uppercase tracking-wide text-rose-700">Quá hạn 72 giờ</p><p className="mt-1 text-2xl font-black text-rose-700">{summary.overdueCount}</p></div>
                <span className="grid size-10 place-items-center rounded-xl bg-rose-100 text-rose-600"><ShieldAlert className="size-5" /></span>
              </div>
              <p className="mt-2 text-xs text-slate-500">Cảnh báo để ưu tiên xử lý, hệ thống không tự phán quyết</p>
            </button>
          </div>

          <div className="flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
            <button type="button" onClick={() => selectQueue(false)} className={`h-10 rounded-xl px-4 text-sm font-black ${scope === "QUEUE" ? "bg-violet-600 text-white" : "text-slate-600 hover:bg-slate-50"}`}>Cần xử lý</button>
            <button type="button" onClick={selectAll} className={`h-10 rounded-xl px-4 text-sm font-black ${scope === "ALL" ? "bg-violet-600 text-white" : "text-slate-600 hover:bg-slate-50"}`}>Toàn bộ hồ sơ</button>
            <form onSubmit={submitSearch} className="flex min-w-[260px] flex-1 gap-2 sm:ml-auto">
              <label className="relative min-w-0 flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  maxLength={50}
                  placeholder="Tìm nhanh theo mã đơn..."
                  className="h-10 w-full rounded-xl border border-slate-200 pl-9 pr-3 text-sm outline-none focus:border-violet-500"
                />
              </label>
              <button type="submit" className="h-10 rounded-xl bg-slate-900 px-4 text-sm font-bold text-white hover:bg-slate-700">Tìm</button>
            </form>
            {scope === "ALL" ? (
              <select
                value={status}
                onChange={(event) => { setLoading(true); setPage(0); setStatus(event.target.value as "" | DisputeStatus); }}
                className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold outline-none focus:border-violet-500"
                aria-label="Lọc trạng thái tranh chấp"
              >
                <option value="">Tất cả trạng thái</option>
                <option value="OPEN">Chờ Seller phản hồi</option>
                <option value="WARRANTY_IN_PROGRESS">Đang bảo hành</option>
                <option value="WAITING_BUYER_CONFIRMATION">Chờ Buyer xác nhận</option>
                <option value="ADMIN_REVIEW">Chờ Admin xử lý</option>
                <option value="RESOLVED">Đã giải quyết</option>
              </select>
            ) : null}
          </div>
        </section>
      ) : null}

      {error ? <div className="flex gap-2 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700" role="alert"><CircleAlert className="size-5 shrink-0" />{error}</div> : null}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4 text-sm font-semibold text-slate-500">
          {result.totalElements} {mode === "admin" && scope === "QUEUE" ? "hồ sơ cần xử lý" : "khiếu nại"}
          {keyword ? <span> · mã đơn chứa “{keyword}”</span> : null}
        </div>
        {loading && result.data.length === 0 ? (
          <div className="flex min-h-56 items-center justify-center gap-2 text-sm text-slate-500"><LoaderCircle className="size-5 animate-spin" />Đang tải dữ liệu...</div>
        ) : result.data.length === 0 ? (
          <div className="grid min-h-56 place-items-center px-6 text-center"><div><Scale className="mx-auto size-10 text-slate-300" /><p className="mt-3 font-bold text-slate-700">Không có hồ sơ phù hợp</p></div></div>
        ) : (
          <div className="divide-y divide-slate-100">
            {result.data.map((dispute) => {
              const overdue = dispute.adminOverdue;
              return (
                <article key={dispute.id} className="grid gap-3 px-5 py-5 transition hover:bg-slate-50 sm:grid-cols-[1fr_auto] sm:items-center">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="break-all font-black text-slate-900">{dispute.orderCode ? `Đơn hàng ${dispute.orderCode}` : "Mã đơn chưa cập nhật"}</span>
                      <DisputeStatusBadge status={dispute.status} />
                      {overdue ? <span className="rounded-full bg-rose-100 px-2.5 py-1 text-[11px] font-black text-rose-700">Quá hạn 72 giờ</span> : null}
                    </div>
                    {dispute.status === "RESOLVED" && dispute.resolution ? <p className="mt-1 text-xs font-semibold text-slate-500">Kết quả: {RESOLUTION_LABELS[dispute.resolution]}</p> : null}
                    {mode === "seller" && dispute.status === "WAITING_BUYER_CONFIRMATION" ? (
                      <p className="mt-2 flex items-start gap-1.5 rounded-lg border border-sky-100 bg-sky-50 px-2.5 py-2 text-xs font-semibold leading-5 text-sky-800">
                        <Clock3 className="mt-0.5 size-3.5 shrink-0" />
                        Đã hoàn tất bảo hành. Nếu buyer không phản hồi trước {new Date(dispute.deadlineAt).toLocaleString("vi-VN")}, khiếu nại sẽ tự đóng và khoản tiền tiếp tục thời gian giữ T+7 còn lại.
                      </p>
                    ) : null}
                    <p className="mt-2 line-clamp-2 text-sm text-slate-600">{dispute.reason}</p>
                    {mode === "admin" ? (
                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs font-semibold">
                        <UserProfileLink label="Buyer" username={dispute.buyerUsername} />
                        <UserProfileLink label="Seller" username={dispute.sellerUsername} />
                      </div>
                    ) : <p className="mt-2 text-xs font-semibold text-slate-500">Gian hàng: {dispute.shopName || "Chưa cập nhật"}</p>}
                    <p className="mt-1 text-xs text-slate-500">{dispute.productName || "Sản phẩm"} · Biến thể: {dispute.variantName || "Mặc định"}</p>
                    <p className="mt-1 text-xs text-slate-400">{new Date(dispute.createdAt).toLocaleString("vi-VN")}</p>
                  </div>
                  <Link href={`${baseHref}/${dispute.id}`} className="text-sm font-bold text-violet-700 hover:text-violet-900">Xem chi tiết →</Link>
                </article>
              );
            })}
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

function UserProfileLink({ label, username }: { label: string; username: string | null }) {
  if (!username) return <span className="text-slate-400">{label}: chưa cập nhật username</span>;
  return <Link href={`/users/${encodeURIComponent(username)}`} className="text-violet-700 hover:underline">{label}: @{username}</Link>;
}
