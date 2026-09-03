"use client";

import {
  ArrowRight,
  Banknote,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  CreditCard,
  History,
  LoaderCircle,
  QrCode,
  RefreshCw,
  ShieldCheck,
  WalletCards,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent, type KeyboardEvent } from "react";

import { useAppModal } from "@/components/ui/app-modal";
import { useDepositHistory, useWalletSummary } from "@/hooks/api/useWallet";
import { useAuth } from "@/hooks/auth/useAuth";
import { formatCurrency } from "@/lib/format";
import { getApiErrorMessage } from "@/services/api";
import { walletService } from "@/services/wallet.service";

const MIN_DEPOSIT = 10_000;
const MAX_DEPOSIT = 500_000_000;
const QUICK_AMOUNTS = [50_000, 100_000, 200_000, 500_000, 1_000_000, 2_000_000];
const MONEY_FORMATTER = new Intl.NumberFormat("vi-VN");
const ALLOWED_VNPAY_HOSTS = new Set(["sandbox.vnpayment.vn", "vnpayment.vn", "www.vnpayment.vn"]);

function normalizeMoneyInput(input: string) {
  const digits = input.replace(/\D/g, "");
  if (!digits) return "";
  return String(Math.min(Number(digits.replace(/^0+(?=\d)/, "")), MAX_DEPOSIT));
}

