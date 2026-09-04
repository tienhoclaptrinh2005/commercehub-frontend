import {
  Clock3,
  ImageIcon,
  MessageSquareText,
  Minus,
  Plus,
  Trash2,
} from "lucide-react";
import Link from "next/link";

import { formatCurrency } from "@/lib/format";
import type { CartItem as CartItemData } from "@/types";

interface CartItemProps {
  item: CartItemData;
  buyerInput: string;
  busy: boolean;
  onBuyerInputChange: (value: string) => void;
  onQuantityChange: (quantity: number) => void;
  onRemove: () => void;
}

export function CartItem({
  item,
  buyerInput,
  busy,
  onBuyerInputChange,
  onQuantityChange,
  onRemove,
}: CartItemProps) {
  const isInstant = item.deliveryType === "INSTANT";
  const outOfStock = isInstant && item.stockCount < item.quantity;
  const maxQuantity = isInstant ? Math.max(item.stockCount, 1) : 1000;

  return (
    <article className="p-4 sm:p-5">
      <div className="flex gap-4">
        <Link
          href={`/products/${item.productSlug}`}
          className="grid size-24 shrink-0 place-items-center overflow-hidden rounded-xl bg-slate-100 sm:size-28"
        >
          {item.thumbnailUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.thumbnailUrl}
              alt={item.productName}
              className="size-full object-cover"
            />
          ) : (
            <ImageIcon className="size-8 text-slate-300" />
          )}
        </Link>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <span
                className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.06em] ${
                  isInstant
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-amber-50 text-amber-700"
                }`}
              >
                {isInstant ? "Giao ngay" : "Đặt hàng"}
              </span>
              <Link
                href={`/products/${item.productSlug}`}
                className="mt-2 block line-clamp-2 font-bold leading-6 text-slate-950 transition hover:text-emerald-700"
              >
                {item.productName}
              </Link>
              <p className="mt-1 text-sm text-slate-500">Phân loại: {item.variantName}</p>
            </div>
            <button
              type="button"
              onClick={onRemove}
              disabled={busy}
              className="grid size-9 shrink-0 place-items-center rounded-lg text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 disabled:opacity-40"
              aria-label={`Xóa ${item.productName}`}
            >
              <Trash2 className="size-4" />
            </button>
          </div>

          {!item.available ? (
            <p className="mt-2 rounded-lg bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700">
              {outOfStock
                ? "Sản phẩm đã hết hàng hoặc không đủ số lượng. Vui lòng xóa khỏi giỏ hàng."
                : "Sản phẩm đã ngừng bán. Vui lòng xóa khỏi giỏ hàng."}
            </p>
          ) : null}

          <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs text-slate-400">Đơn giá</p>
              <p className="mt-1 text-sm font-bold text-emerald-700">
                {formatCurrency(Number(item.unitPrice))}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="inline-flex overflow-hidden rounded-lg border border-slate-200">
                <button
                  type="button"
                  onClick={() => onQuantityChange(item.quantity - 1)}
                  disabled={busy || item.quantity <= 1}
                  className="grid size-9 place-items-center text-slate-500 transition hover:bg-slate-50 disabled:opacity-35"
                  aria-label="Giảm số lượng"
                >
                  <Minus className="size-3.5" />
                </button>
                <output className="grid min-w-10 place-items-center border-x border-slate-200 px-2 text-sm font-bold">
                  {item.quantity}
                </output>
                <button
                  type="button"
                  onClick={() => onQuantityChange(item.quantity + 1)}
                  disabled={busy || item.quantity >= maxQuantity || !item.available}
                  className="grid size-9 place-items-center text-slate-500 transition hover:bg-slate-50 disabled:opacity-35"
                  aria-label="Tăng số lượng"
                >
                  <Plus className="size-3.5" />
                </button>
              </div>
              <p className="min-w-28 text-right font-black text-slate-950">
                {formatCurrency(Number(item.lineTotal))}
              </p>
            </div>
          </div>
        </div>
      </div>

      {!isInstant ? (
        <div className="mt-4 border-t border-slate-100 pt-4">
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
            <p className="flex items-center gap-2 font-bold">
              <Clock3 className="size-4 shrink-0" />
              Xử lý trong tối đa {item.maxProcessingHours ?? 24} giờ
            </p>
            <p className="mt-1">
              Đây là sản phẩm dịch vụ (đặt hàng). Sau khi thanh toán, vui lòng liên hệ shop hoặc đợi shop hoàn thành đơn.
            </p>
          </div>

          <label
            htmlFor={`buyer-input-${item.id}`}
            className="mt-4 flex items-center gap-2 text-sm font-bold text-slate-800"
          >
            <MessageSquareText className="size-4 text-emerald-600" />
            Thông tin gửi shop
            <span className="font-normal text-slate-400">(không bắt buộc)</span>
          </label>
          <textarea
            id={`buyer-input-${item.id}`}
            value={buyerInput}
            onChange={(event) => onBuyerInputChange(event.target.value)}
            maxLength={100}
            rows={3}
            placeholder="Ví dụ: email@example.com — Nhờ shop xử lý theo yêu cầu..."
            className="mt-2 w-full resize-y rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
          />
          <p className="mt-1 text-right text-[11px] text-slate-400">
            {buyerInput.length}/100 ký tự
          </p>
        </div>
      ) : null}
    </article>
  );
}
