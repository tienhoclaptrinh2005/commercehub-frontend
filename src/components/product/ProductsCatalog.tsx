"use client";

import { SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";

import { Pagination } from "@/components/common/Pagination";
import { useCategories } from "@/hooks/api/useCategories";
import { useProducts } from "@/hooks/api/useProducts";
import type { ProductDeliveryType, ProductSummary } from "@/types";

import {
  ProductFilterPanel,
  type CatalogFilterValues,
} from "./ProductFilterPanel";
import { ProductGrid } from "./ProductGrid";

const PAGE_SIZE = 12;

const INITIAL_FILTERS: CatalogFilterValues = {
  keyword: "",
  categoryId: undefined,
  minPrice: "",
  maxPrice: "",
};

function getPriceBounds(product: ProductSummary): [number, number] {
  const prices = (product.variants ?? [])
    .filter((variant) => variant.status === "ACTIVE")
    .map((variant) => Number(variant.price))
    .filter((price) => Number.isFinite(price));

  if (prices.length === 0) {
    const fallback = Number(product.minPrice ?? 0);
    return [fallback, fallback];
  }

  return [Math.min(...prices), Math.max(...prices)];
}

interface ProductsCatalogProps {
  initialCategoryId?: number;
  initialKeyword?: string;
  deliveryType?: ProductDeliveryType;
  catalogLabel?: "sản phẩm" | "dịch vụ";
}

export function ProductsCatalog({
  initialCategoryId,
  initialKeyword,
  deliveryType,
  catalogLabel = "sản phẩm",
}: ProductsCatalogProps) {
  const [page, setPage] = useState(0);
  const [filters, setFilters] = useState<CatalogFilterValues>(() => ({
    ...INITIAL_FILTERS,
    keyword: initialKeyword ?? "",
    categoryId: initialCategoryId,
  }));
  const { categories, isLoading: categoriesLoading, error: categoriesError } =
    useCategories();
  const { result, products, isLoading, error, refresh } = useProducts({
    page,
    size: PAGE_SIZE,
    keyword: filters.keyword || undefined,
    categoryId: filters.categoryId,
    deliveryType,
  });

  const visibleProducts = useMemo(() => {
    const minimum = filters.minPrice ? Number(filters.minPrice) : undefined;
    const maximum = filters.maxPrice ? Number(filters.maxPrice) : undefined;

    if (minimum === undefined && maximum === undefined) return products;

    return products.filter((product) => {
      const [productMinimum, productMaximum] = getPriceBounds(product);
      if (minimum !== undefined && productMaximum < minimum) return false;
      if (maximum !== undefined && productMinimum > maximum) return false;
      return true;
    });
  }, [filters.maxPrice, filters.minPrice, products]);

  const hasFilters = Boolean(
    filters.keyword ||
      filters.categoryId ||
      filters.minPrice ||
      filters.maxPrice,
  );
  const hasPriceFilter = Boolean(filters.minPrice || filters.maxPrice);

  function handleApplyFilters(nextFilters: CatalogFilterValues) {
    setFilters(nextFilters);
    setPage(0);
  }

  function handlePageChange(nextPage: number) {
    setPage(nextPage);
    document
      .getElementById("product-list")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="grid gap-7 lg:grid-cols-[240px_minmax(0,1fr)]">
      <ProductFilterPanel
        value={filters}
        categories={categories}
        categoriesLoading={categoriesLoading}
        categoriesError={categoriesError}
        catalogLabel={catalogLabel}
        onApply={handleApplyFilters}
      />

      <section id="product-list" className="min-w-0 scroll-mt-6" aria-label="Danh sách sản phẩm">
        <div className="mb-6 flex min-h-14 flex-col justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <SlidersHorizontal className="size-4 text-emerald-600" />
            {isLoading ? (
              <span>Đang tải {catalogLabel}...</span>
            ) : hasPriceFilter ? (
              <span>
                Hiển thị <strong className="text-slate-900">{visibleProducts.length}</strong> {catalogLabel} phù hợp trên trang này
              </span>
            ) : (
              <span>
                Có <strong className="text-slate-900">{new Intl.NumberFormat("vi-VN").format(result.totalElements)}</strong> {catalogLabel}
              </span>
            )}
          </div>
          <span className="text-xs font-medium text-slate-400">Mới nhất trước</span>
        </div>

        <ProductGrid
          products={visibleProducts}
          isLoading={isLoading}
          error={error}
          onRetry={refresh}
          hasFilters={hasFilters}
          catalogLabel={catalogLabel}
        />

        {!error && !isLoading && !hasPriceFilter ? (
          <Pagination
            currentPage={result.currentPage}
            totalPages={result.totalPages}
            onPageChange={handlePageChange}
          />
        ) : null}
      </section>
    </div>
  );
}
