"use client";

import { RotateCcw, Search } from "lucide-react";
import {
  useState,
  type ChangeEvent,
  type FormEvent,
  type KeyboardEvent,
} from "react";

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

const MAX_FILTER_PRICE = 500_000_000;
const PRICE_FORMATTER = new Intl.NumberFormat("vi-VN");

function normalizePriceInput(input: string): string {
  const digits = input.replace(/\D/g, "");
  if (!digits) return "";

  const normalizedDigits = digits.replace(/^0+(?=\d)/, "");
  return String(Math.min(Number(normalizedDigits), MAX_FILTER_PRICE));
}

function formatPriceInput(value: string): string {
  return value === "" ? "" : PRICE_FORMATTER.format(Number(value));
}

function preventInvalidPriceKey(event: KeyboardEvent<HTMLInputElement>) {
  const controlKeys = [
    "Backspace",
    "Delete",
    "Tab",
    "ArrowLeft",
    "ArrowRight",
    "Home",
    "End",
    "Enter",
  ];

  if (event.ctrlKey || event.metaKey || controlKeys.includes(event.key)) return;
  if (!/^\d$/.test(event.key)) event.preventDefault();
}

interface CurrencyFilterInputProps {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}

function CurrencyFilterInput({
  label,
  placeholder,
  value,
  onChange,
}: CurrencyFilterInputProps) {
  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    onChange(normalizePriceInput(event.target.value));
  }

  return (
    <label className="min-w-0 flex-1">
      <span className="sr-only">{label}</span>
      <span className="relative block">
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={formatPriceInput(value)}
          onChange={handleChange}
          onKeyDown={preventInvalidPriceKey}
          placeholder={placeholder}
          className="h-10 w-full rounded-md border border-slate-200 py-2 pl-3 pr-7 text-sm outline-none transition placeholder:text-slate-400 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
        />
        <span
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-slate-500"
          aria-hidden="true"
        >
          đ
        </span>
      </span>
    </label>
  );
}

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
        <div>
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

        <fieldset className="mt-7 border-t border-slate-100 pt-6">
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
            <CurrencyFilterInput
              label="Giá tối thiểu"
              placeholder="Tối thiểu"
              value={draft.minPrice}
              onChange={(minPrice) =>
                setDraft((current) => ({ ...current, minPrice }))
              }
            />
            <span className="text-slate-400">–</span>
            <CurrencyFilterInput
              label="Giá tối đa"
              placeholder="Tối đa"
              value={draft.maxPrice}
              onChange={(maxPrice) =>
                setDraft((current) => ({ ...current, maxPrice }))
              }
            />
          </div>
          <p className="mt-2 text-[11px] leading-4 text-slate-400">
            Từ 0đ đến tối đa 500.000.000đ.
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

      </form>
    </aside>
  );
}
