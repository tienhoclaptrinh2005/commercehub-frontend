"use client";

import {
  AlertCircle,
  ChevronRight,
  MessageSquareText,
  PackageCheck,
  RotateCw,
  ShieldCheck,
  Star,
  Store,
  UserRound,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useRef, useState } from "react";

import { useProduct } from "@/hooks/api/useProduct";
import { getApiErrorMessage } from "@/services/api";
import { productService } from "@/services/product.service";
import type { ProductDetail, ProductReview, ProductReviewPage } from "@/types";

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

function formatAverageRating(value: number | null | undefined): string {
  const rating = Number(value ?? 5);
  if (!Number.isFinite(rating)) return "5.0";
  return Math.max(0, Math.min(5, rating)).toFixed(1);
}

function formatReviewDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Không rõ thời gian";

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function ReviewStars({ rating }: { rating: number }) {
  const normalizedRating = Math.max(0, Math.min(5, rating));

  return (
    <span
      className="inline-flex items-center gap-0.5"
      aria-label={`${normalizedRating} trên 5 sao`}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`size-4 ${
            star <= normalizedRating
              ? "fill-amber-400 text-amber-400"
              : "fill-slate-100 text-slate-200"
          }`}
        />
      ))}
    </span>
  );
}

function ReviewAvatar({ review }: { review: ProductReview }) {
  return (
    <span className="relative grid size-11 shrink-0 place-items-center overflow-hidden rounded-full bg-emerald-50 text-emerald-700">
      {review.reviewerAvatar ? (
        <Image
          src={review.reviewerAvatar}
          alt={`Ảnh đại diện của ${review.reviewerName}`}
          fill
          sizes="44px"
          className="object-cover"
          unoptimized
        />
      ) : (
        <UserRound className="size-5" strokeWidth={1.8} />
      )}
    </span>
  );
}

