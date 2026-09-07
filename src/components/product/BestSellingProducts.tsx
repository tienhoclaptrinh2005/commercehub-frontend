"use client";

import {
  AlertCircle,
  ChevronRight,
  Flame,
  PackageOpen,
  RotateCw,
} from "lucide-react";
import Link from "next/link";

import { useBestSellingProducts } from "@/hooks/api/useBestSellingProducts";

import { ProductCard } from "./ProductCard";

const BEST_SELLING_LIMIT = 4;

export function BestSellingProducts() {
  const { products, isLoading, error, refresh } = useBestSellingProducts(BEST_SELLING_LIMIT);

  return (
    <section className="mt-10" aria-labelledby="best-selling-title">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.12em] text-orange-600">
            <Flame className="size-4 fill-orange-100" aria-hidden="true" />
            Được khách hàng lựa chọn
          </p>
          <h2 id="best-selling-title" className="mt-1 text-2xl font-bold tracking-[-0.025em] text-slate-950">
            Sản phẩm bán chạy
          </h2>
          <p className="mt-2 text-sm text-slate-500">Xếp hạng theo số lượng sản phẩm đã hoàn tất giao dịch thực tế.</p>
        </div>
        <Link href="/products" className="hidden items-center gap-1 text-sm font-semibold text-emerald-700 hover:text-emerald-800 sm:flex">
          Xem tất cả <ChevronRight className="size-4" />
        </Link>
      </div>

      {isLoading ? (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Đang tải sản phẩm bán chạy">
          {Array.from({ length: BEST_SELLING_LIMIT }, (_, index) => (
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
      ) : error ? (
        <div className="mt-4 rounded-xl border border-rose-200 bg-white px-5 py-8 text-center">
          <AlertCircle className="mx-auto size-7 text-rose-500" />
          <p className="mt-2 text-sm font-semibold text-slate-800">Không thể tải sản phẩm bán chạy</p>
          <p className="mt-1 text-xs text-slate-500">{error}</p>
          <button type="button" onClick={refresh} className="mt-4 inline-flex h-9 items-center gap-2 rounded-lg bg-emerald-700 px-4 text-xs font-bold text-white hover:bg-emerald-800">
            <RotateCw className="size-3.5" />Tải lại
          </button>
        </div>
      ) : products.length === 0 ? (
        <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-white px-5 py-8 text-center">
          <PackageOpen className="mx-auto size-8 text-orange-500" />
          <p className="mt-2 text-sm font-semibold text-slate-700">Chưa có dữ liệu sản phẩm bán chạy</p>
          <p className="mt-1 text-xs text-slate-500">Sản phẩm sẽ xuất hiện tại đây sau khi giao dịch được quyết toán thành công.</p>
        </div>
      ) : (
        <div className="mt-4 grid items-stretch gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}
