import {
  ImageIcon,
  PackageCheck,
  ShoppingCart,
  Star,
} from "lucide-react";
import Link from "next/link";

import { formatCurrency } from "@/lib/format";
import type { ProductSummary } from "@/types";

interface ProductCardProps {
  product: ProductSummary;
  sellerHandle?: string;
  variant?: "profile" | "catalog";
}

function getActivePrices(product: ProductSummary): number[] {
  const prices = (product.variants ?? [])
    .filter((variant) => variant.status === "ACTIVE")
    .map((variant) => Number(variant.price))
    .filter((price) => Number.isFinite(price));

  if (prices.length > 0) return prices;
  return [Number(product.minPrice ?? 0)];
}

function formatPriceRange(product: ProductSummary): string {
  const prices = getActivePrices(product);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  if (minPrice === maxPrice) return formatCurrency(minPrice);
  return `${formatCurrency(minPrice)} – ${formatCurrency(maxPrice)}`;
}

function getProductTypeLabel(productType: string): string {
  if (productType === "ACCOUNT") return "Tài khoản";
  if (productType === "OTHER") return "Sản phẩm";
  return productType.replaceAll("_", " ");
}

function getSellerInitial(shopName: string): string {
  return shopName.trim().charAt(0).toUpperCase() || "S";
}

function formatAverageRating(value: number | null | undefined): string {
  const rating = Number(value ?? 5);
  if (!Number.isFinite(rating)) return "5.0";
  return Math.max(0, Math.min(5, rating)).toFixed(1);
}

