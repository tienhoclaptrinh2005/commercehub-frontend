"use client";

import {
  AlertCircle,
  ChevronRight,
  PackageCheck,
  RotateCw,
  ShieldCheck,
  Star,
  Store,
} from "lucide-react";
import Link from "next/link";

import { useProduct } from "@/hooks/api/useProduct";
import type { ProductDetail } from "@/types";

import { ProductImageGallery } from "./ProductImageGallery";
import { ProductPurchasePanel } from "./ProductPurchasePanel";
import { RelatedProducts } from "./RelatedProducts";

interface ProductDetailScreenProps {
  slug: string;
}

function getProductTypeLabel(productType: string): string {
  const labels: Record<string, string> = {
    ACCOUNT: "Tài khoản",
    LICENSE: "Bản quyền",
    GIFTCARD: "Thẻ quà tặng",
    COOKIE: "Cookie",
    OTHER: "Sản phẩm",
  };

  return labels[productType] ?? productType.replaceAll("_", " ");
}

function ProductDetailLoading() {
  return (
    <div className="mx-auto max-w-[1200px] animate-pulse px-4 py-8 sm:px-6 sm:py-10">
      <div className="h-5 w-72 rounded bg-slate-200" />
      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.45fr)_minmax(360px,0.9fr)]">
        <div className="aspect-[4/3] rounded-2xl bg-slate-200" />
        <div className="space-y-6">
          <div className="h-52 rounded-2xl bg-white" />
          <div className="h-[560px] rounded-2xl bg-white" />
        </div>
      </div>
    </div>
  );
}

function ProductDetailError({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="mx-auto max-w-[760px] px-4 py-24 text-center sm:px-6">
      <span className="mx-auto grid size-14 place-items-center rounded-full bg-rose-50 text-rose-600">
        <AlertCircle className="size-7" />
      </span>
      <h1 className="mt-5 text-2xl font-black text-slate-950">
        Không thể tải sản phẩm
      </h1>
      <p className="mt-2 text-sm leading-6 text-slate-500">{message}</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-emerald-600 px-4 text-sm font-bold text-white hover:bg-emerald-700"
        >
          <RotateCw className="size-4" />
          Thử lại
        </button>
        <Link
          href="/products"
          className="inline-flex h-10 items-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 hover:bg-slate-50"
        >
          Về danh sách sản phẩm
        </Link>
      </div>
    </div>
  );
}

function ProductDetailContent({ product }: { product: ProductDetail }) {
  return (
    <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 sm:py-10">
      <nav
        className="flex min-w-0 flex-wrap items-center gap-2 text-sm"
        aria-label="Breadcrumb"
      >
        <Link
          href="/"
          className="font-semibold text-emerald-700 transition hover:text-emerald-800"
        >
          Trang chủ
        </Link>
        <ChevronRight className="size-3.5 text-slate-400" />
        <Link
          href="/products"
          className="font-semibold text-slate-500 transition hover:text-emerald-700"
        >
          Sản phẩm
        </Link>
        <ChevronRight className="size-3.5 text-slate-400" />
        <span className="max-w-full truncate font-semibold text-emerald-700">
          {product.name}
        </span>
      </nav>

      <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1.45fr)_minmax(360px,0.9fr)]">
        <div className="min-w-0">
          <ProductImageGallery
            productName={product.name}
            imageUrl={product.thumbnailUrl}
          />

          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-black text-slate-950">
              Thông tin sản phẩm
            </h2>
            <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-600">
              {product.description ||
                product.shortDescription ||
                "Người bán chưa cập nhật mô tả chi tiết cho sản phẩm này."}
            </p>
          </section>
        </div>

        <div className="space-y-6 lg:sticky lg:top-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-emerald-50 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.08em] text-emerald-700">
                {getProductTypeLabel(product.productType)}
              </span>
              <span className="text-sm font-medium text-slate-500">
                {product.categoryName}
              </span>
            </div>

            <h1 className="mt-4 text-3xl font-black leading-tight tracking-[-0.04em] text-slate-950">
              {product.name}
            </h1>
            {product.shortDescription ? (
              <p className="mt-3 text-sm leading-6 text-slate-500">
                {product.shortDescription}
              </p>
            ) : null}

            <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-slate-100 pt-5 text-sm">
              <span
                className="inline-flex items-center gap-1.5 text-slate-400"
                title="Backend chưa trả điểm đánh giá trong API chi tiết sản phẩm"
              >
                <Star className="size-4" />
                Chưa có dữ liệu đánh giá
              </span>
              <span className="hidden h-5 w-px bg-slate-200 sm:block" />
              <span className="inline-flex items-center gap-1.5 text-slate-600">
                <PackageCheck className="size-4 text-emerald-600" />
                Đã bán {new Intl.NumberFormat("vi-VN").format(product.soldCount ?? 0)}
              </span>
            </div>

            <div className="mt-5 flex items-center justify-between gap-4 rounded-xl bg-slate-50 px-4 py-3">
              <span className="inline-flex min-w-0 items-center gap-2 text-sm text-slate-500">
                <Store className="size-4 shrink-0 text-emerald-600" />
                Người bán
              </span>
              <span className="truncate text-sm font-bold text-emerald-700">
                {product.shopName || "Chưa cập nhật"}
              </span>
            </div>
          </section>

          <ProductPurchasePanel product={product} />

          <div className="flex items-start gap-3 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-900">
            <ShieldCheck className="mt-0.5 size-5 shrink-0 text-emerald-600" />
            <p>
              Tiền được hệ thống giữ an toàn và chỉ quyết toán theo trạng thái đơn hàng.
            </p>
          </div>
        </div>
      </div>

      <RelatedProducts
        categoryId={product.categoryId}
        currentProductId={product.id}
      />
    </div>
  );
}

export function ProductDetailScreen({ slug }: ProductDetailScreenProps) {
  const { product, isLoading, error, refresh } = useProduct(slug);

  if (isLoading) return <ProductDetailLoading />;
  if (error || !product) {
    return (
      <ProductDetailError
        message={error || "Không tìm thấy sản phẩm này."}
        onRetry={refresh}
      />
    );
  }

  return <ProductDetailContent key={product.id} product={product} />;
}
