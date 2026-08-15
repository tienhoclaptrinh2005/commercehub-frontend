"use client";

import { Clock3, Minus, Plus, ShieldCheck, Tag } from "lucide-react";
import { useMemo, useState } from "react";

import { formatCurrency } from "@/lib/format";
import type { ProductDetail } from "@/types";

import { ProductVariantSelector } from "./ProductVariantSelector";

interface ProductPurchasePanelProps {
  product: ProductDetail;
}

export function ProductPurchasePanel({ product }: ProductPurchasePanelProps) {
  const activeVariants = useMemo(
    () =>
      (product.variants ?? [])
        .filter((variant) => variant.status === "ACTIVE")
        .sort((left, right) => left.sortOrder - right.sortOrder),
    [product.variants],
  );
  const [selectedVariantId, setSelectedVariantId] = useState<number | undefined>(
    activeVariants[0]?.id,
  );
  const [quantity, setQuantity] = useState(1);
  const [voucherCode, setVoucherCode] = useState("");
  const [checkoutNotice, setCheckoutNotice] = useState<string | null>(null);
  const selectedVariant = activeVariants.find(
    (variant) => variant.id === selectedVariantId,
  );
  const isInstant = product.deliveryType === "INSTANT";
  const availableStock = selectedVariant?.stockCount ?? 0;
  const maxQuantity = isInstant ? Math.max(availableStock, 1) : 99;
  const unavailable =
    product.status !== "ACTIVE" ||
    !selectedVariant ||
    (isInstant && availableStock <= 0);

  function selectVariant(variantId: number) {
    setSelectedVariantId(variantId);
    setQuantity(1);
    setCheckoutNotice(null);
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
            Giá bán
          </p>
          <p className="mt-1 text-3xl font-black tracking-[-0.04em] text-emerald-700">
            {selectedVariant
              ? formatCurrency(Number(selectedVariant.price))
              : "Chưa cập nhật"}
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1.5 text-xs font-bold ${
            isInstant
              ? "bg-emerald-50 text-emerald-700"
              : "bg-amber-50 text-amber-700"
          }`}
        >
          {isInstant ? "Giao ngay" : "Đặt trước"}
        </span>
      </div>

      <div className="mt-7">
        <p className="mb-3 text-xs font-bold uppercase tracking-[0.06em] text-slate-600">
          Phân loại hàng
        </p>
        <ProductVariantSelector
          variants={activeVariants}
          selectedVariantId={selectedVariantId}
          onSelect={selectVariant}
        />
      </div>

      {product.deliveryType === "PRE_ORDER" && product.preOrderConfig ? (
        <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
          <p className="flex items-center gap-2 font-bold">
            <Clock3 className="size-4" />
            Xử lý trong tối đa {product.preOrderConfig.maxProcessingHours} giờ
          </p>
          {product.preOrderConfig.orderInstructions ? (
            <p className="mt-1 text-amber-800">
              {product.preOrderConfig.orderInstructions}
            </p>
          ) : null}
        </div>
      ) : null}

      <div className="mt-7">
        <div className="flex items-center justify-between gap-4">
          <p className="text-xs font-bold uppercase tracking-[0.06em] text-slate-600">
            Số lượng mua
          </p>
          <p className="text-sm text-slate-500">
            {isInstant
              ? `Kho còn: ${new Intl.NumberFormat("vi-VN").format(availableStock)}`
              : "Sản phẩm đặt trước"}
          </p>
        </div>
        <div className="mt-3 inline-flex overflow-hidden rounded-lg border border-slate-200 bg-white">
          <button
            type="button"
            onClick={() => setQuantity((current) => Math.max(1, current - 1))}
            disabled={quantity <= 1}
            className="grid size-11 place-items-center text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-35"
            aria-label="Giảm số lượng"
          >
            <Minus className="size-4" />
          </button>
          <output className="grid h-11 min-w-14 place-items-center border-x border-slate-200 px-3 text-sm font-bold text-slate-900">
            {quantity}
          </output>
          <button
            type="button"
            onClick={() =>
              setQuantity((current) => Math.min(maxQuantity, current + 1))
            }
            disabled={quantity >= maxQuantity || unavailable}
            className="grid size-11 place-items-center text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-35"
            aria-label="Tăng số lượng"
          >
            <Plus className="size-4" />
          </button>
        </div>
      </div>

      <div className="mt-6">
        <label
          htmlFor="product-voucher"
          className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.06em] text-slate-600"
        >
          <Tag className="size-4 text-emerald-600" />
          Mã giảm giá
        </label>
        <div className="mt-3 flex gap-2">
          <input
            id="product-voucher"
            value={voucherCode}
            onChange={(event) => setVoucherCode(event.target.value)}
            placeholder="Nhập voucher code"
            className="h-11 min-w-0 flex-1 rounded-lg border border-slate-200 px-3 text-sm uppercase outline-none transition placeholder:normal-case placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
          />
          <button
            type="button"
            disabled
            title="Voucher sẽ được kiểm tra tại bước thanh toán"
            className="h-11 rounded-lg bg-slate-100 px-5 text-sm font-bold text-slate-400"
          >
            Áp dụng
          </button>
        </div>
        <p className="mt-2 text-xs text-slate-400">
          Voucher sẽ được xác minh ở bước thanh toán.
        </p>
      </div>

      <button
        type="button"
        disabled={unavailable}
        onClick={() =>
          setCheckoutNotice(
            "Sản phẩm và phân loại đã được chọn. Luồng checkout sẽ được kết nối ở bước tiếp theo.",
          )
        }
        className="mt-6 inline-flex h-13 w-full items-center justify-center rounded-xl bg-emerald-600 px-5 text-sm font-black uppercase tracking-[0.05em] text-white shadow-lg shadow-emerald-600/15 transition hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-600/20 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
      >
        {unavailable ? "Sản phẩm hiện không khả dụng" : "Thanh toán mua ngay"}
      </button>

      {checkoutNotice ? (
        <p
          className="mt-3 rounded-lg bg-emerald-50 px-3 py-2.5 text-sm leading-5 text-emerald-800"
          role="status"
        >
          {checkoutNotice}
        </p>
      ) : null}

      <p className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-400">
        <ShieldCheck className="size-4 text-emerald-600" />
        Thanh toán bằng số dư ví, giao dịch được hệ thống bảo vệ
      </p>
    </section>
  );
}
