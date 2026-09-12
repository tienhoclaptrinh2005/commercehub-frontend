"use client";

import {
  Clock3,
  LoaderCircle,
  MessageSquareText,
  Minus,
  Plus,
  ShieldCheck,
  ShoppingCart,
  Tag,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";

import { useAppModal } from "@/components/ui/app-modal";
import { useAuth } from "@/hooks/auth/useAuth";
import { formatCurrency } from "@/lib/format";
import { PRE_ORDER_PROCESSING_HOURS } from "@/lib/pre-order-policy";
import { getApiErrorMessage } from "@/services/api";
import { checkoutService } from "@/services/checkout.service";
import { useCartStore } from "@/stores/cartStore";
import type { ProductDetail } from "@/types";

import { ProductVariantSelector } from "./ProductVariantSelector";

interface ProductPurchasePanelProps {
  product: ProductDetail;
}

export function ProductPurchasePanel({ product }: ProductPurchasePanelProps) {
  const router = useRouter();
  const modal = useAppModal();
  const { user, isHydrated } = useAuth();
  const addCartItem = useCartStore((state) => state.addItem);
  const activeVariants = useMemo(
    () =>
      (product.variants ?? [])
        .filter((variant) => variant.status === "ACTIVE")
        .sort((left, right) => left.sortOrder - right.sortOrder),
    [product.variants],
  );
  const [selectedVariantId, setSelectedVariantId] = useState<
    number | undefined
  >(activeVariants[0]?.id);
  const [quantity, setQuantity] = useState(1);
  const [voucherCode, setVoucherCode] = useState("");
  const buyerInputsRef = useRef("");
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [retryIdempotencyKey, setRetryIdempotencyKey] = useState<string | null>(
    null,
  );
  const selectedVariant = activeVariants.find(
    (variant) => variant.id === selectedVariantId,
  );
  const isInstant = product.deliveryType === "INSTANT";
  const isPreOrder = product.deliveryType === "PRE_ORDER";
  const availableStock = selectedVariant?.stockCount ?? 0;
  const outOfStock = Boolean(
    selectedVariant && isInstant && availableStock <= 0,
  );
  const maxQuantity = isInstant ? Math.max(availableStock, 1) : 99;
  const unavailable =
    product.status !== "ACTIVE" || !selectedVariant || outOfStock;

  function selectVariant(variantId: number) {
    setSelectedVariantId(variantId);
    setQuantity(1);
    buyerInputsRef.current = "";
    setRetryIdempotencyKey(null);
  }

  async function checkout() {
    if (!selectedVariant || unavailable || isCheckingOut) return;
    if (!isHydrated || !user) {
      router.push("/login");
      return;
    }

    const confirmed = await modal.confirm({
      title: isPreOrder ? "Xác nhận đặt hàng" : "Xác nhận mua hàng",
      description: isPreOrder
        ? "Kiểm tra thông tin và gửi yêu cầu đặt hàng tới shop."
        : "Vui lòng kiểm tra lại sản phẩm trước khi thanh toán.",
      details: (
        <>
          <OrderCheckoutSummary
            productName={product.name}
            variantName={selectedVariant.name}
            quantity={quantity}
            total={Number(selectedVariant.price) * quantity}
          />
          {isPreOrder ? (
            <PreOrderCheckoutFields
              initialValue={buyerInputsRef.current}
              onChange={(value) => {
                buyerInputsRef.current = value;
                setRetryIdempotencyKey(null);
              }}
            />
          ) : null}
        </>
      ),
      confirmLabel: isPreOrder ? "Xác nhận đặt hàng" : "Đồng ý mua",
    });
    if (!confirmed) return;

    const idempotencyKey = retryIdempotencyKey ?? crypto.randomUUID();
    setRetryIdempotencyKey(idempotencyKey);
    setIsCheckingOut(true);
    try {
      const orders = await checkoutService.checkout({
        items: [
          {
            productVariantId: selectedVariant.id,
            quantity,
            buyerInputs: isPreOrder
              ? buyerInputsRef.current.trim() || undefined
              : undefined,
          },
        ],
        paymentMethod: "WALLET",
        idempotencyKey,
      });
      setRetryIdempotencyKey(null);
      window.dispatchEvent(new Event("commercehub:wallet-updated"));
      modal.showSuccess({
        title: isPreOrder ? "Đặt hàng thành công" : "Thanh toán thành công",
        description: isPreOrder
          ? "Đơn hàng đã được gửi tới shop và đang chờ shop xác nhận xử lý."
          : "Thanh toán đã hoàn tất. Bạn có thể xem thông tin giao hàng trong lịch sử đơn hàng.",
        details: (
          <div className="space-y-2 text-center">
            {orders.map((order) => (
              <p key={order.orderCode} className="break-all">
                <span className="font-semibold text-slate-500">Mã đơn: </span>
                <Link
                  href={`/orders/${encodeURIComponent(order.orderCode)}`}
                  className="font-black text-emerald-700 transition hover:text-emerald-800 hover:underline"
                >
                  {order.orderCode}
                </Link>
              </p>
            ))}
          </div>
        ),
        confirmLabel: "Hoàn tất",
      });
    } catch (requestError) {
      // Giữ nguyên key cho nút thử lại: nếu response lần trước bị mất, backend
      // sẽ trả lại đúng order cũ thay vì trừ tiền lần hai.
      modal.showError({
        title: isPreOrder ? "Đặt hàng chưa thành công" : "Thanh toán thất bại",
        description: getApiErrorMessage(
          requestError,
          "Không thể thanh toán đơn hàng",
        ),
        details: (
          <p className="text-xs text-slate-500">
            Bạn có thể thử lại. Hệ thống giữ nguyên mã chống trừ tiền hai lần.
          </p>
        ),
        confirmLabel: "Đã hiểu",
      });
    } finally {
      setIsCheckingOut(false);
    }
  }

  async function addToCart() {
    if (!selectedVariant || unavailable || isAddingToCart) return;
    if (!isHydrated || !user) {
      router.push("/login");
      return;
    }

    setIsAddingToCart(true);
    try {
      await addCartItem(user.id, selectedVariant.id, quantity);
      modal.showSuccess({
        title: "Đã thêm vào giỏ hàng",
        description: `${product.name} — ${selectedVariant.name} đã được thêm vào giỏ.`,
        confirmLabel: "Tiếp tục mua sắm",
      });
    } catch (requestError) {
      modal.showError({
        title: "Không thể thêm vào giỏ",
        description: getApiErrorMessage(
          requestError,
          "Không thể thêm sản phẩm vào giỏ",
        ),
        confirmLabel: "Đã hiểu",
      });
    } finally {
      setIsAddingToCart(false);
    }
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
          {isInstant ? "Giao ngay" : "Đặt hàng"}
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

      <div className="mt-7">
        <div className="flex items-center justify-between gap-4">
          <p className="text-xs font-bold uppercase tracking-[0.06em] text-slate-600">
            Số lượng mua
          </p>
          <p className="text-sm text-slate-500">
            {isInstant
              ? `Kho còn: ${new Intl.NumberFormat("vi-VN").format(availableStock)}`
              : "Sản phẩm đặt hàng"}
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

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          disabled={unavailable || isAddingToCart || isCheckingOut}
          onClick={() => void addToCart()}
          className="inline-flex h-13 items-center justify-center rounded-xl border border-emerald-600 bg-white px-4 text-sm font-black uppercase tracking-[0.04em] text-emerald-700 transition hover:bg-emerald-50 disabled:cursor-not-allowed disabled:border-slate-300 disabled:text-slate-400"
        >
          {isAddingToCart ? (
            <LoaderCircle className="mr-2 size-4 animate-spin" />
          ) : (
            <ShoppingCart className="mr-2 size-4" />
          )}
          Thêm vào giỏ
        </button>
        <button
          type="button"
          disabled={unavailable || isCheckingOut || isAddingToCart}
          onClick={() => void checkout()}
          className="inline-flex h-13 items-center justify-center rounded-xl bg-emerald-600 px-4 text-sm font-black uppercase tracking-[0.04em] text-white shadow-lg shadow-emerald-600/15 transition hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-600/20 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
        >
          {isCheckingOut ? (
            <>
              <LoaderCircle className="mr-2 size-4 animate-spin" />
              {isPreOrder ? "Đang đặt hàng..." : "Đang thanh toán..."}
            </>
          ) : outOfStock ? (
            "Hết hàng"
          ) : unavailable ? (
            "Ngừng bán"
          ) : isPreOrder ? (
            "Đặt hàng"
          ) : (
            "Mua ngay"
          )}
        </button>
      </div>

      <p className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-400">
        <ShieldCheck className="size-4 text-emerald-600" />
        Thanh toán bằng số dư ví, giao dịch được hệ thống bảo vệ
      </p>
    </section>
  );
}

function OrderCheckoutSummary({
  productName,
  variantName,
  quantity,
  total,
}: {
  productName: string;
  variantName: string;
  quantity: number;
  total: number;
}) {
  return (
    <dl className="space-y-1.5">
      <div className="flex justify-between gap-4">
        <dt className="text-slate-500">Sản phẩm</dt>
        <dd className="text-right font-bold text-slate-900">{productName}</dd>
      </div>
      <div className="flex justify-between gap-4">
        <dt className="text-slate-500">Phân loại</dt>
        <dd className="text-right font-semibold">{variantName}</dd>
      </div>
      <div className="flex justify-between gap-4">
        <dt className="text-slate-500">Số lượng</dt>
        <dd className="font-semibold">{quantity}</dd>
      </div>
      <div className="flex justify-between gap-4 border-t border-slate-200 pt-2">
        <dt className="font-bold text-slate-700">Tổng tiền</dt>
        <dd className="font-black text-emerald-700">{formatCurrency(total)}</dd>
      </div>
    </dl>
  );
}

function PreOrderCheckoutFields({
  initialValue,
  onChange,
}: {
  initialValue: string;
  onChange: (value: string) => void;
}) {
  const [value, setValue] = useState(initialValue);

  return (
    <div className="mt-4 border-t border-slate-200 pt-4">
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-3 text-amber-900">
        <p className="flex items-center gap-2 font-bold">
          <Clock3 className="size-4 shrink-0" />
          Xử lý trong tối đa {PRE_ORDER_PROCESSING_HOURS} giờ sau khi shop nhận đơn
        </p>
        <p className="mt-1 text-xs leading-5 text-amber-800">
          Đây là sản phẩm dịch vụ (đặt hàng). Sau khi thanh toán, vui lòng liên
          hệ shop hoặc đợi shop hoàn thành đơn.
        </p>
      </div>

      <label
        htmlFor="pre-order-checkout-buyer-inputs"
        className="mt-4 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.05em] text-slate-700"
      >
        <MessageSquareText className="size-4 text-emerald-600" />
        Thông tin gửi shop
        <span className="font-normal normal-case tracking-normal text-slate-400">
          (không bắt buộc)
        </span>
      </label>
      <textarea
        id="pre-order-checkout-buyer-inputs"
        value={value}
        onChange={(event) => {
          const nextValue = event.target.value;
          setValue(nextValue);
          onChange(nextValue);
        }}
        rows={3}
        maxLength={100}
        placeholder="Nhập email hoặc vài dòng nhắn cho shop..."
        className="mt-2 w-full resize-y rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
      />
      <p className="mt-1 text-right text-[11px] text-slate-400">
        {value.length}/100 ký tự
      </p>
    </div>
  );
}
