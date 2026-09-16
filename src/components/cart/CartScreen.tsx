"use client";

import { ChevronRight, LoaderCircle, Store, Tag } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { useAppModal } from "@/components/ui/app-modal";
import { useCart } from "@/hooks/api/useCart";
import { formatCurrency } from "@/lib/format";
import { getApiErrorMessage } from "@/services/api";
import { voucherService } from "@/services/voucher.service";
import type { CartItem as CartItemData, CartDeliveryType, VoucherPreview } from "@/types";

import { CartEmpty } from "./CartEmpty";
import { CartItem } from "./CartItem";
import { CartSummary } from "./CartSummary";

interface ShopCartGroup {
  shopId: number;
  shopName: string;
  instant: CartItemData[];
  preOrder: CartItemData[];
}

export function CartScreen() {
  const router = useRouter();
  const modal = useAppModal();
  const {
    cart,
    user,
    isHydrated,
    isLoading,
    isMutating,
    error,
    clearError,
    updateQuantity,
    removeItem,
    clearCart,
    checkout,
  } = useCart();
  const [buyerInputs, setBuyerInputs] = useState<Record<number, string>>({});
  const [retryKey, setRetryKey] = useState<string | null>(null);
  const [voucherCodes, setVoucherCodes] = useState<Record<string, string>>({});
  const [voucherPreviews, setVoucherPreviews] = useState<Record<string, VoucherPreview>>({});
  const [applyingVoucherKey, setApplyingVoucherKey] = useState<string | null>(null);

  useEffect(() => {
    if (isHydrated && !user) router.replace("/login");
  }, [isHydrated, router, user]);

  useEffect(() => {
    if (!error) return;
    modal.showError({
      title: "Không thể xử lý giỏ hàng",
      description: error,
      confirmLabel: "Đã hiểu",
    });
    clearError();
  }, [clearError, error, modal]);

  const shopGroups = useMemo(() => {
    const groups = new Map<number, ShopCartGroup>();
    for (const item of cart.items) {
      const group = groups.get(item.shopId) ?? {
        shopId: item.shopId,
        shopName: item.shopName,
        instant: [],
        preOrder: [],
      };
      if (item.deliveryType === "INSTANT") group.instant.push(item);
      else group.preOrder.push(item);
      groups.set(item.shopId, group);
    }
    return Array.from(groups.values()).sort((a, b) =>
      a.shopName.localeCompare(b.shopName, "vi"),
    );
  }, [cart.items]);

  const hasUnavailableItems = cart.items.some((item) => !item.available);
  const voucherDiscount = Object.values(voucherPreviews).reduce(
    (total, preview) => total + Number(preview.discountAmount),
    0,
  );
  const payableAmount = Math.max(0, Number(cart.totalAmount) - voucherDiscount);

  async function changeQuantity(item: CartItemData, quantity: number) {
    if (quantity < 1 || isMutating) return;
    setRetryKey(null);
    setVoucherPreviews({});
    clearError();
    try {
      await updateQuantity(item.id, quantity);
    } catch {
      // Store đã cung cấp thông báo lỗi dùng chung cho trang.
    }
  }

  async function remove(itemId: number) {
    if (isMutating) return;
    setRetryKey(null);
    setVoucherPreviews({});
    clearError();
    try {
      await removeItem(itemId);
      setBuyerInputs((current) => {
        const next = { ...current };
        const removedItem = cart.items.find((item) => item.id === itemId);
        if (removedItem) delete next[removedItem.productVariantId];
        return next;
      });
    } catch {
      // Store đã cung cấp thông báo lỗi dùng chung cho trang.
    }
  }

  async function clearAll() {
    if (isMutating) return;
    const confirmed = await modal.confirm({
      title: "Xóa toàn bộ giỏ hàng?",
      description: "Tất cả sản phẩm và nội dung bạn đã nhập cho shop sẽ bị xóa khỏi giỏ.",
      confirmLabel: "Xóa giỏ hàng",
      cancelLabel: "Giữ lại",
      danger: true,
    });
    if (!confirmed) return;

    setRetryKey(null);
    clearError();
    try {
      await clearCart();
      setBuyerInputs({});
      setVoucherCodes({});
      setVoucherPreviews({});
      modal.showSuccess({
        title: "Đã xóa giỏ hàng",
        description: "Toàn bộ sản phẩm đã được xóa khỏi giỏ hàng của bạn.",
      });
    } catch {
      // Store đã cung cấp thông báo lỗi dùng chung cho trang.
    }
  }

  async function applyVoucher(group: ShopCartGroup, deliveryType: CartDeliveryType) {
    const key = voucherGroupKey(group.shopId, deliveryType);
    const code = (voucherCodes[key] ?? "").trim();
    const items = deliveryType === "INSTANT" ? group.instant : group.preOrder;
    if (!code || items.length === 0 || applyingVoucherKey) return;
    setApplyingVoucherKey(key);
    try {
      const preview = await voucherService.preview({
        shopId: group.shopId,
        deliveryType,
        code,
        items: items.map((item) => ({
          productVariantId: item.productVariantId,
          quantity: item.quantity,
        })),
      });
      setVoucherCodes((current) => ({ ...current, [key]: preview.code }));
      setVoucherPreviews((current) => ({ ...current, [key]: preview }));
      setRetryKey(null);
    } catch (requestError) {
      setVoucherPreviews((current) => {
        const next = { ...current };
        delete next[key];
        return next;
      });
      modal.showError({
        title: "Không thể áp dụng mã",
        description: getApiErrorMessage(requestError, "Mã giảm giá không hợp lệ"),
        confirmLabel: "Đã hiểu",
      });
    } finally {
      setApplyingVoucherKey(null);
    }
  }

  async function checkoutAll() {
    if (isMutating || cart.items.length === 0 || hasUnavailableItems) return;
    const confirmed = await modal.confirm({
      title: "Xác nhận thanh toán giỏ hàng",
      description: "Hệ thống sẽ tự tách đơn theo từng shop và hình thức giao hàng.",
      details: (
        <dl className="space-y-1.5">
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">Số lượng</dt>
            <dd className="font-bold">{cart.totalQuantity} sản phẩm</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-slate-500">Gian hàng</dt>
            <dd className="font-bold">{shopGroups.length}</dd>
          </div>
          <div className="flex justify-between gap-4 border-t border-slate-200 pt-2">
            <dt className="font-bold text-slate-700">Tổng thanh toán</dt>
            <dd className="font-black text-emerald-700">
              {formatCurrency(payableAmount)}
            </dd>
          </div>
        </dl>
      ),
      confirmLabel: "Đồng ý thanh toán",
    });
    if (!confirmed) return;

    const idempotencyKey = retryKey ?? crypto.randomUUID();
    setRetryKey(idempotencyKey);
    clearError();
    try {
      const orders = await checkout({
        idempotencyKey,
        buyerInputs: cart.items
          .filter((item) => item.deliveryType === "PRE_ORDER")
          .map((item) => ({
            productVariantId: item.productVariantId,
            buyerInputs: (buyerInputs[item.productVariantId] ?? "").trim(),
          }))
          .filter((input) => input.buyerInputs.length > 0),
        vouchers: Object.entries(voucherPreviews).map(([key, preview]) => {
          const [shopId, deliveryType] = key.split(":");
          return {
            shopId: Number(shopId),
            deliveryType: deliveryType as CartDeliveryType,
            code: preview.code,
          };
        }),
      });
      setRetryKey(null);
      setBuyerInputs({});
      setVoucherCodes({});
      setVoucherPreviews({});
      window.dispatchEvent(new Event("commercehub:wallet-updated"));
      modal.showSuccess({
        title: "Thanh toán giỏ hàng thành công",
        description: "Giỏ hàng đã được tách thành các đơn tương ứng và gửi tới từng shop.",
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
    } catch {
      // Giữ idempotency key để người dùng thử lại mà không tạo giao dịch trùng.
    }
  }

  if (!isHydrated || (user && isLoading)) {
    return (
      <div className="mx-auto grid min-h-[420px] max-w-[1200px] place-items-center px-4">
        <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500">
          <LoaderCircle className="size-5 animate-spin text-emerald-600" />
          Đang tải giỏ hàng...
        </span>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 sm:py-10">
      <nav className="flex items-center gap-2 text-sm" aria-label="Breadcrumb">
        <Link href="/" className="font-semibold text-emerald-700 hover:text-emerald-800">
          Trang chủ
        </Link>
        <ChevronRight className="size-3.5 text-slate-400" />
        <span className="font-medium text-slate-500">Giỏ hàng</span>
      </nav>

      <div className="mt-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-black tracking-[-0.04em] text-slate-950 sm:text-4xl">
            Giỏ hàng của bạn
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            {cart.totalQuantity} sản phẩm từ {shopGroups.length} gian hàng
          </p>
        </div>
        {cart.items.length > 0 ? (
          <Link href="/products" className="text-sm font-bold text-emerald-700 hover:underline">
            Tiếp tục mua sắm
          </Link>
        ) : null}
      </div>

      {cart.items.length === 0 ? (
        <div className="mt-8">
          <CartEmpty />
        </div>
      ) : (
        <div className="mt-8 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-6">
            {shopGroups.map((group) => (
              <section
                key={group.shopId}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
              >
                <header className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-4 py-3.5 sm:px-5">
                  <Store className="size-4 text-emerald-600" />
                  <h2 className="font-black text-slate-900">{group.shopName}</h2>
                  <span className="ml-auto text-xs text-slate-400">
                    {group.instant.length + group.preOrder.length} sản phẩm
                  </span>
                </header>

                {group.instant.length > 0 ? (
                  <div>
                    <h3 className="border-b border-slate-100 px-4 py-2.5 text-xs font-black uppercase tracking-[0.06em] text-emerald-700 sm:px-5">
                      Giao ngay
                    </h3>
                    <div className="divide-y divide-slate-100">
                      {group.instant.map((item) => (
                        <CartItem
                          key={item.id}
                          item={item}
                          buyerInput=""
                          busy={isMutating}
                          onBuyerInputChange={() => undefined}
                          onQuantityChange={(quantity) => void changeQuantity(item, quantity)}
                          onRemove={() => void remove(item.id)}
                        />
                      ))}
                    </div>
                    <CartVoucherEntry
                      value={voucherCodes[voucherGroupKey(group.shopId, "INSTANT")] ?? ""}
                      preview={voucherPreviews[voucherGroupKey(group.shopId, "INSTANT")]}
                      busy={applyingVoucherKey === voucherGroupKey(group.shopId, "INSTANT")}
                      onChange={(value) => {
                        const key = voucherGroupKey(group.shopId, "INSTANT");
                        setVoucherCodes((current) => ({ ...current, [key]: value }));
                        setVoucherPreviews((current) => {
                          const next = { ...current };
                          delete next[key];
                          return next;
                        });
                        setRetryKey(null);
                      }}
                      onApply={() => void applyVoucher(group, "INSTANT")}
                    />
                  </div>
                ) : null}

                {group.preOrder.length > 0 ? (
                  <div>
                    <h3 className="border-y border-slate-100 bg-amber-50/40 px-4 py-2.5 text-xs font-black uppercase tracking-[0.06em] text-amber-700 first:border-t-0 sm:px-5">
                      Sản phẩm đặt hàng
                    </h3>
                    <div className="divide-y divide-slate-100">
                      {group.preOrder.map((item) => (
                        <CartItem
                          key={item.id}
                          item={item}
                          buyerInput={buyerInputs[item.productVariantId] ?? ""}
                          busy={isMutating}
                          onBuyerInputChange={(value) => {
                            setRetryKey(null);
                            setBuyerInputs((current) => ({
                              ...current,
                              [item.productVariantId]: value,
                            }));
                          }}
                          onQuantityChange={(quantity) => void changeQuantity(item, quantity)}
                          onRemove={() => void remove(item.id)}
                        />
                      ))}
                    </div>
                    <CartVoucherEntry
                      value={voucherCodes[voucherGroupKey(group.shopId, "PRE_ORDER")] ?? ""}
                      preview={voucherPreviews[voucherGroupKey(group.shopId, "PRE_ORDER")]}
                      busy={applyingVoucherKey === voucherGroupKey(group.shopId, "PRE_ORDER")}
                      onChange={(value) => {
                        const key = voucherGroupKey(group.shopId, "PRE_ORDER");
                        setVoucherCodes((current) => ({ ...current, [key]: value }));
                        setVoucherPreviews((current) => {
                          const next = { ...current };
                          delete next[key];
                          return next;
                        });
                        setRetryKey(null);
                      }}
                      onApply={() => void applyVoucher(group, "PRE_ORDER")}
                    />
                  </div>
                ) : null}
              </section>
            ))}
          </div>

          <CartSummary
            cart={cart}
            busy={isMutating}
            hasUnavailableItems={hasUnavailableItems}
            voucherDiscount={voucherDiscount}
            payableAmount={payableAmount}
            onCheckout={() => void checkoutAll()}
            onClear={() => void clearAll()}
          />
        </div>
      )}
    </div>
  );
}

function voucherGroupKey(shopId: number, deliveryType: CartDeliveryType) {
  return `${shopId}:${deliveryType}`;
}

function CartVoucherEntry({
  value,
  preview,
  busy,
  onChange,
  onApply,
}: {
  value: string;
  preview?: VoucherPreview;
  busy: boolean;
  onChange: (value: string) => void;
  onApply: () => void;
}) {
  return (
    <div className="border-t border-dashed border-slate-200 bg-slate-50/60 px-4 py-3.5 sm:px-5">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.05em] text-slate-600">
        <Tag className="size-4 text-emerald-600" />
        Mã giảm giá cho nhóm đơn này
      </div>
      <div className="mt-2 flex gap-2">
        <input
          value={value}
          onChange={(event) => onChange(event.target.value.toUpperCase())}
          placeholder="Ví dụ: SALE10"
          className="h-10 min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold uppercase outline-none focus:border-emerald-500"
        />
        <button
          type="button"
          disabled={!value.trim() || busy}
          onClick={onApply}
          className="h-10 rounded-lg bg-emerald-600 px-4 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {busy ? "Đang kiểm tra..." : "Áp dụng"}
        </button>
      </div>
      {preview ? (
        <p className="mt-2 text-xs font-semibold text-emerald-700">
          Đã giảm {formatCurrency(preview.discountAmount)} · Nhóm đơn còn {formatCurrency(preview.totalAmount)}
        </p>
      ) : null}
    </div>
  );
}
