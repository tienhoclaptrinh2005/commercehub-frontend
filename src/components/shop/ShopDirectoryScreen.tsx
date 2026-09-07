"use client";

import {
  BadgeCheck,
  Boxes,
  ChevronRight,
  PackageOpen,
  RefreshCw,
  Search,
  ShoppingBag,
  Star,
  Store,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { GroupedPagination } from "@/components/common/GroupedPagination";
import { useCategories } from "@/hooks/api/useCategories";
import { useShops } from "@/hooks/api/useShops";
import type {
  CategorySummary,
  PublicShopSort,
  PublicShopSummary,
} from "@/types";

const PAGE_SIZE = 8;
const coverClasses = [
  "from-emerald-950 via-emerald-800 to-teal-600",
  "from-slate-950 via-slate-800 to-emerald-700",
  "from-indigo-950 via-indigo-800 to-violet-600",
  "from-cyan-950 via-cyan-800 to-emerald-600",
] as const;

type CategoryOption = {
  id: number;
  label: string;
};

function flattenCategories(
  categories: CategorySummary[],
  depth = 0,
): CategoryOption[] {
  return categories.flatMap((category) => [
    {
      id: category.id,
      label: `${depth > 0 ? "— ".repeat(depth) : ""}${category.name}`,
    },
    ...flattenCategories(category.children ?? [], depth + 1),
  ]);
}

function formatCount(value: number): string {
  return new Intl.NumberFormat("vi-VN").format(Number(value ?? 0));
}

function shopInitial(name: string): string {
  return name.trim().charAt(0).toUpperCase() || "S";
}

function formatRating(value: number, ratingCount: number): string {
  if (Number(ratingCount ?? 0) <= 0) return "Mới";
  const rating = Number(value ?? 0);
  return Number.isFinite(rating) && rating > 0
    ? `${rating.toFixed(1)} (${formatCount(ratingCount)})`
    : "Mới";
}

export function ShopDirectoryScreen() {
  const [searchInput, setSearchInput] = useState("");
  const [keyword, setKeyword] = useState("");
  const [categoryId, setCategoryId] = useState<number | undefined>();
  const [sort, setSort] = useState<PublicShopSort>("trusted");
  const [page, setPage] = useState(0);
  const { categories, isLoading: categoriesLoading } = useCategories();
  const categoryOptions = useMemo(
    () => flattenCategories(categories),
    [categories],
  );
  const { result, shops, isLoading, error, refresh } = useShops({
    page,
    size: PAGE_SIZE,
    keyword: keyword || undefined,
    categoryId,
    sort,
  });

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setKeyword(searchInput.trim());
      setPage(0);
    }, 350);
    return () => window.clearTimeout(timer);
  }, [searchInput]);

  function changeCategory(value: string) {
    setCategoryId(value ? Number(value) : undefined);
    setPage(0);
  }

  function changeSort(value: string) {
    setSort(value as PublicShopSort);
    setPage(0);
  }

  function changePage(nextPage: number) {
    setPage(nextPage);
    document
      .getElementById("shop-directory")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="bg-[#f4f7f6]">
      <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 sm:py-10">
        <nav className="flex items-center gap-1.5 text-sm" aria-label="Breadcrumb">
          <Link
            href="/"
            className="font-medium text-emerald-700 transition hover:text-emerald-800"
          >
            Trang chủ
          </Link>
          <ChevronRight className="size-3.5 text-slate-400" />
          <span className="text-slate-500">Danh sách người bán</span>
        </nav>

        <header className="mt-5 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-black uppercase tracking-[0.14em] text-emerald-700">
              Gian hàng đã được duyệt
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-[-0.04em] text-slate-950 sm:text-4xl">
              Danh sách người bán
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-600 sm:text-base">
              Khám phá các gian hàng đang hoạt động và tìm người bán phù hợp với
              nhu cầu của bạn.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
            <BadgeCheck className="size-5 shrink-0 text-emerald-700" />
            Chỉ hiển thị shop ACTIVE có quyền SELLER
          </div>
        </header>

        <section
          id="shop-directory"
          className="mt-7 scroll-mt-6"
          aria-label="Bộ lọc và danh sách người bán"
        >
          <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[minmax(260px,1fr)_220px_190px]">
            <label className="relative block">
              <span className="sr-only">Tìm tên shop hoặc username</span>
              <Search className="pointer-events-none absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-slate-400" />
              <input
                type="search"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                maxLength={100}
                placeholder="Tìm tên shop, username..."
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-600/10"
              />
            </label>

            <label>
              <span className="sr-only">Lọc theo danh mục</span>
              <select
                value={categoryId ?? ""}
                onChange={(event) => changeCategory(event.target.value)}
                disabled={categoriesLoading}
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-700 outline-none focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-600/10 disabled:opacity-60"
              >
                <option value="">
                  {categoriesLoading ? "Đang tải danh mục..." : "Tất cả danh mục"}
                </option>
                {categoryOptions.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.label}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span className="sr-only">Sắp xếp người bán</span>
              <select
                value={sort}
                onChange={(event) => changeSort(event.target.value)}
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-700 outline-none focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-600/10"
              >
                <option value="trusted">Uy tín cao nhất</option>
                <option value="newest">Mới tham gia</option>
                <option value="name">Tên A–Z</option>
              </select>
            </label>
          </div>

          <div className="mt-5 flex min-h-6 items-center justify-between gap-4 text-sm">
            <p className="text-slate-500">
              {isLoading ? (
                "Đang tải danh sách..."
              ) : (
                <>
                  Có{" "}
                  <strong className="text-slate-900">
                    {formatCount(result.totalElements)}
                  </strong>{" "}
                  gian hàng phù hợp
                </>
              )}
            </p>
            {result.totalPages > 0 ? (
              <p className="text-xs font-semibold text-slate-400">
                Trang {result.currentPage + 1}/{result.totalPages}
              </p>
            ) : null}
          </div>

          {isLoading ? (
            <ShopGridSkeleton />
          ) : error ? (
            <div className="mt-5 rounded-2xl border border-rose-200 bg-white px-6 py-12 text-center">
              <p className="font-bold text-rose-700">Không thể tải danh sách người bán</p>
              <p className="mt-2 text-sm text-slate-500">{error}</p>
              <button
                type="button"
                onClick={refresh}
                className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-emerald-700 px-4 text-sm font-bold text-white hover:bg-emerald-800"
              >
                <RefreshCw className="size-4" />
                Thử lại
              </button>
            </div>
          ) : shops.length === 0 ? (
            <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
              <PackageOpen className="mx-auto size-10 text-slate-300" />
              <h2 className="mt-4 text-lg font-bold text-slate-900">
                Không tìm thấy gian hàng phù hợp
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Hãy thử từ khóa hoặc danh mục khác.
              </p>
            </div>
          ) : (
            <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {shops.map((shop) => (
                <ShopCard key={shop.id} shop={shop} />
              ))}
            </div>
          )}

          {!error && !isLoading && shops.length > 0 ? (
            <GroupedPagination
              currentPage={result.currentPage}
              totalPages={result.totalPages}
              onPageChange={changePage}
              groupSize={3}
            />
          ) : null}
        </section>
      </div>
    </div>
  );
}

