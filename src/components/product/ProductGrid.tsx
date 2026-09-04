import { AlertCircle, PackageOpen, RotateCw } from "lucide-react";

import type { ProductSummary } from "@/types";

import { ProductCard } from "./ProductCard";

interface ProductGridProps {
  products: ProductSummary[];
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  hasFilters?: boolean;
  catalogLabel?: "sản phẩm" | "dịch vụ";
}

export function ProductGrid({
  products,
  isLoading,
  error,
  onRetry,
  hasFilters = false,
  catalogLabel = "sản phẩm",
}: ProductGridProps) {
  if (isLoading) {
    return (
      <div
        className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
        aria-label={`Đang tải ${catalogLabel}`}
      >
        {Array.from({ length: 6 }, (_, index) => (
          <div
            key={index}
            className="h-[472px] animate-pulse overflow-hidden rounded-2xl border border-slate-200 bg-white"
          >
            <div className="h-48 bg-slate-200" />
            <div className="space-y-4 p-4">
              <div className="h-5 w-4/5 rounded bg-slate-200" />
              <div className="h-4 w-2/3 rounded bg-slate-100" />
              <div className="h-14 rounded-lg bg-slate-100" />
              <div className="h-7 w-3/5 rounded bg-slate-200" />
              <div className="h-10 rounded-lg bg-slate-200" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-white px-6 py-14 text-center shadow-sm">
        <span className="mx-auto grid size-12 place-items-center rounded-full bg-rose-50 text-rose-600">
          <AlertCircle className="size-6" />
        </span>
        <h2 className="mt-4 text-lg font-bold text-slate-950">
          Không thể tải {catalogLabel}
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
          {error}
        </p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-emerald-700 px-4 text-sm font-bold text-white transition hover:bg-emerald-800"
        >
          <RotateCw className="size-4" />
          Tải lại
        </button>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
        <span className="mx-auto grid size-14 place-items-center rounded-full bg-emerald-50 text-emerald-700">
          <PackageOpen className="size-7" />
        </span>
        <h2 className="mt-4 text-lg font-bold text-slate-950">
          {hasFilters
            ? `Không tìm thấy ${catalogLabel} phù hợp`
            : `Chưa có ${catalogLabel}`}
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
          {hasFilters
            ? "Hãy thử thay đổi từ khóa, danh mục hoặc khoảng giá."
            : `${catalogLabel === "dịch vụ" ? "Dịch vụ" : "Sản phẩm"} mới sẽ được hiển thị tại đây khi người bán đăng bán.`}
        </p>
      </div>
    );
  }

  return (
    <div className="grid items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} variant="catalog" />
      ))}
    </div>
  );
}