function ProductInformationTabs({ product }: { product: ProductDetail }) {
  const [activeTab, setActiveTab] = useState<"description" | "reviews">(
    "description",
  );
  const [reviews, setReviews] = useState<ProductReviewPage | null>(null);
  const [isLoadingReviews, setIsLoadingReviews] = useState(false);
  const [reviewsError, setReviewsError] = useState<string | null>(null);
  const isReviewRequestRunning = useRef(false);

  const loadReviews = useCallback(
    async (page = 0) => {
      if (isReviewRequestRunning.current) return;

      isReviewRequestRunning.current = true;
      setIsLoadingReviews(true);
      setReviewsError(null);

      try {
        const response = await productService.getReviews(product.id, page, 10);
        setReviews(response);
      } catch (error) {
        setReviewsError(
          getApiErrorMessage(error, "Không thể tải đánh giá sản phẩm."),
        );
      } finally {
        isReviewRequestRunning.current = false;
        setIsLoadingReviews(false);
      }
    },
    [product.id],
  );

  const selectReviewsTab = () => {
    setActiveTab("reviews");
    if (!reviews && !isReviewRequestRunning.current) {
      void loadReviews();
    }
  };

  return (
    <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div
        className="grid grid-cols-2 border-b border-slate-200"
        role="tablist"
        aria-label="Thông tin chi tiết sản phẩm"
      >
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "description"}
          aria-controls="product-description-panel"
          id="product-description-tab"
          onClick={() => setActiveTab("description")}
          className={`relative min-h-14 px-4 text-sm font-bold outline-none transition focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-500 ${
            activeTab === "description"
              ? "text-emerald-700"
              : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
          }`}
        >
          Mô tả sản phẩm
          {activeTab === "description" ? (
            <span className="absolute inset-x-0 bottom-[-1px] h-0.5 bg-emerald-600" />
          ) : null}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "reviews"}
          aria-controls="product-reviews-panel"
          id="product-reviews-tab"
          onClick={selectReviewsTab}
          className={`relative min-h-14 px-4 text-sm font-bold outline-none transition focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-500 ${
            activeTab === "reviews"
              ? "text-emerald-700"
              : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
          }`}
        >
          Đánh giá{reviews ? ` (${reviews.totalElements})` : ""}
          {activeTab === "reviews" ? (
            <span className="absolute inset-x-0 bottom-[-1px] h-0.5 bg-emerald-600" />
          ) : null}
        </button>
      </div>

      {activeTab === "description" ? (
        <div
          id="product-description-panel"
          role="tabpanel"
          aria-labelledby="product-description-tab"
          className="p-6 sm:p-7"
        >
          <h2 className="text-lg font-black text-slate-950">
            Chi tiết sản phẩm
          </h2>
          <p className="mt-3 whitespace-pre-line text-sm leading-7 text-slate-600">
            {product.description ||
              product.shortDescription ||
              "Người bán chưa cập nhật mô tả chi tiết cho sản phẩm này."}
          </p>
        </div>
      ) : (
        <div
          id="product-reviews-panel"
          role="tabpanel"
          aria-labelledby="product-reviews-tab"
          className="p-6 sm:p-7"
        >
          {isLoadingReviews ? (
            <div className="space-y-5" aria-label="Đang tải đánh giá">
              {[1, 2].map((item) => (
                <div key={item} className="flex animate-pulse gap-3">
                  <span className="size-11 shrink-0 rounded-full bg-slate-100" />
                  <span className="flex-1 space-y-2">
                    <span className="block h-4 w-36 rounded bg-slate-100" />
                    <span className="block h-4 w-full rounded bg-slate-100" />
                  </span>
                </div>
              ))}
            </div>
          ) : reviewsError ? (
            <div className="py-6 text-center">
              <AlertCircle className="mx-auto size-8 text-rose-500" />
              <p className="mt-3 text-sm text-slate-600">{reviewsError}</p>
              <button
                type="button"
                onClick={() => void loadReviews(reviews?.currentPage ?? 0)}
                className="mt-4 inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-4 text-sm font-bold text-slate-700 transition hover:border-emerald-200 hover:text-emerald-700"
              >
                <RotateCw className="size-4" />
                Thử lại
              </button>
            </div>
          ) : !reviews || reviews.data.length === 0 ? (
            <div className="py-8 text-center">
              <span className="mx-auto grid size-12 place-items-center rounded-full bg-amber-50 text-amber-500">
                <MessageSquareText className="size-6" />
              </span>
              <h2 className="mt-4 font-black text-slate-900">
                Chưa có đánh giá
              </h2>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                Sản phẩm này chưa nhận được đánh giá từ người mua.
              </p>
            </div>
          ) : (
            <>
              <div className="mb-5 flex items-center justify-between gap-4">
                <h2 className="text-lg font-black text-slate-950">
                  Đánh giá từ người mua
                </h2>
                <span className="text-sm font-semibold text-slate-500">
                  {new Intl.NumberFormat("vi-VN").format(reviews.totalElements)} đánh giá
                </span>
              </div>

              <div className="divide-y divide-slate-100">
                {reviews.data.map((review) => (
                  <article key={review.id} className="flex gap-3 py-5 first:pt-0 last:pb-0">
                    <ReviewAvatar review={review} />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <h3 className="font-bold text-slate-900">
                            {review.reviewerName || "Người mua CommerceHub"}
                          </h3>
                          <ReviewStars rating={review.rating} />
                        </div>
                        <time
                          dateTime={review.createdAt}
                          className="text-xs text-slate-400"
                        >
                          {formatReviewDate(review.createdAt)}
                        </time>
                      </div>
                      <p className="mt-2 whitespace-pre-line text-sm leading-6 text-slate-600">
                        {review.comment || "Người mua không để lại bình luận."}
                      </p>
                    </div>
                  </article>
                ))}
              </div>

              {reviews.totalPages > 1 ? (
                <div className="mt-6 flex items-center justify-center gap-3 border-t border-slate-100 pt-5">
                  <button
                    type="button"
                    disabled={reviews.currentPage <= 0 || isLoadingReviews}
                    onClick={() => void loadReviews(reviews.currentPage - 1)}
                    className="h-9 rounded-lg border border-slate-200 px-4 text-sm font-bold text-slate-600 transition hover:border-emerald-200 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Trang trước
                  </button>
                  <span className="text-sm font-semibold text-slate-500">
                    {reviews.currentPage + 1}/{reviews.totalPages}
                  </span>
                  <button
                    type="button"
                    disabled={reviews.currentPage + 1 >= reviews.totalPages || isLoadingReviews}
                    onClick={() => void loadReviews(reviews.currentPage + 1)}
                    className="h-9 rounded-lg border border-slate-200 px-4 text-sm font-bold text-slate-600 transition hover:border-emerald-200 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Trang sau
                  </button>
                </div>
              ) : null}
            </>
          )}
        </div>
      )}
    </section>
  );
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
  const sellerProfileHref = product.sellerUsername
    ? `/users/${encodeURIComponent(product.sellerUsername)}`
    : null;

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
          <ProductInformationTabs product={product} />
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
                className="inline-flex items-center gap-1.5 font-semibold text-amber-500"
              >
                <Star className="size-4 fill-current" />
                {formatAverageRating(product.averageRating)}
                <span className="font-medium text-slate-500">
                  {(product.reviewCount ?? 0) > 0
                    ? `(${new Intl.NumberFormat("vi-VN").format(product.reviewCount)} đánh giá)`
                    : "(Mới · chưa có đánh giá)"}
                </span>
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
              {sellerProfileHref ? (
                <Link
                  href={sellerProfileHref}
                  className="flex min-w-0 items-center gap-2 text-sm font-bold text-emerald-700 transition hover:text-emerald-800 hover:underline"
                >
                  <ShopAvatar
                    name={product.shopName}
                    avatarUrl={product.sellerAvatarUrl}
                  />
                  <span className="truncate">{product.shopName || "Chưa cập nhật"}</span>
                </Link>
              ) : (
                <span className="flex min-w-0 items-center gap-2 text-sm font-bold text-emerald-700">
                  <ShopAvatar
                    name={product.shopName}
                    avatarUrl={product.sellerAvatarUrl}
                  />
                  <span className="truncate">{product.shopName || "Chưa cập nhật"}</span>
                </span>
              )}
            </div>
            <Link
              href={`/chat?shopId=${product.shopId}`}
              className="mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-emerald-200 bg-white text-sm font-bold text-emerald-700 transition hover:bg-emerald-50"
            >
              <MessageSquareText className="size-4" />
              Nhắn tin với gian hàng
            </Link>
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

function ShopAvatar({
  name,
  avatarUrl,
}: {
  name: string;
  avatarUrl: string | null;
}) {
  const [failedAvatarUrl, setFailedAvatarUrl] = useState<string | null>(null);

  return (
    <span className="grid size-7 shrink-0 place-items-center overflow-hidden rounded-full bg-emerald-600 text-[10px] font-bold text-white">
      {avatarUrl && failedAvatarUrl !== avatarUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={avatarUrl}
          alt={`Ảnh đại diện ${name || "gian hàng"}`}
          className="size-full object-cover"
          referrerPolicy="no-referrer"
          onError={() => setFailedAvatarUrl(avatarUrl)}
        />
      ) : (
        name?.trim().charAt(0).toUpperCase() || "S"
      )}
    </span>
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
