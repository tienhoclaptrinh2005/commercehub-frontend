"use client";

import {
  BadgeDollarSign,
  Banknote,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  CircleCheckBig,
  Clock3,
  HandCoins,
  Info,
  ReceiptText,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  WalletCards,
} from "lucide-react";
import Link from "next/link";
import { type ReactNode, useEffect, useMemo, useState } from "react";

import { formatCurrency } from "@/lib/format";
import { getApiErrorMessage } from "@/services/api";
import { sellerFeeService } from "@/services/seller-fee.service";
import type {
  PageResponse,
  SellerFeeConfig,
  SellerFeeLedger,
  SellerFeeSummary,
} from "@/types";

const PAGE_SIZE = 10;

const EMPTY_HISTORY: PageResponse<SellerFeeLedger> = {
  currentPage: 0,
  pageSize: PAGE_SIZE,
  totalPages: 0,
  totalElements: 0,
  data: [],
};

function currentMonthValue() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function parseMonth(value: string) {
  const [year, month] = value.split("-").map(Number);
  return { year, month };
}

function formatPercent(rate: number) {
  return new Intl.NumberFormat("vi-VN", {
    maximumFractionDigits: 2,
  }).format(rate * 100);
}

function formatDateTime(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function monthLabel(value: string) {
  const { year, month } = parseMonth(value);
  return `tháng ${month}/${year}`;
}

function visiblePages(currentPage: number, totalPages: number) {
  if (totalPages <= 0) return [];
  const first = Math.min(Math.max(0, currentPage - 1), Math.max(0, totalPages - 3));
  return Array.from({ length: Math.min(3, totalPages - first) }, (_, index) => first + index);
}

const LEDGER_STATUS = {
  PENDING: {
    label: "Đang tạm giữ",
    className: "bg-amber-50 text-amber-700 ring-amber-600/10",
  },
  COLLECTED: {
    label: "Đã quyết toán",
    className: "bg-emerald-50 text-emerald-700 ring-emerald-600/10",
  },
  CANCELLED: {
    label: "Đã hủy",
    className: "bg-slate-100 text-slate-600 ring-slate-500/10",
  },
} as const;

export function SellerFeesScreen() {
  const [selectedMonth, setSelectedMonth] = useState(currentMonthValue);
  const [page, setPage] = useState(0);
  const [reloadKey, setReloadKey] = useState(0);
  const { year, month } = useMemo(() => parseMonth(selectedMonth), [selectedMonth]);
  const requestKey = `${year}-${month}-${page}-${reloadKey}`;
  const [state, setState] = useState<{
    requestKey: string;
    config: SellerFeeConfig | null;
    summary: SellerFeeSummary | null;
    history: PageResponse<SellerFeeLedger>;
    error: string | null;
  }>({
    requestKey: "",
    config: null,
    summary: null,
    history: EMPTY_HISTORY,
    error: null,
  });
  const requestIsCurrent = state.requestKey === requestKey;
  const isLoading = !requestIsCurrent;
  const error = requestIsCurrent ? state.error : null;
  const { config, summary, history } = state;

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      sellerFeeService.getCurrentConfig(),
      sellerFeeService.getMonthlySummary(year, month),
      sellerFeeService.getFeeHistory(page, PAGE_SIZE),
    ])
      .then(([currentConfig, monthlySummary, feeHistory]) => {
        if (cancelled) return;
        setState({
          requestKey,
          config: currentConfig,
          summary: monthlySummary,
          history: feeHistory,
          error: null,
        });
      })
      .catch((requestError: unknown) => {
        if (!cancelled) {
          setState((current) => ({
            ...current,
            requestKey,
            error: getApiErrorMessage(requestError, "Không thể tải dữ liệu phí sàn"),
          }));
        }
      });

    return () => {
      cancelled = true;
    };
  }, [month, page, requestKey, year]);

  const pageNumbers = visiblePages(history.currentPage, history.totalPages);

  function changeMonth(value: string) {
    if (!value) return;
    setSelectedMonth(value);
    setPage(0);
  }

  return (
    <div className="mx-auto w-full max-w-[1500px] space-y-5 p-4 sm:p-6 lg:p-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.15em] text-violet-700">
            Chính sách & đối soát
          </p>
          <h1 className="mt-2 text-2xl font-black tracking-[-0.035em] text-slate-950 sm:text-3xl">
            Phí sàn
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Theo dõi mức phí đang áp dụng và phí phát sinh thực tế của gian hàng.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setReloadKey((current) => current + 1)}
          disabled={isLoading}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 shadow-sm transition hover:border-violet-300 hover:text-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw className={`size-4 ${isLoading ? "animate-spin" : ""}`} />
          Làm mới
        </button>
      </header>

      {error ? (
        <div className="flex flex-col gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 sm:flex-row sm:items-center sm:justify-between" role="alert">
          <span className="flex items-start gap-2">
            <CircleAlert className="mt-0.5 size-4 shrink-0" />
            {error}
          </span>
          <button type="button" onClick={() => setReloadKey((current) => current + 1)} className="inline-flex items-center gap-2 self-start font-black hover:underline sm:self-auto">
            <RotateCcw className="size-4" /> Thử lại
          </button>
        </div>
      ) : null}

      <section className="grid overflow-hidden rounded-2xl bg-gradient-to-br from-violet-700 via-violet-600 to-indigo-700 text-white shadow-xl shadow-violet-900/10 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="flex min-h-56 flex-col justify-between border-white/15 p-6 lg:border-r lg:p-7">
          <div className="flex items-center gap-2 text-sm font-bold text-violet-100">
            <span className="grid size-9 place-items-center rounded-xl bg-white/15">
              <BadgeDollarSign className="size-5" />
            </span>
            Mức phí đang áp dụng
          </div>
          {isLoading && !config ? (
            <div className="h-16 w-40 animate-pulse rounded-xl bg-white/15" />
          ) : (
            <div>
              <p className="text-5xl font-black tracking-[-0.06em] sm:text-6xl">
                {config ? `${formatPercent(config.feeRate)}%` : "—"}
              </p>
              <p className="mt-2 text-sm text-violet-100">tính trên giá trị của từng dòng sản phẩm</p>
            </div>
          )}
          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-emerald-300/20 px-3 py-1.5 text-xs font-black text-emerald-100 ring-1 ring-inset ring-emerald-200/20">
            <CircleCheckBig className="size-4" /> Cấu hình đang hoạt động
          </span>
        </div>

        <div className="grid gap-4 bg-white/5 p-6 sm:grid-cols-2 lg:p-7">
          <PolicyItem
            label="Phí tối thiểu"
            value={config ? formatCurrency(config.minFeeAmount) : "—"}
            note={config?.minFeeAmount ? "Áp dụng nếu phí phần trăm thấp hơn" : "Không áp dụng mức phí tối thiểu"}
            icon={HandCoins}
          />
          <PolicyItem
            label="Phí tối đa"
            value={config?.maxFeeAmount != null ? formatCurrency(config.maxFeeAmount) : "Không giới hạn"}
            note="Phí thực tế không bao giờ vượt giá bán"
            icon={ShieldCheck}
          />
          <PolicyItem
            label="Hiệu lực từ"
            value={formatDateTime(config?.effectiveFrom ?? null)}
            note={config?.description || "Cấu hình phí hiện hành của hệ thống"}
            icon={CalendarDays}
          />
          <PolicyItem
            label="Cách làm tròn"
            value="Làm tròn lên 1 đồng"
            note="Phí và tiền thực nhận luôn khớp giá trị đơn"
            icon={Info}
          />
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="flex items-center gap-2 font-black text-slate-950">
              <Banknote className="size-5 text-violet-600" /> Tổng hợp {monthLabel(selectedMonth)}
            </h2>
            <p className="mt-1 text-xs text-slate-500">Số liệu đã được hệ thống quyết toán, không dùng dữ liệu mẫu.</p>
          </div>
          <label className="flex items-center gap-2 text-xs font-bold text-slate-600">
            Chọn tháng
            <input
              type="month"
              value={selectedMonth}
              max={currentMonthValue()}
              onChange={(event) => changeMonth(event.target.value)}
              className="h-10 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-bold text-slate-700 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
            />
          </label>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard label="Doanh số quyết toán" value={summary ? formatCurrency(summary.totalSales) : "—"} icon={ReceiptText} tone="bg-sky-50 text-sky-700" loading={isLoading} />
          <SummaryCard label="Phí sàn đã thu" value={summary ? formatCurrency(summary.totalFee) : "—"} icon={BadgeDollarSign} tone="bg-rose-50 text-rose-600" loading={isLoading} />
          <SummaryCard label="Shop thực nhận" value={summary ? formatCurrency(summary.totalNet) : "—"} icon={WalletCards} tone="bg-emerald-50 text-emerald-700" loading={isLoading} />
          <SummaryCard label="Giá trị đã hoàn" value={summary ? formatCurrency(summary.totalRefunded) : "—"} icon={RotateCcw} tone="bg-amber-50 text-amber-700" loading={isLoading} />
        </div>
        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 border-t border-slate-100 pt-4 text-xs text-slate-500">
          <span><strong className="text-slate-800">{summary?.orderCount ?? 0}</strong> dòng đơn đã quyết toán</span>
          <span><strong className="text-slate-800">{summary?.disputeCount ?? 0}</strong> khiếu nại/hoàn tiền</span>
          <span>Cập nhật gần nhất: <strong className="text-slate-800">{formatDateTime(summary?.updatedAt ?? null)}</strong></span>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
          <h2 className="flex items-center gap-2 font-black text-slate-950">
            <ReceiptText className="size-5 text-violet-600" /> Lịch sử phí theo đơn
          </h2>
          <p className="mt-1 text-xs text-slate-500">Tỷ lệ ở mỗi dòng là mức đã được chốt tại thời điểm đặt hàng.</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] border-collapse text-left text-sm">
            <thead className="bg-slate-50 text-[11px] font-black uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-6 py-3.5">Đơn hàng</th>
                <th className="px-4 py-3.5">Ngày phát sinh</th>
                <th className="px-4 py-3.5 text-right">Giá trị bán</th>
                <th className="px-4 py-3.5 text-right">Tỷ lệ</th>
                <th className="px-4 py-3.5 text-right">Phí sàn</th>
                <th className="px-4 py-3.5 text-right">Thực nhận</th>
                <th className="px-6 py-3.5">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading && history.data.length === 0
                ? Array.from({ length: 5 }, (_, index) => <HistorySkeleton key={index} />)
                : history.data.map((ledger) => <FeeHistoryRow key={ledger.id} ledger={ledger} />)}
            </tbody>
          </table>
        </div>

        {!isLoading && history.data.length === 0 ? (
          <div className="grid min-h-48 place-items-center border-t border-slate-100 px-6 py-10 text-center">
            <div>
              <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-slate-100 text-slate-400"><ReceiptText className="size-6" /></span>
              <p className="mt-3 text-sm font-bold text-slate-700">Chưa phát sinh phí sàn</p>
              <p className="mt-1 text-xs text-slate-500">Các khoản phí sẽ xuất hiện sau khi gian hàng có đơn được thanh toán.</p>
            </div>
          </div>
        ) : null}

        {history.totalPages > 0 ? (
          <footer className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50/70 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-xs font-semibold text-slate-500">Trang {history.currentPage + 1}/{history.totalPages}</span>
            <div className="flex items-center gap-1.5">
              <PageButton label="Trang trước" disabled={history.currentPage <= 0 || isLoading} onClick={() => setPage((current) => Math.max(0, current - 1))}>
                <ChevronLeft className="size-4" />
              </PageButton>
              {pageNumbers.map((pageNumber) => (
                <button
                  key={pageNumber}
                  type="button"
                  onClick={() => setPage(pageNumber)}
                  disabled={isLoading}
                  aria-current={pageNumber === history.currentPage ? "page" : undefined}
                  className={`grid size-9 place-items-center rounded-lg border text-xs font-black transition ${pageNumber === history.currentPage ? "border-violet-600 bg-violet-600 text-white" : "border-slate-200 bg-white text-slate-600 hover:border-violet-300 hover:text-violet-700"}`}
                >
                  {pageNumber + 1}
                </button>
              ))}
              <PageButton label="Trang sau" disabled={history.currentPage + 1 >= history.totalPages || isLoading} onClick={() => setPage((current) => current + 1)}>
                <ChevronRight className="size-4" />
              </PageButton>
            </div>
          </footer>
        ) : null}
      </section>
    </div>
  );
}

