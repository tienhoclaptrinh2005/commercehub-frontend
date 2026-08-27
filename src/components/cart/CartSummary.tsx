"use client";

import { LoaderCircle, ShieldCheck, Trash2, WalletCards } from "lucide-react";

import { useWalletSummary } from "@/hooks/api/useWallet";
import { formatCurrency } from "@/lib/format";
import type { Cart } from "@/types";

interface CartSummaryProps {
  cart: Cart;
  busy: boolean;
  hasUnavailableItems: boolean;
  onCheckout: () => void;
  onClear: () => void;
}

export function CartSummary({
  cart,
  busy,
  hasUnavailableItems,
  onCheckout,
  onClear,
}: CartSummaryProps) {
  const { wallet, isLoading: isWalletLoading } = useWalletSummary();
  const availableBalance = Number(wallet?.availableBalance ?? 0);
  const insufficientBalance = Boolean(wallet) && availableBalance < Number(cart.totalAmount);
  const checkoutDisabled = busy || hasUnavailableItems || insufficientBalance;

  return (
    <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:sticky lg:top-6">
      <h2 className="text-lg font-black text-slate-950">Tóm tắt đơn hàng</h2>

      <dl className="mt-5 space-y-3 border-b border-slate-100 pb-5 text-sm">
        <div className="flex justify-between gap-4 text-slate-500">
          <dt>Số dòng sản phẩm</dt>
          <dd className="font-semibold text-slate-800">{cart.totalItems}</dd>
        </div>
        <div className="flex justify-between gap-4 text-slate-500">
          <dt>Tổng số lượng</dt>
          <dd className="font-semibold text-slate-800">{cart.totalQuantity}</dd>
        </div>
      </dl>

      <div className="mt-5 flex items-end justify-between gap-4">
        <span className="text-sm font-semibold text-slate-600">Tổng thanh toán</span>
        <strong className="text-2xl font-black tracking-[-0.04em] text-emerald-700">
          {formatCurrency(Number(cart.totalAmount))}
        </strong>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3.5 py-3 text-sm">
        <span className="inline-flex items-center gap-2 text-slate-500">
          <WalletCards className="size-4 text-emerald-600" />
          Số dư ví
        </span>
        <strong className={insufficientBalance ? "text-rose-600" : "text-slate-800"}>
          {isWalletLoading && !wallet ? "Đang tải..." : formatCurrency(availableBalance)}
        </strong>
      </div>

      {hasUnavailableItems ? (
        <p className="mt-3 text-xs leading-5 text-rose-600">
          Hãy xóa sản phẩm đã hết hàng hoặc ngừng bán trước khi thanh toán.
        </p>
      ) : insufficientBalance ? (
        <p className="mt-3 text-xs leading-5 text-rose-600">
          Số dư ví không đủ. Vui lòng nạp thêm tiền trước khi thanh toán.
        </p>
      ) : null}

      <button
        type="button"
        onClick={onCheckout}
        disabled={checkoutDisabled}
        className="mt-5 inline-flex h-12 w-full items-center justify-center rounded-xl bg-emerald-600 px-4 text-sm font-black uppercase tracking-[0.04em] text-white shadow-lg shadow-emerald-600/15 transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
      >
        {busy ? (
          <>
            <LoaderCircle className="mr-2 size-4 animate-spin" />
            Đang xử lý...
          </>
        ) : (
          "Thanh toán toàn bộ"
        )}
      </button>

      <p className="mt-3 flex items-start gap-2 text-xs leading-5 text-slate-400">
        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-emerald-600" />
        Hệ thống tự tách đơn theo shop và hình thức giao hàng, đồng thời chống trừ tiền hai lần.
      </p>

      <button
        type="button"
        onClick={onClear}
        disabled={busy}
        className="mt-5 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg text-sm font-semibold text-rose-600 transition hover:bg-rose-50 disabled:opacity-40"
      >
        <Trash2 className="size-4" />
        Xóa sạch giỏ hàng
      </button>
    </aside>
  );
}