function ShopCard({ shop }: { shop: PublicShopSummary }) {
  const profileHref = `/users/${encodeURIComponent(shop.ownerUsername)}`;
  const coverClass = coverClasses[Math.abs(shop.id) % coverClasses.length];

  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-xl hover:shadow-slate-950/10">
      <div className={`relative h-28 overflow-hidden bg-gradient-to-br ${coverClass}`}>
        {shop.shopCoverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={shop.shopCoverUrl}
            alt={`Ảnh bìa ${shop.name}`}
            className="size-full object-cover"
          />
        ) : (
          <>
            <div className="absolute -right-8 -top-12 size-36 rounded-full bg-white/10" />
            <div className="absolute bottom-3 left-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.12em] text-white/70">
              <Store className="size-3.5" />
              CommerceHub Seller
            </div>
          </>
        )}
      </div>

      <div className="relative px-4 pb-4 pt-11">
        <Link
          href={profileHref}
          className="absolute -top-7 left-4 grid size-16 place-items-center overflow-hidden rounded-2xl border-4 border-white bg-emerald-600 text-xl font-black text-white shadow-md"
          aria-label={`Xem gian hàng ${shop.name}`}
        >
          {shop.shopAvatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={shop.shopAvatarUrl}
              alt={`Ảnh đại diện ${shop.name}`}
              className="size-full object-cover"
            />
          ) : (
            shopInitial(shop.name)
          )}
        </Link>

        <span className="absolute right-4 top-3 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[9px] font-black uppercase tracking-wide text-emerald-700">
          <BadgeCheck className="size-3" />
          Đã duyệt
        </span>

        <Link
          href={profileHref}
          className="line-clamp-1 text-base font-black text-slate-950 transition group-hover:text-emerald-700"
        >
          {shop.name}
        </Link>
        <p className="mt-1 truncate text-xs font-medium text-slate-400">
          @{shop.ownerUsername}
        </p>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <ShopMetric
            icon={ShoppingBag}
            label="Đã bán"
            value={formatCount(shop.soldProductCount)}
          />
          <ShopMetric
            icon={Boxes}
            label="Sản phẩm"
            value={formatCount(shop.activeProductCount)}
          />
          <ShopMetric
            icon={Star}
            label="Đánh giá"
            value={formatRating(shop.ratingAvg, shop.ratingCount)}
            title={
              shop.ratingCount > 0
                ? `${formatCount(shop.ratingCount)} lượt đánh giá hợp lệ`
                : "Shop chưa có đánh giá"
            }
            highlight
          />
        </div>

        <Link
          href={profileHref}
          className="mt-4 inline-flex h-10 w-full items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-xs font-black uppercase tracking-[0.05em] text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800"
        >
          Xem gian hàng
        </Link>
      </div>
    </article>
  );
}

function ShopMetric({
  icon: Icon,
  label,
  value,
  title,
  highlight = false,
}: {
  icon: typeof ShoppingBag;
  label: string;
  value: string;
  title?: string;
  highlight?: boolean;
}) {
  return (
    <div
      className="rounded-xl border border-slate-100 bg-slate-50 px-2 py-2.5 text-center"
      title={title}
    >
      <p className="flex items-center justify-center gap-1 text-[9px] font-bold uppercase tracking-wide text-slate-400">
        <Icon className={`size-3 ${highlight ? "text-amber-500" : "text-slate-400"}`} />
        {label}
      </p>
      <p className={`mt-1 text-sm font-black ${highlight ? "text-amber-600" : "text-slate-900"}`}>
        {value}
      </p>
    </div>
  );
}

function ShopGridSkeleton() {
  return (
    <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" aria-label="Đang tải gian hàng">
      {Array.from({ length: PAGE_SIZE }, (_, index) => (
        <div key={index} className="h-[330px] animate-pulse overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="h-28 bg-slate-200" />
          <div className="space-y-4 p-4 pt-10">
            <div className="h-5 w-2/3 rounded bg-slate-200" />
            <div className="h-16 rounded-xl bg-slate-100" />
            <div className="h-10 rounded-xl bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  );
}