export function ProductCard({
  product,
  sellerHandle,
  variant = "profile",
}: ProductCardProps) {
  const imageUrl = product.thumbnailUrl;
  const sellerUsername = sellerHandle || product.sellerUsername;
  const sellerProfileHref = sellerUsername
    ? `/users/${encodeURIComponent(sellerUsername)}`
    : null;

  if (variant === "catalog") {
    return (
      <article className="group flex h-[472px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-xl hover:shadow-slate-950/10">
        <Link
          href={`/products/${product.slug}`}
          className="relative block h-48 shrink-0 overflow-hidden border-b border-slate-100 bg-slate-100"
        >
          {imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt={product.name}
              className="size-full object-cover transition duration-300 group-hover:scale-[1.03]"
            />
          ) : (
            <span className="grid size-full place-items-center bg-gradient-to-br from-slate-100 to-emerald-50 text-emerald-900/20">
              <ImageIcon className="size-14" strokeWidth={1.4} />
            </span>
          )}

          <span
            className={`absolute left-2.5 top-2.5 rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.04em] text-white shadow-sm ${
              product.deliveryType === "INSTANT"
                ? "bg-emerald-500"
                : "bg-amber-500"
            }`}
          >
            {product.deliveryType === "INSTANT" ? "Giao ngay" : "Đặt trước"}
          </span>
        </Link>

        <div className="flex flex-1 flex-col p-4">
          <div className="flex min-h-12 items-start justify-between gap-2">
            <Link
              href={`/products/${product.slug}`}
              className="line-clamp-2 text-base font-bold leading-5 text-slate-950 transition group-hover:text-emerald-700"
            >
              {product.name}
            </Link>
            <span className="shrink-0 rounded bg-emerald-50 px-2 py-1 text-[9px] font-bold uppercase tracking-[0.04em] text-emerald-700">
              {getProductTypeLabel(product.productType)}
            </span>
          </div>

          <div className="mt-2.5 flex min-w-0 items-center gap-1.5 text-xs text-slate-500">
            <span className="text-[10px] uppercase">Người bán:</span>
            <span className="grid size-5 shrink-0 place-items-center overflow-hidden rounded-full bg-emerald-600 text-[8px] font-bold text-white">
              {product.sellerAvatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={product.sellerAvatarUrl}
                  alt=""
                  className="size-full object-cover"
                />
              ) : (
                getSellerInitial(product.shopName || "Shop")
              )}
            </span>
            {sellerProfileHref ? (
              <Link
                href={sellerProfileHref}
                className="truncate font-semibold text-slate-700 transition hover:text-emerald-700 hover:underline"
              >
                {product.shopName || `@${sellerUsername}`}
              </Link>
            ) : (
              <span className="truncate font-semibold text-slate-700">
                {product.shopName || "Người bán"}
              </span>
            )}
          </div>

          <div className="mt-4 grid grid-cols-3 rounded-lg bg-slate-50 px-2 py-2.5 text-center">
            <ProductMetric label="Trong kho" value={product.stockCount ?? 0} />
            <ProductMetric label="Đã bán" value={product.soldCount ?? 0} />
            <div className="border-l border-slate-200 px-1">
              <p className="text-[9px] font-medium uppercase tracking-[0.04em] text-slate-400">
                Đánh giá
              </p>
              <p
                className="mt-1 inline-flex items-center justify-center gap-1 text-xs font-bold text-amber-500"
                title={`${new Intl.NumberFormat("vi-VN").format(product.reviewCount ?? 0)} đánh giá`}
              >
                <Star className="size-3 fill-current" />
                {formatAverageRating(product.averageRating)}
              </p>
            </div>
          </div>

          <div className="mt-auto border-t border-slate-100 pt-4">
            <p className="min-h-7 text-lg font-bold tracking-[-0.025em] text-emerald-800">
              {formatPriceRange(product)}
            </p>
            <div className="mt-4 flex gap-2">
              <Link
                href={`/products/${product.slug}`}
                className="inline-flex h-10 flex-1 items-center justify-center rounded-lg bg-emerald-500 px-4 text-sm font-bold uppercase tracking-[0.04em] text-white transition hover:bg-emerald-600 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/20"
              >
                {product.deliveryType === "PRE_ORDER" ? "Đặt hàng" : "Mua ngay"}
              </Link>
              <Link
                href={`/products/${product.slug}`}
                className="grid size-10 shrink-0 place-items-center rounded-lg border border-emerald-500 text-emerald-600 transition hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/20"
                aria-label={`Xem ${product.name} để thêm vào giỏ hàng`}
                title="Xem sản phẩm để thêm vào giỏ"
              >
                <ShoppingCart className="size-4" />
              </Link>
            </div>
          </div>
        </div>
      </article>
    );
  }

  const media = (
    <>
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt={product.name}
          className="size-full object-cover transition duration-300 group-hover:scale-[1.03]"
        />
      ) : (
        <span className="grid size-full place-items-center text-emerald-900/25">
          <ImageIcon className="size-12" strokeWidth={1.5} />
        </span>
      )}

      <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.06em] text-emerald-800 shadow-sm backdrop-blur-sm">
        {product.deliveryType === "INSTANT" ? "Giao ngay" : "Đặt trước"}
      </span>
    </>
  );

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition duration-200 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-xl hover:shadow-slate-950/5">
      <Link href={`/products/${product.slug}`} className="relative block aspect-[4/3] overflow-hidden bg-[#d1e4fb]">
        {media}
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <Link
          href={`/products/${product.slug}`}
          className="line-clamp-2 min-h-12 text-base font-bold leading-6 text-slate-950 transition group-hover:text-emerald-700"
        >
          {product.name}
        </Link>

        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1">
            <PackageCheck className="size-3.5 text-emerald-600" />
            Đã bán {new Intl.NumberFormat("vi-VN").format(product.soldCount ?? 0)}
          </span>
          <span className="size-1 rounded-full bg-slate-300" />
          <span
            className="inline-flex items-center gap-1 font-semibold text-amber-500"
            title={`${new Intl.NumberFormat("vi-VN").format(product.reviewCount ?? 0)} đánh giá`}
          >
            <Star className="size-3.5 fill-current" />
            {formatAverageRating(product.averageRating)}
          </span>
        </div>

        <p className="mt-2 truncate text-xs text-slate-500">
          Người bán:{" "}
          {sellerProfileHref ? (
            <Link
              href={sellerProfileHref}
              className="font-semibold text-emerald-700 transition hover:text-emerald-800 hover:underline"
            >
              {sellerUsername ? `@${sellerUsername}` : product.shopName}
            </Link>
          ) : (
            <span className="font-semibold text-emerald-700">
              {product.shopName || "Chưa cập nhật"}
            </span>
          )}
        </p>

        <p className="mt-auto pt-4 text-lg font-bold tracking-[-0.02em] text-emerald-700">
          {formatPriceRange(product)}
        </p>
      </div>
    </article>
  );
}

function ProductMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="border-l border-slate-200 px-1 first:border-l-0">
      <p className="text-[9px] font-medium uppercase tracking-[0.04em] text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-xs font-semibold text-slate-800">
        {new Intl.NumberFormat("vi-VN").format(value)}
      </p>
    </div>
  );
}
