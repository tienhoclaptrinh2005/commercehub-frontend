"use client";

import {
  ArrowDownToLine,
  CircleAlert,
  Clock3,
  History,
  ReceiptText,
  RefreshCw,
  WalletCards,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import {
  useWalletSummary,
  useWalletTransactions,
} from "@/hooks/api/useWallet";
import { formatCurrency } from "@/lib/format";
import type { WalletTransaction } from "@/types";

const TRANSACTION_LABELS: Record<string, string> = {
  DEPOSIT: "Nạp tiền",
  ORDER_PAYMENT: "Thanh toán đơn hàng",
  ORDER_REFUND: "Hoàn tiền đơn hàng",
  DISPUTE_REFUND: "Hoàn tiền khiếu nại",
  SALE_HOLD: "Doanh thu đang tạm giữ",
  HOLD_RELEASE: "Giải phóng khoản tạm giữ",
  HOLD_RELEASE_NET: "Doanh thu đã quyết toán",
  CANCEL_HOLD: "Hủy khoản tạm giữ",
  WITHDRAW_PENDING: "Yêu cầu rút tiền",
  WITHDRAW_CANCEL: "Hoàn tiền yêu cầu rút",
};

function transactionStatus(transactionType: string) {
  if (transactionType === "WITHDRAW_PENDING") {
    return { label: "Đã ghi nhận", tone: "bg-amber-50 text-amber-700" };
  }
  if (transactionType === "WITHDRAW_CANCEL") {
    return { label: "Đã hoàn lại", tone: "bg-sky-50 text-sky-700" };
  }
  return { label: "Đã ghi nhận", tone: "bg-emerald-50 text-emerald-700" };
}

function formatTransactionTime(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function SellerWalletOverview() {
  const [page, setPage] = useState(1);
  const {
    wallet,
    isLoading: isWalletLoading,
    error: walletError,
    refresh: refreshWallet,
  } = useWalletSummary();
  const {
    result,
    isLoading: areTransactionsLoading,
    error: transactionsError,
    refresh: refreshTransactions,
  } = useWalletTransactions(page, 10);

  const refreshAll = () => {
    void refreshWallet();
    void refreshTransactions();
  };

  return (
    <div className="mx-auto w-full max-w-[1500px] space-y-6 p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-violet-700">
            Ví & tài chính
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-[-0.035em] text-slate-950 sm:text-3xl">
            Tài chính
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Quản lý dòng tiền, số dư và lịch sử giao dịch của gian hàng.
          </p>
        </div>

        <Link
          href="/seller/wallet/withdraw"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 text-sm font-bold text-white shadow-lg shadow-emerald-700/20 transition hover:-translate-y-0.5 hover:bg-emerald-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-600/20"
        >
          <ArrowDownToLine className="size-[18px]" />
          Yêu cầu rút tiền
        </Link>
      </div>

      {walletError || transactionsError ? (
        <div
          className="flex flex-col gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 sm:flex-row sm:items-center sm:justify-between"
          role="alert"
        >
          <span className="flex items-start gap-2">
            <CircleAlert className="mt-0.5 size-4 shrink-0" />
            {walletError || transactionsError}
          </span>
          <button
            type="button"
            onClick={refreshAll}
            className="inline-flex items-center gap-2 self-start font-bold hover:underline sm:self-auto"
          >
            <RefreshCw className="size-4" /> Tải lại
          </button>
        </div>
      ) : null}

      <section className="grid gap-4 md:grid-cols-3" aria-label="Tổng quan số dư">
        <BalanceCard
          label="Số dư khả dụng"
          value={wallet ? formatCurrency(wallet.availableBalance) : "—"}
          note={wallet?.status === "ACTIVE" ? "Ví đang hoạt động" : wallet?.status}
          icon={WalletCards}
          tone="bg-emerald-50 text-emerald-700"
          loading={isWalletLoading}
        />
        <BalanceCard
          label="Đang tạm giữ"
          value={wallet ? formatCurrency(wallet.holdBalance) : "—"}
          note="Tự động quyết toán theo quy trình T+7"
          icon={Clock3}
          tone="bg-rose-50 text-rose-600"
          loading={isWalletLoading}
        />
        <BalanceCard
          label="Đã rút về"
          value="—"
          note="Backend chưa có API tổng hợp tiền đã rút"
          icon={ArrowDownToLine}
          tone="bg-sky-50 text-sky-700"
          loading={false}
        />
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-5 sm:px-6">
          <div>
            <h2 className="flex items-center gap-2 font-bold text-slate-950">
              <History className="size-5 text-violet-600" />
              Lịch sử giao dịch
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              {result.totalElements} giao dịch được ghi nhận trong ví.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void refreshTransactions()}
            className="grid size-9 place-items-center rounded-xl border border-slate-200 text-slate-500 transition hover:border-violet-200 hover:bg-violet-50 hover:text-violet-700"
            aria-label="Tải lại lịch sử giao dịch"
          >
            <RefreshCw className={`size-4 ${areTransactionsLoading ? "animate-spin" : ""}`} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] border-collapse text-left text-sm">
            <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-6 py-3.5">Mã GD</th>
                <th className="px-4 py-3.5">Thời gian</th>
                <th className="px-4 py-3.5">Loại giao dịch</th>
                <th className="px-4 py-3.5 text-right">Số tiền</th>
                <th className="px-4 py-3.5 text-right">Số dư sau GD</th>
                <th className="px-4 py-3.5">Trạng thái</th>
                <th className="px-6 py-3.5">Nội dung</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {areTransactionsLoading && result.data.length === 0
                ? Array.from({ length: 5 }, (_, index) => (
                    <tr key={index}>
                      {Array.from({ length: 7 }, (__, cellIndex) => (
                        <td key={cellIndex} className="px-4 py-4">
                          <div className="h-4 animate-pulse rounded bg-slate-100" />
                        </td>
                      ))}
                    </tr>
                  ))
                : result.data.map((transaction) => (
                    <TransactionRow key={transaction.id} transaction={transaction} />
                  ))}
            </tbody>
          </table>
        </div>

        {!areTransactionsLoading && result.data.length === 0 ? (
          <div className="grid min-h-52 place-items-center border-t border-slate-100 px-6 py-10 text-center">
            <div>
              <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-slate-100 text-slate-400">
                <ReceiptText className="size-6" />
              </span>
              <p className="mt-3 text-sm font-semibold text-slate-600">
                Chưa có giao dịch nào.
              </p>
            </div>
          </div>
        ) : null}

        {result.totalPages > 1 ? (
          <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4 text-sm sm:px-6">
            <span className="text-slate-500">
              Trang {result.currentPage + 1}/{result.totalPages}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={page <= 1 || areTransactionsLoading}
                className="h-9 rounded-lg border border-slate-200 px-3 font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Trước
              </button>
              <button
                type="button"
                onClick={() => setPage((current) => current + 1)}
                disabled={page >= result.totalPages || areTransactionsLoading}
                className="h-9 rounded-lg border border-slate-200 px-3 font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Sau
              </button>
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}

function BalanceCard({
  label,
  value,
  note,
  icon: Icon,
  tone,
  loading,
}: {
  label: string;
  value: string;
  note?: string;
  icon: typeof WalletCards;
  tone: string;
  loading: boolean;
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <span className={`grid size-10 place-items-center rounded-xl ${tone}`}>
          <Icon className="size-5" />
        </span>
        <p className="text-sm font-semibold text-slate-600">{label}</p>
      </div>
      {loading ? (
        <div className="mt-5 h-8 w-32 animate-pulse rounded bg-slate-100" />
      ) : (
        <p className="mt-5 text-2xl font-extrabold tracking-[-0.04em] text-slate-950">
          {value}
        </p>
      )}
      <p className="mt-2 min-h-4 text-xs text-slate-400">{note || "\u00a0"}</p>
    </article>
  );
}

function TransactionRow({ transaction }: { transaction: WalletTransaction }) {
  const status = transactionStatus(transaction.transactionType);
  const isPositive = transaction.amount > 0;
  const typeLabel = TRANSACTION_LABELS[transaction.transactionType] || transaction.transactionType;

  return (
    <tr className="text-slate-600 transition hover:bg-slate-50/70">
      <td className="px-6 py-4 font-mono text-xs font-bold text-violet-700">
        #{transaction.id.slice(0, 8).toUpperCase()}
      </td>
      <td className="whitespace-nowrap px-4 py-4 text-xs">
        <time dateTime={transaction.createdAt}>{formatTransactionTime(transaction.createdAt)}</time>
      </td>
      <td className="px-4 py-4 font-semibold text-slate-700">{typeLabel}</td>
      <td
        className={`whitespace-nowrap px-4 py-4 text-right font-bold ${
          isPositive ? "text-emerald-700" : "text-rose-600"
        }`}
      >
        {isPositive ? "+" : ""}{formatCurrency(transaction.amount)}
      </td>
      <td className="whitespace-nowrap px-4 py-4 text-right font-semibold text-slate-800">
        {formatCurrency(transaction.balanceAfter)}
      </td>
      <td className="px-4 py-4">
        <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${status.tone}`}>
          {status.label}
        </span>
      </td>
      <td className="max-w-64 truncate px-6 py-4 text-xs text-slate-500">
        {transaction.description || typeLabel}
      </td>
    </tr>
  );
}
