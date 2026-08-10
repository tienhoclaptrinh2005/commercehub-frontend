import { ImageIcon, PackageCheck } from "lucide-react";
import Link from "next/link";

import { formatCurrency } from "@/lib/format";
import type { ProductSummary } from "@/types";

interface ProductCardProps {
  product: ProductSummary;
  isPreview?: boolean;
  sellerHandle?: string;
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

function getDurationLabel(product: ProductSummary): string | null {
  const durations = (product.variants ?? [])
    .filter((variant) => variant.status === "ACTIVE" && variant.durationDays)
    .map((variant) => Number(variant.durationDays));

  if (durations.length === 0) return null;

  const minDuration = Math.min(...durations);
  const maxDuration = Math.max(...durations);
  return minDuration === maxDuration ? `${minDuration} ngày` : `${minDuration}–${maxDuration} ngày`;
}

export function ProductCard({ product, isPreview = false, sellerHandle }: ProductCardProps) {
  const imageUrl = product.thumbnailUrl || product.imageUrls?.[0];
  const durationLabel = getDurationLabel(product);
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
      {isPreview ? (
        <div className="relative block aspect-[4/3] overflow-hidden bg-[#d1e4fb]" aria-label="Ảnh sản phẩm mẫu">
          {media}
        </div>
      ) : (
        <Link href={`/products/${product.slug}`} className="relative block aspect-[4/3] overflow-hidden bg-[#d1e4fb]">
          {media}
        </Link>
      )}

      <div className="flex flex-1 flex-col p-4">
        {isPreview ? (
          <p className="line-clamp-2 min-h-12 text-base font-bold leading-6 text-slate-950">{product.name}</p>
        ) : (
          <Link
            href={`/products/${product.slug}`}
            className="line-clamp-2 min-h-12 text-base font-bold leading-6 text-slate-950 transition group-hover:text-emerald-700"
          >
            {product.name}
          </Link>
        )}

        <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1">
            <PackageCheck className="size-3.5 text-emerald-600" />
            Đã bán {new Intl.NumberFormat("vi-VN").format(product.soldCount ?? 0)}
          </span>
          {durationLabel ? (
            <>
              <span className="size-1 rounded-full bg-slate-300" />
              <span>{durationLabel}</span>
            </>
          ) : null}
        </div>

        <p className="mt-2 truncate text-xs text-slate-500">
          Người bán:{" "}
          <span className="font-semibold text-emerald-700">
            {sellerHandle ? `@${sellerHandle}` : product.shopName}
          </span>
        </p>

        <p className="mt-auto pt-4 text-lg font-bold tracking-[-0.02em] text-emerald-700">
          {formatPriceRange(product)}
        </p>
      </div>
    </article>
  );
}
