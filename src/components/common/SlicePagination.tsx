type SlicePaginationProps = {
  currentPage: number;
  pageNumbers: number[];
  hasNext: boolean;
  isLoading?: boolean;
  onPageChange: (page: number) => void;
};

export function SlicePagination({
  currentPage,
  pageNumbers,
  hasNext,
  isLoading = false,
  onPageChange,
}: SlicePaginationProps) {
  if (currentPage === 1 && !hasNext) return null;

  const visiblePages = pageNumbers.includes(currentPage)
    ? pageNumbers.slice(0, 3)
    : [currentPage];

  return (
    <nav
      className="flex flex-col items-center justify-between gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:px-6"
      aria-label="Phân trang lịch sử giao dịch"
    >
      <span className="text-xs font-semibold text-slate-500">
        Hiển thị tối đa 3 trang mỗi cụm
      </span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage <= 1 || isLoading}
          className="h-9 rounded-lg border border-slate-200 px-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Trước
        </button>

        {visiblePages.map((pageNumber) => {
          const isActive = pageNumber === currentPage;
          return (
            <button
              key={pageNumber}
              type="button"
              onClick={() => onPageChange(pageNumber)}
              disabled={isLoading || isActive}
              aria-current={isActive ? "page" : undefined}
              aria-label={`Trang ${pageNumber}`}
              className={`grid size-9 place-items-center rounded-lg border text-sm font-black transition disabled:cursor-default ${
                isActive
                  ? "border-emerald-600 bg-emerald-600 text-white shadow-sm"
                  : "border-slate-200 bg-white text-slate-600 hover:border-emerald-300 hover:text-emerald-700 disabled:opacity-50"
              }`}
            >
              {pageNumber}
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!hasNext || isLoading}
          className="h-9 rounded-lg border border-slate-200 px-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Sau
        </button>
      </div>
    </nav>
  );
}
