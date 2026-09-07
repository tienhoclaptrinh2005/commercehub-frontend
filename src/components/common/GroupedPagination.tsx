"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface GroupedPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
  groupSize?: number;
}

export function GroupedPagination({
  currentPage,
  totalPages,
  onPageChange,
  isLoading = false,
  groupSize = 3,
}: GroupedPaginationProps) {
  if (totalPages <= 0) return null;

  const safeGroupSize = Math.max(1, groupSize);
  const groupStart = Math.floor(currentPage / safeGroupSize) * safeGroupSize;
  const visibleCount = Math.min(safeGroupSize, totalPages - groupStart);
  const visiblePages = Array.from(
    { length: visibleCount },
    (_, index) => groupStart + index,
  );

  return (
    <nav
      className="mt-9 flex flex-wrap items-center justify-center gap-2"
      aria-label="Phân trang danh sách người bán"
    >
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 0 || isLoading}
        className="inline-flex h-10 items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-600 transition hover:border-emerald-300 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ChevronLeft className="size-4" />
        Trước
      </button>

      {visiblePages.map((page) => {
        const active = page === currentPage;
        return (
          <button
            key={page}
            type="button"
            onClick={() => onPageChange(page)}
            disabled={active || isLoading}
            aria-current={active ? "page" : undefined}
            aria-label={`Trang ${page + 1}`}
            className={`grid size-10 place-items-center rounded-xl border text-sm font-black transition ${
              active
                ? "border-emerald-600 bg-emerald-600 text-white shadow-sm"
                : "border-slate-200 bg-white text-slate-600 hover:border-emerald-300 hover:text-emerald-700"
            } disabled:cursor-default`}
          >
            {page + 1}
          </button>
        );
      })}

      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages - 1 || isLoading}
        className="inline-flex h-10 items-center gap-1 rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-600 transition hover:border-emerald-300 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Sau
        <ChevronRight className="size-4" />
      </button>
    </nav>
  );
}
