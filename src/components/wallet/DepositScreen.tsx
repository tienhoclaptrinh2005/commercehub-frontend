"use client";

import {
  ArrowRight,
  Banknote,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Copy,
  CreditCard,
  History,
  LoaderCircle,
  QrCode,
  RefreshCw,
  ShieldCheck,
  WalletCards,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";

import { useAppModal } from "@/components/ui/app-modal";
import { useDepositHistory, useWalletSummary } from "@/hooks/api/useWallet";
import { useAuth } from "@/hooks/auth/useAuth";
import { formatCurrency } from "@/lib/format";
import { getApiErrorMessage } from "@/services/api";
import { walletService } from "@/services/wallet.service";
import type { DepositQrSession, DepositStatus } from "@/types";

const MIN_DEPOSIT = 10_000;
const MAX_DEPOSIT = 500_000_000;
const POLL_INTERVAL_MS = 5_000;
const ACTIVE_DEPOSIT_KEY = "commercehub:active-sepay-deposit";
const CREATE_ATTEMPT_KEY = "commercehub:sepay-create-attempt";
const QUICK_AMOUNTS = [50_000, 100_000, 200_000, 500_000, 1_000_000, 2_000_000];
const MONEY_FORMATTER = new Intl.NumberFormat("vi-VN");

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

function secondsUntil(value: string) {
  return Math.max(0, Math.ceil((new Date(value).getTime() - Date.now()) / 1_000));
}

function formatCountdown(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`;
}

function statusPresentation(status: DepositStatus) {
  switch (status) {
    case "SUCCESS":
      return { label: "Đã vào ví", tone: "text-emerald-700", badge: "bg-emerald-50 text-emerald-700" };
    case "FAILED":
      return { label: "Thất bại", tone: "text-rose-600", badge: "bg-rose-50 text-rose-700" };
    case "EXPIRED":
      return { label: "Đã hết hạn", tone: "text-slate-500", badge: "bg-slate-100 text-slate-600" };
    case "REVIEW_REQUIRED":
      return { label: "Chờ đối soát", tone: "text-violet-700", badge: "bg-violet-50 text-violet-700" };
    default:
      return { label: "Đang chờ thanh toán", tone: "text-amber-700", badge: "bg-amber-50 text-amber-700" };
  }
}

function getCreateAttempt(amount: number) {
  try {
    const saved = JSON.parse(sessionStorage.getItem(CREATE_ATTEMPT_KEY) ?? "null") as {
      amount?: number;
      idempotencyKey?: string;
    } | null;
    if (saved?.amount === amount && saved.idempotencyKey) return saved.idempotencyKey;
  } catch {
    sessionStorage.removeItem(CREATE_ATTEMPT_KEY);
  }

  const idempotencyKey = crypto.randomUUID();
  sessionStorage.setItem(CREATE_ATTEMPT_KEY, JSON.stringify({ amount, idempotencyKey }));
  return idempotencyKey;
}

export function DepositScreen() {
  const router = useRouter();
  const modal = useAppModal();
  const { user, isHydrated } = useAuth();
  const { wallet, isLoading: walletLoading, error: walletError, refresh: refreshWallet } = useWalletSummary();
  const [depositPage, setDepositPage] = useState(1);
  const { result, isLoading: historyLoading, error: historyError, refresh } = useDepositHistory(depositPage, 10);
  const [amount, setAmount] = useState("");
  const [amountError, setAmountError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deposit, setDeposit] = useState<DepositQrSession | null>(null);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [copied, setCopied] = useState(false);
  const restoredForUser = useRef<number | null>(null);
  const handledStatus = useRef<string | null>(null);

  useEffect(() => {
    if (isHydrated && !user) router.replace("/login");
  }, [isHydrated, router, user]);

  useEffect(() => {
    if (!user || restoredForUser.current === user.id) return;
    restoredForUser.current = user.id;
    const transactionCode = sessionStorage.getItem(ACTIVE_DEPOSIT_KEY);
    if (!transactionCode) return;

    let cancelled = false;
    walletService.getDepositStatus(transactionCode)
      .then((nextDeposit) => {
        if (!cancelled) setDeposit(nextDeposit);
      })
      .catch(() => {
        sessionStorage.removeItem(ACTIVE_DEPOSIT_KEY);
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    if (!deposit) return;
    const updateCountdown = () => setRemainingSeconds(secondsUntil(deposit.expiresAt));
    updateCountdown();
    const timer = window.setInterval(updateCountdown, 1_000);
    return () => window.clearInterval(timer);
  }, [deposit]);

  useEffect(() => {
    if (!deposit || deposit.status !== "PENDING") return;
    let cancelled = false;
    let inFlight = false;

    const poll = async () => {
      if (cancelled || inFlight || document.visibilityState !== "visible") return;
      inFlight = true;
      try {
        const nextDeposit = await walletService.getDepositStatus(deposit.transactionCode);
        if (!cancelled) setDeposit(nextDeposit);
      } catch {
        // Lỗi mạng tạm thời không được biến thành trạng thái thanh toán thất bại.
      } finally {
        inFlight = false;
      }
    };

    const timer = window.setInterval(() => void poll(), POLL_INTERVAL_MS);
    const onVisible = () => {
      if (document.visibilityState === "visible") void poll();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [deposit]);

  useEffect(() => {
    if (!deposit || deposit.status === "PENDING") return;
    const statusKey = `${deposit.transactionCode}:${deposit.status}`;
    if (handledStatus.current === statusKey) return;
    handledStatus.current = statusKey;
    sessionStorage.removeItem(ACTIVE_DEPOSIT_KEY);

    if (deposit.status === "SUCCESS") {
      void refreshWallet();
      void refresh();
      window.dispatchEvent(new Event("commercehub:wallet-updated"));
      modal.showSuccess({
        title: "Nạp tiền thành công",
        description: `${formatCurrency(Number(deposit.amount))} đã được cộng vào số dư khả dụng của bạn.`,
        confirmLabel: "Hoàn tất",
      });
    } else if (deposit.status === "REVIEW_REQUIRED") {
      modal.showInfo({
        title: "Giao dịch cần đối soát",
        description: "Hệ thống đã nhận giao dịch nhưng số tiền hoặc thời điểm thanh toán không khớp. Tiền chưa được cộng tự động; vui lòng liên hệ hỗ trợ.",
        confirmLabel: "Đã hiểu",
      });
    } else if (deposit.status === "EXPIRED") {
      modal.showInfo({
        title: "Mã QR đã hết hạn",
        description: "Mã QR chỉ có hiệu lực 15 phút. Hãy tạo mã mới và không chuyển khoản bằng mã đã hết hạn.",
        confirmLabel: "Tạo mã mới",
      });
    }
  }, [deposit, modal, refresh, refreshWallet]);

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
      title: "Xác nhận tạo mã QR",
      description: "Mã QR sẽ có hiệu lực trong 15 phút và chỉ dùng cho đúng số tiền này.",
      details: (
        <dl className="space-y-2">
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">Phương thức</dt>
            <dd className="font-bold">SePay Webhook</dd>
          </div>
          <div className="flex justify-between gap-4 border-t border-slate-200 pt-2">
            <dt className="font-bold text-slate-700">Số tiền nạp</dt>
            <dd className="font-black text-emerald-700">{formatCurrency(numericAmount)}</dd>
          </div>
        </dl>
      ),
      confirmLabel: "Tạo mã QR",
    });
    if (!confirmed) return;

    setSubmitting(true);
    try {
      const nextDeposit = await walletService.createDeposit({
        amount: numericAmount,
        idempotencyKey: getCreateAttempt(numericAmount),
      });
      sessionStorage.removeItem(CREATE_ATTEMPT_KEY);
      sessionStorage.setItem(ACTIVE_DEPOSIT_KEY, nextDeposit.transactionCode);
      handledStatus.current = null;
      setDeposit(nextDeposit);
    } catch (requestError) {
      modal.showError({
        title: "Không thể tạo mã QR",
        description: getApiErrorMessage(requestError, "Không thể tạo yêu cầu nạp tiền SePay"),
        confirmLabel: "Đã hiểu",
      });
    } finally {
      setSubmitting(false);
    }
  }

  async function copyPaymentCode() {
    if (!deposit) return;
    try {
      await navigator.clipboard.writeText(deposit.paymentCode);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1_500);
    } catch {
      modal.showError({
        title: "Không thể sao chép",
        description: `Vui lòng nhập thủ công nội dung ${deposit.paymentCode}.`,
      });
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

  const activeQr = deposit?.status === "PENDING";
  const currentStatus = deposit ? statusPresentation(deposit.status) : null;

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
          <p className="mt-2 text-sm leading-6 text-slate-500">Tạo VietQR, chuyển khoản và nhận kết quả tự động từ SePay Webhook.</p>
        </div>
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-5 py-3 text-right">
          <p className="text-[11px] font-bold uppercase tracking-wide text-emerald-700">Số dư khả dụng</p>
          <p className="mt-1 text-xl font-black text-emerald-800">
            {walletLoading && !wallet ? "Đang tải..." : wallet ? formatCurrency(Number(wallet.availableBalance)) : "—"}
          </p>
        </div>
      </div>

      <div className="mt-8 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <form onSubmit={submit} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7" noValidate>
          <div className="flex items-center gap-3 border-b border-slate-100 pb-5">
            <span className="grid size-11 place-items-center rounded-xl bg-emerald-50 text-emerald-700"><WalletCards className="size-5" /></span>
            <div>
              <h2 className="font-black text-slate-950">Thông tin nạp tiền</h2>
              <p className="mt-1 text-xs text-slate-500">Tối thiểu 10.000đ · Tối đa 500.000.000đ</p>
            </div>
          </div>

          <div className="mt-6 rounded-xl border-2 border-emerald-500 bg-emerald-50/50 p-4">
            <div className="flex items-start gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-white text-emerald-700 shadow-sm"><QrCode className="size-5" /></span>
              <span><strong className="block text-sm text-slate-950">VietQR + SePay Webhook</strong><span className="mt-1 block text-xs leading-5 text-slate-500">Quét QR bằng ứng dụng ngân hàng, không chuyển sang cổng trung gian.</span></span>
              <CheckCircle2 className="ml-auto size-5 text-emerald-600" />
            </div>
          </div>

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
            {amountError ? <p id="deposit-amount-error" className="mt-2 text-xs font-semibold text-rose-600" role="alert">{amountError}</p> : <p id="deposit-amount-help" className="mt-2 text-xs text-slate-500">Mỗi tài khoản chỉ có một mã QR đang chờ và mã tự hết hạn sau 15 phút.</p>}

            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
              {QUICK_AMOUNTS.map((value) => (
                <button key={value} type="button" onClick={() => { setAmount(String(value)); setAmountError(null); }} className={`h-10 rounded-lg border text-sm font-bold transition ${Number(amount) === value ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-white text-slate-600 hover:border-emerald-300 hover:text-emerald-700"}`}>
                  {MONEY_FORMATTER.format(value)}đ
                </button>
              ))}
            </div>
          </div>

          {walletError ? <p className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">Không tải được số dư hiện tại: {walletError}</p> : null}

          <button type="submit" disabled={submitting || activeQr} className="mt-7 inline-flex h-12 w-full items-center justify-center rounded-xl bg-emerald-600 px-5 text-sm font-black uppercase tracking-[0.04em] text-white shadow-lg shadow-emerald-600/15 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300">
            {submitting ? <LoaderCircle className="mr-2 size-4 animate-spin" /> : <QrCode className="mr-2 size-4" />}
            {submitting ? "Đang tạo mã..." : activeQr ? "Đang chờ thanh toán" : "Tạo mã QR"}
          </button>
        </form>

        <aside className="space-y-4">
          {deposit ? (
            <section className="rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm">
              <div className="flex items-center justify-between gap-3 text-left">
                <div>
                  <h2 className="font-black text-slate-950">Mã QR chuyển khoản</h2>
                  <p className="mt-1 text-xs text-slate-500">Mã nạp {deposit.transactionCode}</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-[11px] font-black ${currentStatus?.badge}`}>{currentStatus?.label}</span>
              </div>

              {activeQr ? (
                <>
                  <div className="mx-auto mt-5 w-fit rounded-2xl border border-slate-200 bg-white p-2">
                    <Image src={deposit.qrUrl} alt={`Mã QR nạp tiền ${deposit.paymentCode}`} width={260} height={260} priority />
                  </div>
                  <p className="mt-3 flex items-center justify-center gap-2 text-sm font-bold text-amber-700">
                    <Clock3 className="size-4" /> Còn {formatCountdown(remainingSeconds)}
                  </p>
                </>
              ) : (
                <div className={`mt-5 rounded-xl px-4 py-6 text-sm font-bold ${currentStatus?.badge}`}>
                  {currentStatus?.label}
                </div>
              )}

              <dl className="mt-5 space-y-3 border-t border-slate-100 pt-4 text-left text-xs">
                <div className="flex justify-between gap-4"><dt className="text-slate-500">Ngân hàng</dt><dd className="font-bold text-slate-900">{deposit.bankCode}</dd></div>
                <div className="flex justify-between gap-4"><dt className="text-slate-500">Số tài khoản</dt><dd className="font-bold text-slate-900">{deposit.bankAccountNumber}</dd></div>
                <div className="flex justify-between gap-4"><dt className="text-slate-500">Chủ tài khoản</dt><dd className="text-right font-bold text-slate-900">{deposit.accountName}</dd></div>
                <div className="flex justify-between gap-4"><dt className="text-slate-500">Số tiền</dt><dd className="font-black text-emerald-700">{formatCurrency(Number(deposit.amount))}</dd></div>
                <div className="flex items-center justify-between gap-4"><dt className="text-slate-500">Nội dung</dt><dd className="flex items-center gap-2 font-black text-slate-950">{deposit.paymentCode}<button type="button" onClick={() => void copyPaymentCode()} className="rounded-md p-1 text-emerald-700 hover:bg-emerald-50" aria-label="Sao chép nội dung chuyển khoản"><Copy className="size-3.5" /></button></dd></div>
              </dl>
              {copied ? <p className="mt-3 text-xs font-bold text-emerald-700">Đã sao chép nội dung chuyển khoản.</p> : null}
              <p className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-xs font-bold leading-5 text-rose-700">Phải chuyển đúng số tiền và nội dung. Không dùng mã sau khi hết hạn.</p>
            </section>
          ) : (
            <section className="rounded-2xl border border-sky-200 bg-sky-50 p-5 text-sm text-slate-600">
              <h2 className="flex items-center gap-2 font-black text-slate-900"><ShieldCheck className="size-5 text-sky-600" />Quy trình an toàn</h2>
              <ol className="mt-4 space-y-3 text-xs leading-5">
                <li className="flex gap-3"><span className="grid size-6 shrink-0 place-items-center rounded-full bg-sky-600 font-bold text-white">1</span>Tạo mã QR cho đúng số tiền cần nạp.</li>
                <li className="flex gap-3"><span className="grid size-6 shrink-0 place-items-center rounded-full bg-sky-600 font-bold text-white">2</span>Quét QR và giữ nguyên nội dung chuyển khoản.</li>
                <li className="flex gap-3"><span className="grid size-6 shrink-0 place-items-center rounded-full bg-sky-600 font-bold text-white">3</span>SePay xác thực giao dịch, hệ thống tự cộng ví đúng một lần.</li>
              </ol>
            </section>
          )}
          <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-xs leading-5 text-amber-900">
            <h2 className="flex items-center gap-2 font-black"><Clock3 className="size-4" />Lưu ý xác nhận thanh toán</h2>
            <p className="mt-2">Giao diện không tự cộng tiền. Số dư chỉ thay đổi sau khi backend xác minh webhook HMAC hợp lệ từ SePay.</p>
          </section>
        </aside>
      </div>

      <section className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
          <div><h2 className="flex items-center gap-2 font-black text-slate-950"><History className="size-5 text-emerald-600" />Lịch sử nạp tiền</h2><p className="mt-1 text-xs text-slate-500">Dữ liệu nạp tiền thật của tài khoản đang đăng nhập.</p></div>
          <button type="button" onClick={() => void refresh()} disabled={historyLoading} className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50"><RefreshCw className={`size-3.5 ${historyLoading ? "animate-spin" : ""}`} />Làm mới</button>
        </header>
        {historyError ? <div className="p-6 text-sm text-rose-600">{historyError}</div> : historyLoading ? <div className="grid min-h-40 place-items-center text-sm text-slate-500"><LoaderCircle className="mr-2 inline size-4 animate-spin" />Đang tải lịch sử...</div> : result.data.length === 0 ? <div className="grid min-h-44 place-items-center px-5 text-center"><div><WalletCards className="mx-auto size-8 text-slate-300" /><p className="mt-3 text-sm font-semibold text-slate-600">Bạn chưa tạo giao dịch nạp tiền nào.</p></div></div> : (
          <div className="divide-y divide-slate-100">
            {result.data.map((item) => {
              const status = statusPresentation(item.status);
              return (
                <article key={item.id} className="flex flex-wrap items-center justify-between gap-4 px-5 py-4 sm:px-6">
                  <div className="flex min-w-0 items-center gap-3"><span className="grid size-10 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-600"><CreditCard className="size-4" /></span><div className="min-w-0"><p className="font-bold text-slate-900">Nạp tiền qua {item.provider}</p><p className="mt-1 truncate text-xs text-slate-500">{formatTransactionTime(item.createdAt)} · {item.transactionCode}</p></div></div>
                  <div className="text-right"><p className={`font-black ${item.status === "SUCCESS" ? "text-emerald-700" : "text-slate-800"}`}>{item.status === "SUCCESS" ? "+" : ""}{formatCurrency(Math.abs(Number(item.amount)))}</p><p className={`mt-1 text-[11px] font-bold ${status.tone}`}>{status.label}</p></div>
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
