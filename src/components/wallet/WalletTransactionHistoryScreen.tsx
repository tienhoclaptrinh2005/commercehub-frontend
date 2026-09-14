"use client";

import {
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  CircleAlert,
  History,
  LoaderCircle,
  ReceiptText,
  RefreshCw,
  WalletCards,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { SlicePagination } from "@/components/common/SlicePagination";
import { useWalletSummary, useWalletTransactions } from "@/hooks/api/useWallet";
import { useAuth } from "@/hooks/auth/useAuth";
import { formatCurrency } from "@/lib/format";
import type { WalletTransaction, WalletTransactionCategory } from "@/types";

const FILTERS: Array<{ value: WalletTransactionCategory; label: string }> = [
  { value: "ALL", label: "Tất cả" },
  { value: "DEPOSIT", label: "Nạp tiền" },
  { value: "PAYMENT", label: "Thanh toán" },
  { value: "WITHDRAWAL", label: "Rút tiền" },
  { value: "REFUND", label: "Hoàn tiền" },
  { value: "SALE", label: "Bán hàng" },
  { value: "FEE", label: "Phí dịch vụ" },
  { value: "ADJUSTMENT", label: "Điều chỉnh" },
];

const TYPE_LABELS: Record<string, string> = {
  DEPOSIT: "Nạp tiền",
  ORDER_PAYMENT: "Thanh toán",
  ORDER_REFUND: "Hoàn tiền",
  DISPUTE_REFUND: "Hoàn tiền khiếu nại",
  SALE_HOLD: "Tiền bán đang giữ",
  HOLD_RELEASE: "Giải phóng tiền giữ",
  HOLD_RELEASE_NET: "Doanh thu nhận được",
  CANCEL_HOLD: "Hủy tiền tạm giữ",
  WITHDRAW_PENDING: "Rút tiền",
  WITHDRAW_DONE: "Đã rút tiền",
  WITHDRAW_CANCEL: "Hoàn yêu cầu rút",
  REFUND: "Hoàn tiền",
  PLATFORM_FEE: "Phí dịch vụ",
  ADMIN_ADJUST: "Điều chỉnh số dư",
};

const TYPE_TONES: Record<string, string> = {
  DEPOSIT: "border-emerald-200 bg-emerald-50 text-emerald-700",
  ORDER_PAYMENT: "border-sky-200 bg-sky-50 text-sky-700",
  ORDER_REFUND: "border-cyan-200 bg-cyan-50 text-cyan-700",
  DISPUTE_REFUND: "border-violet-200 bg-violet-50 text-violet-700",
  SALE_HOLD: "border-indigo-200 bg-indigo-50 text-indigo-700",
  HOLD_RELEASE: "border-violet-200 bg-violet-50 text-violet-700",
  HOLD_RELEASE_NET: "border-violet-200 bg-violet-50 text-violet-700",
  CANCEL_HOLD: "border-slate-200 bg-slate-50 text-slate-600",
  WITHDRAW_PENDING: "border-amber-200 bg-amber-50 text-amber-700",
  WITHDRAW_DONE: "border-emerald-200 bg-emerald-50 text-emerald-700",
  WITHDRAW_CANCEL: "border-cyan-200 bg-cyan-50 text-cyan-700",
  REFUND: "border-cyan-200 bg-cyan-50 text-cyan-700",
  PLATFORM_FEE: "border-rose-200 bg-rose-50 text-rose-700",
  ADMIN_ADJUST: "border-slate-200 bg-slate-50 text-slate-700",
};

function formatDateTime(value: string) {
  const date = new Date(value);
  return {
    date: new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date),
    time: new Intl.DateTimeFormat("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date),
  };
}

function balanceLabel(value: string) {
  return value === "HOLD" ? "Tiền tạm giữ" : "Số dư khả dụng";
}

function orderHref(transaction: WalletTransaction) {
  if (
    transaction.referenceCode &&
    ["ORDER_PAYMENT", "ORDER_REFUND"].includes(transaction.transactionType)
  ) {
    return `/orders/${encodeURIComponent(transaction.referenceCode)}`;
  }
  return null;
}

export function WalletTransactionHistoryScreen() {
  const router = useRouter();
  const { user, isHydrated } = useAuth();
  const [category, setCategory] = useState<WalletTransactionCategory>("ALL");
  const [page, setPage] = useState(1);
  const { wallet, isLoading: walletLoading } = useWalletSummary();
  const { result, isLoading, error, refresh } = useWalletTransactions(page, 15, category);

  useEffect(() => {
    if (isHydrated && !user) router.replace("/login");
  }, [isHydrated, router, user]);

  if (!isHydrated || !user) {
    return (
      <div className="grid min-h-[420px] place-items-center">
        <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500">
          <LoaderCircle className="size-5 animate-spin text-emerald-600" />
          Đang kiểm tra tài khoản...
        </span>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 py-8 sm:px-6 sm:py-10">
      <nav className="flex items-center gap-2 text-sm" aria-label="Breadcrumb">
        <Link href="/" className="font-semibold text-emerald-700 hover:underline">Trang chủ</Link>
        <ArrowRight className="size-3.5 text-slate-400" />
        <span className="text-slate-500">Biến động số dư</span>
      </nav>

      <header className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl border border-violet-200 bg-violet-50 text-violet-700">
            <History className="size-6" />
          </span>
          <div>
            <h1 className="text-3xl font-black tracking-[-0.04em] text-slate-950 sm:text-4xl">Biến động số dư</h1>
            <p className="mt-2 text-sm text-slate-500">Chi tiết tiền nạp, thanh toán, hoàn tiền, rút tiền và doanh thu bán hàng.</p>
          </div>
        </div>
        <Link href="/wallet/deposit" className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-black text-slate-700 shadow-sm transition hover:border-emerald-300 hover:text-emerald-700">
          <WalletCards className="size-4" />
          Số dư: {walletLoading || !wallet ? "—" : formatCurrency(Number(wallet.availableBalance))}
        </Link>
      </header>

      <section className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex gap-1 overflow-x-auto border-b border-slate-100 p-2 sm:p-3" role="tablist" aria-label="Phân loại giao dịch">
          {FILTERS.map((filter) => (
            <button
              key={filter.value}
              type="button"
              role="tab"
              aria-selected={category === filter.value}
              onClick={() => {
                setCategory(filter.value);
                setPage(1);
              }}
              className={`h-10 shrink-0 rounded-xl px-4 text-xs font-black uppercase tracking-wide transition ${category === filter.value ? "bg-violet-100 text-violet-800 shadow-sm" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"}`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
          <p className="text-sm text-slate-500">Dữ liệu giao dịch thực tế trong ví.</p>
          <button type="button" onClick={() => void refresh()} disabled={isLoading} className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50">
            <RefreshCw className={`size-3.5 ${isLoading ? "animate-spin" : ""}`} /> Làm mới
          </button>
        </div>

        {error ? (
          <div className="m-5 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-700" role="alert">
            <CircleAlert className="mt-0.5 size-4 shrink-0" /> {error}
          </div>
        ) : null}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1080px] border-collapse text-left text-sm">
            <thead className="bg-slate-50 text-[11px] font-black uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-6 py-4">Mã giao dịch</th>
                <th className="px-4 py-4">Thời gian</th>
                <th className="px-4 py-4">Phân loại</th>
                <th className="px-4 py-4">Nội dung</th>
                <th className="px-4 py-4">Loại số dư</th>
                <th className="px-4 py-4 text-right">Số tiền</th>
                <th className="px-6 py-4 text-right">Số dư sau GD</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading && result.data.length === 0
                ? Array.from({ length: 6 }, (_, row) => (
                    <tr key={row}>{Array.from({ length: 7 }, (__, cell) => <td key={cell} className="px-4 py-5"><div className="h-4 animate-pulse rounded bg-slate-100" /></td>)}</tr>
                  ))
                : result.data.map((transaction) => <TransactionRow key={transaction.id} transaction={transaction} />)}
            </tbody>
          </table>
        </div>

        {!isLoading && !error && result.data.length === 0 ? (
          <div className="grid min-h-64 place-items-center px-6 py-12 text-center">
            <div><ReceiptText className="mx-auto size-10 text-slate-300" /><p className="mt-4 font-bold text-slate-700">Chưa có giao dịch thuộc phân loại này.</p></div>
          </div>
        ) : null}

        <SlicePagination
          currentPage={page}
          pageNumbers={result.pageNumbers}
          hasNext={result.hasNext}
          isLoading={isLoading}
          onPageChange={setPage}
        />
      </section>
    </div>
  );
}

function TransactionRow({ transaction }: { transaction: WalletTransaction }) {
  const dateTime = formatDateTime(transaction.createdAt);
  const isPositive = Number(transaction.amount) > 0;
  const isStatusEvent = transaction.transactionType === "WITHDRAW_DONE";
  const href = orderHref(transaction);
  const description = transaction.description || TYPE_LABELS[transaction.transactionType] || transaction.transactionType;

  return (
    <tr className="text-slate-600 transition hover:bg-slate-50/70">
      <td className="px-6 py-5 font-mono text-xs font-bold text-violet-700">#{transaction.id.slice(0, 8).toUpperCase()}</td>
      <td className="whitespace-nowrap px-4 py-5"><time dateTime={transaction.createdAt} className="font-semibold text-slate-800">{dateTime.date}</time><span className="mt-1 block text-xs text-slate-400">{dateTime.time}</span></td>
      <td className="px-4 py-5"><span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-black ${TYPE_TONES[transaction.transactionType] || "border-slate-200 bg-slate-50 text-slate-600"}`}>{TYPE_LABELS[transaction.transactionType] || transaction.transactionType}</span></td>
      <td className="max-w-[430px] px-4 py-5 text-sm leading-5 text-slate-700">{href ? <Link href={href} className="font-semibold transition hover:text-emerald-700 hover:underline">{description}</Link> : description}{transaction.referenceCode ? <span className="mt-1 block text-xs text-slate-400">Tham chiếu: {transaction.referenceCode}</span> : null}</td>
      <td className="whitespace-nowrap px-4 py-5 text-xs font-semibold text-slate-500">{balanceLabel(transaction.balanceType)}</td>
      <td className={`whitespace-nowrap px-4 py-5 text-right font-black ${isStatusEvent ? "text-slate-500" : isPositive ? "text-emerald-700" : "text-rose-600"}`}><span className="inline-flex items-center gap-1">{isStatusEvent ? "Không đổi số dư" : <>{isPositive ? <ArrowDownLeft className="size-3.5" /> : <ArrowUpRight className="size-3.5" />}{isPositive ? "+" : ""}{formatCurrency(Number(transaction.amount))}</>}</span></td>
      <td className="whitespace-nowrap px-6 py-5 text-right font-bold text-slate-900">{formatCurrency(Number(transaction.balanceAfter))}</td>
    </tr>
  );
}
