"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  ariaLabel?: string;
}

function getVisiblePages(currentPage: number, totalPages: number): number[] {
  const firstPage = Math.max(0, Math.min(currentPage - 2, totalPages - 5));
  const count = Math.min(5, totalPages);
  return Array.from({ length: count }, (_, index) => firstPage + index);
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  ariaLabel = "Phân trang",
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const visiblePages = getVisiblePages(currentPage, totalPages);

  return (
    <nav
      className="mt-8 flex flex-wrap items-center justify-center gap-2"
      aria-label={ariaLabel}
    >
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 0}
        className="grid size-10 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-emerald-300 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Trang trước"
      >
        <ChevronLeft className="size-4" />
      </button>

      {visiblePages.map((page) => (
        <button
          key={page}
          type="button"
          onClick={() => onPageChange(page)}
          aria-current={page === currentPage ? "page" : undefined}
          className={`grid size-10 place-items-center rounded-lg border text-sm font-bold transition ${
            page === currentPage
              ? "border-emerald-600 bg-emerald-600 text-white"
              : "border-slate-200 bg-white text-slate-600 hover:border-emerald-300 hover:text-emerald-700"
          }`}
        >
          {page + 1}
        </button>
      ))}

      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages - 1}
        className="grid size-10 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:border-emerald-300 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-40"
        aria-label="Trang sau"
      >
        <ChevronRight className="size-4" />
      </button>
    </nav>
  );
}