function preventInvalidMoneyKey(event: KeyboardEvent<HTMLInputElement>) {
  const controlKeys = ["Backspace", "Delete", "Tab", "ArrowLeft", "ArrowRight", "Home", "End", "Enter"];
  if (event.ctrlKey || event.metaKey || controlKeys.includes(event.key)) return;
  if (!/^\d$/.test(event.key)) event.preventDefault();
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

function ensureTrustedVnpayUrl(value: string) {
  const url = new URL(value);
  if (url.protocol !== "https:" || !ALLOWED_VNPAY_HOSTS.has(url.hostname)) {
    throw new Error("Backend trả về đường dẫn thanh toán không hợp lệ.");
  }
  return url.toString();
}

export function DepositScreen() {
  const router = useRouter();
  const modal = useAppModal();
  const { user, isHydrated } = useAuth();
  const { wallet, isLoading: walletLoading, error: walletError } = useWalletSummary();
  const [depositPage, setDepositPage] = useState(1);
  const { result, isLoading: historyLoading, error: historyError, refresh } = useDepositHistory(depositPage, 10);
  const [amount, setAmount] = useState("");
  const [amountError, setAmountError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isHydrated && !user) router.replace("/login");
  }, [isHydrated, router, user]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const numericAmount = Number(amount);
    if (!Number.isSafeInteger(numericAmount) || numericAmount < MIN_DEPOSIT) {
      setAmountError(`Số tiền nạp tối thiểu là ${formatCurrency(MIN_DEPOSIT)}.`);
      return;
    }
    if (numericAmount > MAX_DEPOSIT) {
      setAmountError(`Số tiền nạp tối đa là ${formatCurrency(MAX_DEPOSIT)}.`);
      return;
    }
    setAmountError(null);

    const confirmed = await modal.confirm({
      title: "Xác nhận nạp tiền",
      description: "Bạn sẽ được chuyển sang cổng VNPay để hoàn tất thanh toán.",
      details: (
        <dl className="space-y-2">
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">Phương thức</dt>
            <dd className="font-bold">VNPay</dd>
          </div>
          <div className="flex justify-between gap-4 border-t border-slate-200 pt-2">
            <dt className="font-bold text-slate-700">Số tiền nạp</dt>
            <dd className="font-black text-emerald-700">{formatCurrency(numericAmount)}</dd>
          </div>
        </dl>
      ),
      confirmLabel: "Tiếp tục với VNPay",
    });
    if (!confirmed) return;

    setSubmitting(true);
    try {
      const paymentUrl = ensureTrustedVnpayUrl(
        await walletService.createDepositUrl({ amount: numericAmount }),
      );
      window.location.assign(paymentUrl);
    } catch (requestError) {
      modal.showError({
        title: "Không thể tạo giao dịch nạp tiền",
        description: getApiErrorMessage(requestError, "Không thể kết nối cổng thanh toán VNPay"),
        confirmLabel: "Đã hiểu",
      });
      setSubmitting(false);
    }
  }

  if (!isHydrated || !user) {
    return (
      <div className="mx-auto grid min-h-[420px] max-w-[1200px] place-items-center px-4">
        <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500">
          <LoaderCircle className="size-5 animate-spin text-emerald-600" />
          Đang kiểm tra tài khoản...
        </span>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-8 sm:px-6 sm:py-10">
      <nav className="flex items-center gap-2 text-sm" aria-label="Breadcrumb">
        <Link href="/" className="font-semibold text-emerald-700 hover:underline">Trang chủ</Link>
        <ArrowRight className="size-3.5 text-slate-400" />
        <span className="text-slate-500">Nạp tiền</span>
      </nav>

      <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-[-0.04em] text-slate-950 sm:text-4xl">Nạp tiền vào ví</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">Nạp tiền an toàn qua VNPay để thanh toán sản phẩm trên CommerceHub.</p>
        </div>
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-5 py-3 text-right">
          <p className="text-[11px] font-bold uppercase tracking-wide text-emerald-700">Số dư khả dụng</p>
          <p className="mt-1 text-xl font-black text-emerald-800">
            {walletLoading && !wallet ? "Đang tải..." : wallet ? formatCurrency(Number(wallet.availableBalance)) : "—"}
          </p>
        </div>
      </div>

      <div className="mt-8 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <form onSubmit={submit} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7" noValidate>
          <div className="flex items-center gap-3 border-b border-slate-100 pb-5">
            <span className="grid size-11 place-items-center rounded-xl bg-emerald-50 text-emerald-700"><WalletCards className="size-5" /></span>
            <div>
              <h2 className="font-black text-slate-950">Thông tin nạp tiền</h2>
              <p className="mt-1 text-xs text-slate-500">Tối thiểu 10.000đ · Tối đa 500.000.000đ</p>
            </div>
          </div>

          <fieldset className="mt-6">
            <legend className="text-sm font-bold text-slate-800">Chọn phương thức thanh toán</legend>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <label className="relative flex cursor-pointer items-start gap-3 rounded-xl border-2 border-emerald-500 bg-emerald-50/50 p-4">
                <input type="radio" name="deposit-provider" value="VNPAY" defaultChecked className="sr-only" />
                <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-white text-emerald-700 shadow-sm"><CreditCard className="size-5" /></span>
                <span><strong className="block text-sm text-slate-950">VNPay</strong><span className="mt-1 block text-xs leading-5 text-slate-500">Thanh toán qua cổng VNPay Sandbox</span></span>
                <CheckCircle2 className="absolute right-3 top-3 size-5 text-emerald-600" />
              </label>
              <div className="relative flex cursor-not-allowed items-start gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 opacity-70" aria-disabled="true">
                <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-white text-slate-500"><QrCode className="size-5" /></span>
                <span><strong className="block text-sm text-slate-700">QR ngân hàng</strong><span className="mt-1 block text-xs leading-5 text-slate-500">Sẽ tích hợp API ngân hàng sau</span></span>
                <span className="absolute right-3 top-3 rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-600">Sắp có</span>
              </div>
            </div>
          </fieldset>

          <div className="mt-7">
            <label htmlFor="deposit-amount" className="text-sm font-bold text-slate-800">Số tiền muốn nạp</label>
            <div className="relative mt-2">
              <Banknote className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-400" />
              <input
                id="deposit-amount"
                value={amount ? MONEY_FORMATTER.format(Number(amount)) : ""}
                onChange={(event) => { setAmount(normalizeMoneyInput(event.target.value)); setAmountError(null); }}
                onKeyDown={preventInvalidMoneyKey}
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="Nhập số tiền..."
                aria-invalid={Boolean(amountError) || undefined}
                aria-describedby={amountError ? "deposit-amount-error" : "deposit-amount-help"}
                className={`h-14 w-full rounded-xl border bg-white pl-12 pr-12 text-lg font-bold outline-none transition focus:ring-4 ${amountError ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/10" : "border-slate-200 focus:border-emerald-500 focus:ring-emerald-500/10"}`}
              />
              <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">đ</span>
            </div>
            {amountError ? <p id="deposit-amount-error" className="mt-2 text-xs font-semibold text-rose-600" role="alert">{amountError}</p> : <p id="deposit-amount-help" className="mt-2 text-xs text-slate-500">Chỉ nhập số nguyên dương, không bao gồm phí thanh toán của ngân hàng nếu có.</p>}

            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {QUICK_AMOUNTS.map((value) => (
                <button key={value} type="button" onClick={() => { setAmount(String(value)); setAmountError(null); }} className={`h-10 rounded-lg border text-sm font-bold transition ${Number(amount) === value ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-white text-slate-600 hover:border-emerald-300 hover:text-emerald-700"}`}>
                  {MONEY_FORMATTER.format(value)}đ
                </button>
              ))}
            </div>
          </div>

          {walletError ? <p className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">Không tải được số dư hiện tại: {walletError}</p> : null}

          <button type="submit" disabled={submitting} className="mt-7 inline-flex h-12 w-full items-center justify-center rounded-xl bg-emerald-600 px-5 text-sm font-black uppercase tracking-[0.04em] text-white shadow-lg shadow-emerald-600/15 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300">
            {submitting ? <LoaderCircle className="mr-2 size-4 animate-spin" /> : <ShieldCheck className="mr-2 size-4" />}
            {submitting ? "Đang tạo giao dịch..." : "Nạp tiền qua VNPay"}
          </button>
        </form>

        <aside className="space-y-4">
          <section className="rounded-2xl border border-sky-200 bg-sky-50 p-5 text-sm text-slate-600">
            <h2 className="flex items-center gap-2 font-black text-slate-900"><ShieldCheck className="size-5 text-sky-600" />Quy trình an toàn</h2>
            <ol className="mt-4 space-y-3 text-xs leading-5">
              <li className="flex gap-3"><span className="grid size-6 shrink-0 place-items-center rounded-full bg-sky-600 font-bold text-white">1</span>Xác nhận số tiền trên CommerceHub.</li>
              <li className="flex gap-3"><span className="grid size-6 shrink-0 place-items-center rounded-full bg-sky-600 font-bold text-white">2</span>Hoàn tất thanh toán trên cổng VNPay.</li>
              <li className="flex gap-3"><span className="grid size-6 shrink-0 place-items-center rounded-full bg-sky-600 font-bold text-white">3</span>VNPay gửi IPN hợp lệ, hệ thống mới cộng tiền vào ví.</li>
            </ol>
          </section>
          <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-xs leading-5 text-amber-900">
            <h2 className="flex items-center gap-2 font-black"><Clock3 className="size-4" />Lưu ý môi trường hiện tại</h2>
            <p className="mt-2">Cổng đang dùng VNPay Sandbox. Không đóng cửa sổ thanh toán cho đến khi giao dịch hoàn tất.</p>
          </section>
        </aside>
      </div>

      <section className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
          <div><h2 className="flex items-center gap-2 font-black text-slate-950"><History className="size-5 text-emerald-600" />Lịch sử nạp tiền</h2><p className="mt-1 text-xs text-slate-500">{result.totalElements} giao dịch · đang chờ, thành công hoặc thất bại từ dữ liệu thật.</p></div>
          <button type="button" onClick={() => void refresh()} disabled={historyLoading} className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50"><RefreshCw className={`size-3.5 ${historyLoading ? "animate-spin" : ""}`} />Làm mới</button>
        </header>
        {historyError ? <div className="p-6 text-sm text-rose-600">{historyError}</div> : historyLoading ? <div className="grid min-h-40 place-items-center text-sm text-slate-500"><LoaderCircle className="mr-2 inline size-4 animate-spin" />Đang tải lịch sử...</div> : result.data.length === 0 ? <div className="grid min-h-44 place-items-center px-5 text-center"><div><WalletCards className="mx-auto size-8 text-slate-300" /><p className="mt-3 text-sm font-semibold text-slate-600">Bạn chưa tạo giao dịch nạp tiền nào.</p></div></div> : (
          <div className="divide-y divide-slate-100">
            {result.data.map((deposit) => {
              const status = deposit.status === "SUCCESS"
                ? { label: "Đã vào ví", tone: "text-emerald-700" }
                : deposit.status === "FAILED"
                  ? { label: "Thất bại", tone: "text-rose-600" }
                  : { label: "Đang chờ thanh toán", tone: "text-amber-700" };
              return (
              <article key={deposit.id} className="flex flex-wrap items-center justify-between gap-4 px-5 py-4 sm:px-6">
                <div className="flex min-w-0 items-center gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-600"><CreditCard className="size-4" /></span><div className="min-w-0"><p className="font-bold text-slate-900">Nạp tiền qua {deposit.provider}</p><p className="mt-1 truncate text-xs text-slate-500">{formatTransactionTime(deposit.createdAt)} · {deposit.transactionCode}</p></div></div>
                <div className="text-right"><p className={`font-black ${deposit.status === "SUCCESS" ? "text-emerald-700" : "text-slate-800"}`}>{deposit.status === "SUCCESS" ? "+" : ""}{formatCurrency(Math.abs(Number(deposit.amount)))}</p><p className={`mt-1 text-[11px] font-bold ${status.tone}`}>{status.label}</p></div>
              </article>
              );
            })}
          </div>
        )}
        {result.totalPages > 1 ? (
          <footer className="flex items-center justify-between border-t border-slate-100 px-5 py-4 text-sm sm:px-6">
            <span className="font-semibold text-slate-500">Trang {result.currentPage + 1}/{result.totalPages}</span>
            <div className="flex gap-2">
              <button type="button" onClick={() => setDepositPage((current) => Math.max(1, current - 1))} disabled={depositPage <= 1 || historyLoading} className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-200 px-3 font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-40"><ChevronLeft className="size-4" />Trước</button>
              <button type="button" onClick={() => setDepositPage((current) => current + 1)} disabled={depositPage >= result.totalPages || historyLoading} className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-200 px-3 font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-40">Sau<ChevronRight className="size-4" /></button>
            </div>
          </footer>
        ) : null}
      </section>
    </div>
  );
}
