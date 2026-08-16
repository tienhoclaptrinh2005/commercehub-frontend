"use client";

import { RotateCcw, Search } from "lucide-react";
import { useState, type FormEvent } from "react";

import type { CategorySummary } from "@/types";

export interface CatalogFilterValues {
  keyword: string;
  categoryId?: number;
  minPrice: string;
  maxPrice: string;
}

interface ProductFilterPanelProps {
  value: CatalogFilterValues;
  categories: CategorySummary[];
  categoriesLoading?: boolean;
  categoriesError?: string | null;
  onApply: (filters: CatalogFilterValues) => void;
}

const EMPTY_FILTERS: CatalogFilterValues = {
  keyword: "",
  categoryId: undefined,
  minPrice: "",
  maxPrice: "",
};

export function ProductFilterPanel({
  value,
  categories,
  categoriesLoading = false,
  categoriesError,
  onApply,
}: ProductFilterPanelProps) {
  const [draft, setDraft] = useState(value);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onApply({
      ...draft,
      keyword: draft.keyword.trim(),
    });
  }

  const hasFilters = Boolean(
    value.keyword || value.categoryId || value.minPrice || value.maxPrice,
  );

  return (
    <aside className="lg:w-60 lg:shrink-0" aria-label="Bộ lọc sản phẩm">
      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
      >
        <fieldset>
          <legend className="text-base font-bold text-slate-950">Danh mục</legend>
          <div className="mt-4 space-y-3">
            <label className="flex cursor-pointer items-center gap-3 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={draft.categoryId === undefined}
                onChange={() =>
                  setDraft((current) => ({
                    ...current,
                    categoryId: undefined,
                  }))
                }
                className="size-4 rounded border-slate-300 accent-emerald-600"
              />
              Tất cả sản phẩm
            </label>

            {categoriesLoading ? (
              <div className="space-y-3" aria-label="Đang tải danh mục">
                {Array.from({ length: 4 }, (_, index) => (
                  <div key={index} className="h-4 animate-pulse rounded bg-slate-100" />
                ))}
              </div>
            ) : (
              categories.map((category) => (
                <div key={category.id}>
                  <label className="flex cursor-pointer items-start gap-3 text-sm font-semibold leading-5 text-slate-800">
                    <input
                      type="checkbox"
                      checked={draft.categoryId === category.id}
                      onChange={() =>
                        setDraft((current) => ({
                          ...current,
                          categoryId:
                            current.categoryId === category.id
                              ? undefined
                              : category.id,
                        }))
                      }
                      className="mt-0.5 size-4 shrink-0 rounded border-slate-300 accent-emerald-600"
                    />
                    <span>{category.name}</span>
                  </label>

                  {category.children.length > 0 ? (
                    <div className="ml-7 mt-2 space-y-2 border-l border-slate-200 pl-3">
                      {category.children.map((child) => (
                        <label
                          key={child.id}
                          className="flex cursor-pointer items-start gap-2.5 text-sm leading-5 text-slate-600"
                        >
                          <input
                            type="checkbox"
                            checked={draft.categoryId === child.id}
                            onChange={() =>
                              setDraft((current) => ({
                                ...current,
                                categoryId:
                                  current.categoryId === child.id
                                    ? undefined
                                    : child.id,
                              }))
                            }
                            className="mt-0.5 size-3.5 shrink-0 rounded border-slate-300 accent-emerald-600"
                          />
                          <span>{child.name}</span>
                        </label>
                      ))}
                    </div>
                  ) : null}
                </div>
              ))
            )}

            {categoriesError ? (
              <p className="text-xs leading-5 text-amber-700">
                Danh mục tạm thời chưa tải được.
              </p>
            ) : null}
          </div>
        </fieldset>

        <fieldset className="mt-7 border-t border-slate-100 pt-6">
          <legend className="text-base font-bold text-slate-950">Giá</legend>
          <div className="mt-4 flex items-center gap-2">
            <label className="min-w-0 flex-1">
              <span className="sr-only">Giá tối thiểu</span>
              <input
                type="number"
                min="0"
                step="1000"
                inputMode="numeric"
                value={draft.minPrice}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    minPrice: event.target.value,
                  }))
                }
                placeholder="Tối thiểu"
                className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
              />
            </label>
            <span className="text-slate-400">–</span>
            <label className="min-w-0 flex-1">
              <span className="sr-only">Giá tối đa</span>
              <input
                type="number"
                min="0"
                step="1000"
                inputMode="numeric"
                value={draft.maxPrice}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    maxPrice: event.target.value,
                  }))
                }
                placeholder="Tối đa"
                className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
              />
            </label>
          </div>
          <p className="mt-2 text-[11px] leading-4 text-slate-400">
            Lọc giá áp dụng cho các sản phẩm trên trang hiện tại.
          </p>
        </fieldset>

        <div className="mt-7 border-t border-slate-100 pt-6">
          <label htmlFor="product-rating" className="text-base font-bold text-slate-950">
            Đánh giá sản phẩm
          </label>
          <select
            id="product-rating"
            disabled
            title="Backend chưa hỗ trợ điều kiện lọc sản phẩm theo điểm đánh giá"
            className="mt-4 h-10 w-full rounded-md border border-slate-200 bg-slate-50 px-3 text-sm text-slate-400 outline-none disabled:cursor-not-allowed"
          >
            <option>Chưa có dữ liệu đánh giá</option>
          </select>
        </div>

        <div className="mt-7 border-t border-slate-100 pt-6">
          <label htmlFor="product-keyword" className="text-base font-bold text-slate-950">
            Tìm kiếm sản phẩm
          </label>
          <input
            id="product-keyword"
            type="search"
            value={draft.keyword}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                keyword: event.target.value,
              }))
            }
            placeholder="Từ khóa"
            className="mt-4 h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
          />
          <button
            type="submit"
            className="mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-emerald-600 px-4 text-sm font-bold text-white transition hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-600/20"
          >
            <Search className="size-4" />
            Tìm kiếm
          </button>
          {hasFilters ? (
            <button
              type="button"
              onClick={() => {
                setDraft(EMPTY_FILTERS);
                onApply(EMPTY_FILTERS);
              }}
              className="mt-2 inline-flex h-9 w-full items-center justify-center gap-2 rounded-md text-sm font-semibold text-slate-500 transition hover:bg-slate-50 hover:text-emerald-700"
            >
              <RotateCcw className="size-3.5" />
              Xóa bộ lọc
            </button>
          ) : null}
        </div>
      </form>
    </aside>
  );
}
