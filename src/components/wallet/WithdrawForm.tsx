"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  BadgeInfo,
  BanknoteArrowDown,
  Building2,
  CheckCircle2,
  CreditCard,
  Send,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState, type KeyboardEvent } from "react";
import { Controller, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { useWalletSummary } from "@/hooks/api/useWallet";
import { formatCurrency } from "@/lib/format";
import {
  MAX_WITHDRAWAL_AMOUNT,
  MIN_WITHDRAWAL_AMOUNT,
  withdrawalSchema,
  type WithdrawalFormValues,
} from "@/lib/validations/wallet.schema";
import { getApiErrorMessage } from "@/services/api";
import { walletService } from "@/services/wallet.service";
import { useAuthStore } from "@/stores/authStore";

const BANKS = [
  "Vietcombank",
  "Techcombank",
  "BIDV",
  "VietinBank",
  "MB Bank",
  "ACB",
  "VPBank",
  "Sacombank",
  "TPBank",
  "Agribank",
  "VIB",
  "SHB",
  "OCB",
  "HDBank",
  "SeABank",
  "MSB",
] as const;

const MONEY_FORMATTER = new Intl.NumberFormat("vi-VN");

type Notice = { type: "success" | "error"; message: string } | null;

function normalizeMoneyInput(input: string) {
  const digits = input.replace(/\D/g, "");
  if (!digits) return "";
  return String(
    Math.min(Number(digits.replace(/^0+(?=\d)/, "")), MAX_WITHDRAWAL_AMOUNT),
  );
}

function formatMoneyInput(value: string) {
  return value ? MONEY_FORMATTER.format(Number(value)) : "";
}

function preventInvalidNumberKey(event: KeyboardEvent<HTMLInputElement>) {
  const controlKeys = [
    "Backspace",
    "Delete",
    "Tab",
    "ArrowLeft",
    "ArrowRight",
    "Home",
    "End",
    "Enter",
  ];
  if (event.ctrlKey || event.metaKey || controlKeys.includes(event.key)) return;
  if (!/^\d$/.test(event.key)) event.preventDefault();
}

export function WithdrawForm() {
  const session = useAuthStore((state) => state.session);
  const { wallet, isLoading, error: walletError, refresh } = useWalletSummary();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);
  const [retryIdempotencyKey, setRetryIdempotencyKey] = useState<string | null>(
    null,
  );

  const {
    control,
    register,
    setError,
    setValue,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm<WithdrawalFormValues>({
    resolver: zodResolver(withdrawalSchema),
    defaultValues: {
      amount: "",
      bankName: "",
      accountNumber: "",
      accountName: "",
    },
  });

  useEffect(() => {
    if (session?.user.fullName) {
      setValue("accountName", session.user.fullName.toLocaleUpperCase("vi-VN"));
    }
  }, [session?.user.fullName, setValue]);

  const accountNumberField = register("accountNumber");
  const canWithdraw = Boolean(
    wallet &&
    wallet.status === "ACTIVE" &&
    wallet.availableBalance >= MIN_WITHDRAWAL_AMOUNT,
  );

  const submitWithdrawal = handleSubmit(async (values) => {
    if (!wallet) return;

    const amount = Number(values.amount);
    if (amount > wallet.availableBalance) {
      setError("amount", {
        type: "validate",
        message: "Số tiền muốn rút vượt quá số dư khả dụng",
      });
      return;
    }

    if (
      !window.confirm(
        `Xác nhận gửi yêu cầu rút ${formatCurrency(amount)} về ${values.bankName}, số tài khoản ${values.accountNumber}?`,
      )
    ) {
      return;
    }

    setIsSubmitting(true);
    setNotice(null);
    const idempotencyKey = retryIdempotencyKey ?? crypto.randomUUID();
    setRetryIdempotencyKey(idempotencyKey);

    try {
      const message = await walletService.requestWithdrawal({
        amount,
        bankName: values.bankName.trim(),
        accountNumber: values.accountNumber.trim(),
        accountName: values.accountName.trim().toLocaleUpperCase("vi-VN"),
        idempotencyKey,
      });

      setRetryIdempotencyKey(null);
      await refresh();
      reset({
        amount: "",
        bankName: "",
        accountNumber: "",
        accountName: values.accountName.trim().toLocaleUpperCase("vi-VN"),
      });
      setNotice({ type: "success", message });
    } catch (requestError) {
      setNotice({
        type: "error",
        message: getApiErrorMessage(
          requestError,
          "Không thể gửi yêu cầu rút tiền",
        ),
      });
    } finally {
      setIsSubmitting(false);
    }
  });

  return (
    <div className="mx-auto w-full max-w-5xl space-y-5 p-4 sm:p-6 lg:p-8">
      <div>
        <Link
          href="/seller/wallet"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-violet-700"
        >
          <ArrowLeft className="size-4" /> Quay lại tài chính
        </Link>
        <h1 className="mt-4 text-2xl font-bold tracking-[-0.035em] text-slate-950 sm:text-3xl">
          Rút tiền
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Gửi yêu cầu chuyển số dư khả dụng về tài khoản ngân hàng của bạn.
        </p>
      </div>

      {notice ? (
        <div
          className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm font-semibold ${
            notice.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-rose-200 bg-rose-50 text-rose-700"
          }`}
          role={notice.type === "error" ? "alert" : "status"}
        >
          {notice.type === "success" ? (
            <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
          ) : (
            <BadgeInfo className="mt-0.5 size-4 shrink-0" />
          )}
          {notice.message}
        </div>
      ) : null}

      {walletError ? (
        <div
          className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700"
          role="alert"
        >
          {walletError}
        </div>
      ) : null}

      <form
        onSubmit={submitWithdrawal}
        noValidate
        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"
      >
        <section>
          <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
            <span className="grid size-9 place-items-center rounded-xl bg-emerald-50 text-emerald-700">
              <BanknoteArrowDown className="size-[18px]" />
            </span>
            <h2 className="font-bold text-slate-950">Thông tin rút tiền</h2>
          </div>

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <div className="rounded-xl border border-sky-100 bg-sky-50 p-5">
              <p className="text-[11px] font-bold uppercase tracking-wide text-sky-700">
                Số dư khả dụng
              </p>
              {isLoading ? (
                <div className="mt-3 h-9 w-36 animate-pulse rounded bg-sky-100" />
              ) : (
                <p className="mt-2 text-3xl font-extrabold tracking-[-0.04em] text-emerald-700">
                  {wallet ? formatCurrency(wallet.availableBalance) : "—"}
                </p>
              )}
              <p className="mt-3 text-xs text-slate-500">
                Chỉ số dư khả dụng mới có thể tạo yêu cầu rút.
              </p>
            </div>

            <FormField
              id="withdrawalAmount"
              label="Số tiền muốn rút (VNĐ) *"
              error={errors.amount?.message}
            >
              <Controller
                control={control}
                name="amount"
                render={({ field }) => (
                  <div className="relative">
                    <Input
                      id="withdrawalAmount"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      placeholder="Nhập số tiền..."
                      value={formatMoneyInput(field.value)}
                      onChange={(event) =>
                        field.onChange(normalizeMoneyInput(event.target.value))
                      }
                      onBlur={field.onBlur}
                      onKeyDown={preventInvalidNumberKey}
                      ref={field.ref}
                      hasError={Boolean(errors.amount)}
                      className="pl-4 pr-10"
                      aria-describedby={
                        errors.amount
                          ? "withdrawalAmount-error"
                          : "withdrawal-amount-help"
                      }
                    />
                    <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
                      đ
                    </span>
                  </div>
                )}
              />
              <p
                id="withdrawal-amount-help"
                className="text-xs leading-5 text-slate-500"
              >
                Tối thiểu 500.000đ · Tối đa 500.000.000đ · Phí rút hiện tại 0%.
              </p>
            </FormField>
          </div>
        </section>

        <section className="mt-7 border-t border-slate-200 pt-6">
          <div className="flex items-center gap-2">
            <span className="grid size-9 place-items-center rounded-xl bg-violet-50 text-violet-700">
              <CreditCard className="size-[18px]" />
            </span>
            <h2 className="font-bold text-slate-950">
              Thông tin ngân hàng nhận
            </h2>
          </div>

          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <FormField
              id="bankName"
              label="Chọn ngân hàng *"
              error={errors.bankName?.message}
            >
              <div className="relative">
                <Building2 className="pointer-events-none absolute left-4 top-1/2 size-[18px] -translate-y-1/2 text-slate-400" />
                <select
                  id="bankName"
                  className={`h-12 w-full appearance-none rounded-xl border bg-white pl-11 pr-10 text-[15px] outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10 ${
                    errors.bankName ? "border-rose-400" : "border-slate-200"
                  }`}
                  aria-invalid={Boolean(errors.bankName) || undefined}
                  {...register("bankName")}
                >
                  <option value="">-- Chọn ngân hàng --</option>
                  {BANKS.map((bank) => (
                    <option key={bank} value={bank}>
                      {bank}
                    </option>
                  ))}
                </select>
              </div>
            </FormField>

            <FormField
              id="accountNumber"
              label="Số tài khoản *"
              error={errors.accountNumber?.message}
            >
              <div className="relative">
                <CreditCard className="pointer-events-none absolute left-4 top-1/2 size-[18px] -translate-y-1/2 text-slate-400" />
                <Input
                  id="accountNumber"
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder="Nhập số tài khoản..."
                  maxLength={50}
                  onKeyDown={preventInvalidNumberKey}
                  hasError={Boolean(errors.accountNumber)}
                  {...accountNumberField}
                  onChange={(event) => {
                    event.target.value = event.target.value
                      .replace(/\D/g, "")
                      .slice(0, 50);
                    void accountNumberField.onChange(event);
                  }}
                />
              </div>
            </FormField>

            <FormField
              id="accountName"
              label="Tên chủ tài khoản *"
              error={errors.accountName?.message}
            >
              <div className="relative">
                <UserRound className="pointer-events-none absolute left-4 top-1/2 size-[18px] -translate-y-1/2 text-slate-400" />
                <Input
                  id="accountName"
                  type="text"
                  autoComplete="name"
                  placeholder="NGUYEN VAN A"
                  maxLength={100}
                  hasError={Boolean(errors.accountName)}
                  className="uppercase"
                  {...register("accountName")}
                />
              </div>
            </FormField>

            <div className="flex items-end">
              <div className="w-full rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-xs leading-5 text-emerald-800">
                <span className="flex items-center gap-2 font-bold">
                  <ShieldCheck className="size-4" /> Thông tin được bảo vệ
                </span>
                <p className="mt-1">
                  Vui lòng kiểm tra đúng ngân hàng, số tài khoản và tên người
                  nhận.
                </p>
              </div>
            </div>
          </div>
        </section>

        {!isLoading && !canWithdraw ? (
          <p className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
            Số dư khả dụng cần từ 500.000đ và ví phải ở trạng thái hoạt động để
            gửi yêu cầu.
          </p>
        ) : null}

        <div className="mt-7 flex justify-end border-t border-slate-100 pt-5">
          <Button
            type="submit"
            isLoading={isSubmitting}
            disabled={!canWithdraw || Boolean(walletError)}
            className="w-full bg-emerald-700 sm:w-auto sm:min-w-56 hover:bg-emerald-800"
          >
            <Send className="size-[18px]" />
            {isSubmitting ? "Đang gửi yêu cầu..." : "Xác nhận rút tiền"}
          </Button>
        </div>
      </form>

      <aside className="rounded-2xl border border-sky-200 bg-sky-50 p-5 text-sm text-slate-600 sm:p-6">
        <div className="flex items-start gap-3">
          <BadgeInfo className="mt-0.5 size-5 shrink-0 text-sky-600" />
          <div>
            <h2 className="font-bold text-slate-900">Lưu ý quan trọng</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-xs leading-5 sm:text-sm">
              <li>
                Kiểm tra kỹ thông tin tài khoản ngân hàng trước khi xác nhận.
              </li>
              <li>
                Yêu cầu rút tiền được đưa sang trạng thái chờ Admin xử lý.
              </li>
              <li>
                Khi yêu cầu được tạo, số tiền sẽ tạm thời được trừ khỏi số dư
                khả dụng.
              </li>
              <li>Nếu yêu cầu bị từ chối, hệ thống tự động hoàn tiền về ví.</li>
              <li>Yêu cầu rút tiền thường được xử lý trong vòng 24 giờ .</li>
            </ul>
          </div>
        </div>
      </aside>
    </div>
  );
}
