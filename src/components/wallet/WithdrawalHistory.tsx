"use client";

import { CircleAlert, Clock3, Landmark, LoaderCircle, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";

import { Pagination } from "@/components/common/Pagination";
import { useSellerNotifications } from "@/hooks/api/useSellerNotifications";
import { formatCurrency } from "@/lib/format";
import { getApiErrorMessage } from "@/services/api";
import { walletService } from "@/services/wallet.service";
import type { PageResponse, WithdrawalHistoryItem, WithdrawalStatus } from "@/types";

const PAGE_SIZE = 8;

const STATUS_META: Record<WithdrawalStatus, { label: string; description: string; className: string }> = {
  PENDING: {
    label: "Chờ Admin kiểm tra",
    description: "Số tiền đã được trừ khỏi số dư khả dụng.",
    className: "border-amber-200 bg-amber-50 text-amber-700",
  },
  APPROVED: {
    label: "Đã duyệt · Đang chuyển khoản",
    description: "Admin đã tiếp nhận và đang thực hiện chuyển khoản.",
    className: "border-sky-200 bg-sky-50 text-sky-700",
  },
  DONE: {
    label: "Đã chuyển tiền",
    description: "Admin đã xác nhận giao dịch ngân hàng hoàn tất.",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  REJECTED: {
    label: "Đã từ chối · Đã hoàn tiền",
    description: "Số tiền rút đã được hoàn lại vào ví.",
    className: "border-rose-200 bg-rose-50 text-rose-700",
  },
};

function maskAccountNumber(value: string) {
  if (value.length <= 4) return value;
  return `${"•".repeat(Math.min(6, value.length - 4))} ${value.slice(-4)}`;
}

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

export function WithdrawalHistory({ reloadKey }: { reloadKey: number }) {
  const { markRead } = useSellerNotifications();
  const [page, setPage] = useState(0);
  const [reload, setReload] = useState(0);
  const [state, setState] = useState<{
    key: string;
    data: PageResponse<WithdrawalHistoryItem> | null;
    error: string | null;
  }>({ key: "", data: null, error: null });
  const key = `${page}|${reload}|${reloadKey}`;

  useEffect(() => {
    let ignored = false;
    walletService.getSellerWithdrawals(page, PAGE_SIZE)
      .then((data) => {
        if (!ignored) setState({ key, data, error: null });
      })
      .catch((error) => {
        if (!ignored) setState({ key, data: null, error: getApiErrorMessage(error) });
      });
    return () => {
      ignored = true;
    };
  }, [key, page]);

  useEffect(() => {
    void markRead("WITHDRAWALS").catch(() => undefined);
  }, [markRead, reloadKey]);

  const current = state.key === key;

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-4 sm:px-6">
        <div>
          <h2 className="flex items-center gap-2 font-black text-slate-950">
            <Clock3 className="size-5 text-violet-600" /> Lịch sử yêu cầu rút tiền
          </h2>
          <p className="mt-1 text-xs text-slate-500">Theo dõi từng bước xử lý bằng dữ liệu thật từ hệ thống.</p>
        </div>
        <button
          type="button"
          onClick={() => setReload((value) => value + 1)}
          disabled={!current}
          className="grid size-9 place-items-center rounded-xl border border-slate-200 text-slate-500 hover:border-violet-300 hover:text-violet-700 disabled:opacity-50"
          aria-label="Làm mới lịch sử rút tiền"
        >
          <RefreshCw className={`size-4 ${current ? "" : "animate-spin"}`} />
        </button>
      </div>

      {!current ? (
        <div className="grid min-h-40 place-items-center text-sm font-semibold text-slate-500">
          <span className="flex items-center gap-2"><LoaderCircle className="size-5 animate-spin" />Đang tải lịch sử...</span>
        </div>
      ) : state.error || !state.data ? (
        <div className="grid min-h-40 place-items-center p-6 text-center text-sm text-rose-600">
          <div><CircleAlert className="mx-auto mb-2 size-6" />{state.error || "Không thể tải lịch sử rút tiền."}</div>
        </div>
      ) : state.data.data.length === 0 ? (
        <div className="grid min-h-40 place-items-center p-6 text-center text-sm text-slate-500">
          <div><Landmark className="mx-auto mb-2 size-7 text-slate-300" />Bạn chưa có yêu cầu rút tiền nào.</div>
        </div>
      ) : (
        <>
          <div className="divide-y divide-slate-100">
            {state.data.data.map((item) => {
              const meta = STATUS_META[item.status];
              return (
                <article key={item.id} className="grid gap-4 px-5 py-5 sm:px-6 lg:grid-cols-[1fr_auto]">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-sm font-black text-slate-950">WD-{String(item.id).padStart(6, "0")}</span>
                      <span className={`rounded-full border px-2.5 py-1 text-[11px] font-black ${meta.className}`}>{meta.label}</span>
                    </div>
                    <p className="mt-2 text-xs text-slate-500">{meta.description}</p>
                    <dl className="mt-3 grid gap-x-6 gap-y-2 text-xs sm:grid-cols-2 lg:grid-cols-3">
                      <div><dt className="text-slate-400">Ngân hàng</dt><dd className="mt-0.5 font-bold text-slate-700">{item.bankName}</dd></div>
                      <div><dt className="text-slate-400">Tài khoản</dt><dd className="mt-0.5 font-mono font-bold text-slate-700">{maskAccountNumber(item.accountNumber)}</dd></div>
                      <div><dt className="text-slate-400">Chủ tài khoản</dt><dd className="mt-0.5 font-bold text-slate-700">{item.accountName}</dd></div>
                      <div><dt className="text-slate-400">Tạo yêu cầu</dt><dd className="mt-0.5 font-semibold text-slate-700">{formatDate(item.createdAt)}</dd></div>
                      <div><dt className="text-slate-400">Admin tiếp nhận</dt><dd className="mt-0.5 font-semibold text-slate-700">{formatDate(item.approvedAt)}</dd></div>
                      <div><dt className="text-slate-400">Hoàn tất xử lý</dt><dd className="mt-0.5 font-semibold text-slate-700">{formatDate(item.processedAt)}</dd></div>
                    </dl>
                    {item.adminNote ? <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600"><b>Ghi chú Admin:</b> {item.adminNote}</p> : null}
                    {item.transferReference ? <p className="mt-2 text-xs text-slate-500"><b>Mã tham chiếu:</b> <span className="font-mono">{item.transferReference}</span></p> : null}
                  </div>
                  <p className="text-left text-xl font-black text-slate-950 lg:text-right">{formatCurrency(item.amount)}</p>
                </article>
              );
            })}
          </div>
          <div className="border-t border-slate-100 px-5 pb-5">
            <Pagination currentPage={state.data.currentPage} totalPages={state.data.totalPages} onPageChange={setPage} />
          </div>
        </>
      )}
    </section>
  );
}
