"use client";

import { AlertCircle, PackageOpen, RotateCw } from "lucide-react";

import { useProducts } from "@/hooks/api/useProducts";

import { ProductCard } from "./ProductCard";

const LATEST_PRODUCT_LIMIT = 4;

export function LatestProducts() {
  const { products, isLoading, error, refresh } = useProducts({
    page: 0,
    size: LATEST_PRODUCT_LIMIT,
  });

  if (isLoading) {
    return (
      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Đang tải sản phẩm mới nhất">
        {Array.from({ length: LATEST_PRODUCT_LIMIT }, (_, index) => (
          <div key={index} className="animate-pulse overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="aspect-[4/3] bg-slate-200" />
            <div className="space-y-3 p-4">
              <div className="h-5 w-4/5 rounded bg-slate-200" />
              <div className="h-4 w-2/3 rounded bg-slate-100" />
              <div className="h-6 w-3/5 rounded bg-slate-200" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-4 rounded-xl border border-rose-200 bg-white px-5 py-8 text-center">
        <AlertCircle className="mx-auto size-7 text-rose-500" />
        <p className="mt-2 text-sm font-semibold text-slate-800">Không thể tải sản phẩm mới nhất</p>
        <p className="mt-1 text-xs text-slate-500">{error}</p>
        <button type="button" onClick={refresh} className="mt-4 inline-flex h-9 items-center gap-2 rounded-lg bg-emerald-700 px-4 text-xs font-bold text-white hover:bg-emerald-800">
          <RotateCw className="size-3.5" />Tải lại
        </button>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-white px-5 py-8 text-center">
        <PackageOpen className="mx-auto size-8 text-emerald-600" />
        <p className="mt-2 text-sm font-semibold text-slate-700">Chưa có sản phẩm đang bán</p>
      </div>
    );
  }

  return (
    <div className="mt-4 grid items-stretch gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