function PolicyItem({ label, value, note, icon: Icon }: { label: string; value: string; note: string; icon: typeof Info }) {
  return (
    <article className="rounded-2xl border border-white/15 bg-white/10 p-4">
      <div className="flex items-center gap-2 text-xs font-bold text-violet-100"><Icon className="size-4" />{label}</div>
      <p className="mt-3 font-black text-white">{value}</p>
      <p className="mt-1 line-clamp-2 text-xs leading-5 text-violet-100">{note}</p>
    </article>
  );
}

function SummaryCard({ label, value, icon: Icon, tone, loading }: { label: string; value: string; icon: typeof ReceiptText; tone: string; loading: boolean }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-bold text-slate-500">{label}</p>
        <span className={`grid size-9 place-items-center rounded-xl ${tone}`}><Icon className="size-[18px]" /></span>
      </div>
      {loading ? <div className="mt-4 h-7 w-28 animate-pulse rounded bg-slate-200" /> : <p className="mt-4 text-xl font-black tracking-[-0.035em] text-slate-950">{value}</p>}
    </article>
  );
}

function FeeHistoryRow({ ledger }: { ledger: SellerFeeLedger }) {
  const status = LEDGER_STATUS[ledger.status];
  const feeAmount = ledger.adjustedFeeAmount ?? ledger.feeAmount;
  const sellerNet = ledger.adjustedSellerNet ?? ledger.sellerNetAmount;
  return (
    <tr className="text-slate-600 transition hover:bg-slate-50/70">
      <td className="px-6 py-4">
        <Link href={`/seller/orders/${ledger.orderId}`} className="break-all font-black text-violet-700 hover:underline">
          {ledger.orderCode || "Mã đơn chưa cập nhật"}
        </Link>
        <p className="mt-1 max-w-64 truncate text-[11px] font-semibold text-slate-600" title={ledger.productName || "Sản phẩm"}>
          {ledger.productName || "Sản phẩm"}
        </p>
        <p className="mt-0.5 max-w-64 truncate text-[11px] text-slate-400" title={ledger.variantName || "Mặc định"}>
          Biến thể: {ledger.variantName || "Mặc định"}
        </p>
      </td>
      <td className="whitespace-nowrap px-4 py-4 text-xs">{formatDateTime(ledger.feeIncurredAt)}</td>
      <td className="whitespace-nowrap px-4 py-4 text-right font-bold text-slate-800">{formatCurrency(ledger.saleAmount)}</td>
      <td className="whitespace-nowrap px-4 py-4 text-right font-bold text-violet-700">{formatPercent(ledger.feeRateSnapshot)}%</td>
      <td className="whitespace-nowrap px-4 py-4 text-right font-black text-rose-600">-{formatCurrency(feeAmount)}</td>
      <td className="whitespace-nowrap px-4 py-4 text-right font-black text-emerald-700">{formatCurrency(sellerNet)}</td>
      <td className="px-6 py-4">
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-black ring-1 ring-inset ${status.className}`}>
          {ledger.status === "PENDING" ? <Clock3 className="size-3.5" /> : <CircleCheckBig className="size-3.5" />}{status.label}
        </span>
        {ledger.adjustmentReason ? <p className="mt-1 max-w-48 truncate text-[11px] text-slate-400" title={ledger.adjustmentReason}>{ledger.adjustmentReason}</p> : null}
      </td>
    </tr>
  );
}

function HistorySkeleton() {
  return (
    <tr>
      {Array.from({ length: 7 }, (_, index) => <td key={index} className="px-4 py-4"><div className="h-4 animate-pulse rounded bg-slate-100" /></td>)}
    </tr>
  );
}

function PageButton({ label, disabled, onClick, children }: { label: string; disabled: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" aria-label={label} title={label} disabled={disabled} onClick={onClick} className="grid size-9 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-violet-300 hover:text-violet-700 disabled:cursor-not-allowed disabled:opacity-40">
      {children}
    </button>
  );
}
