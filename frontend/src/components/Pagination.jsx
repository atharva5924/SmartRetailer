import { cn } from "../libs/utils";

export function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const PAGE_WINDOW = 6;

  const windowStart = Math.max(
    1,
    Math.min(
      currentPage - Math.floor(PAGE_WINDOW / 2),
      totalPages - PAGE_WINDOW + 1
    )
  );

  const windowEnd = Math.min(totalPages, windowStart + PAGE_WINDOW - 1);

  const pages = [];
  for (let p = windowStart; p <= windowEnd; p++) {
    pages.push(p);
  }

  const canGoPrevWindow = windowStart > 1;
  const canGoNextWindow = windowEnd < totalPages;

  const goPrevWindow = () => {
    const newPage = Math.max(1, windowStart - PAGE_WINDOW);
    onPageChange(newPage);
  };

  const goNextWindow = () => {
    const newPage = Math.min(totalPages, windowEnd + 1);
    onPageChange(newPage);
  };

  return (
    <div className="flex items-center justify-center gap-1 mt-4">
      {canGoPrevWindow && (
        <button
          onClick={goPrevWindow}
          className={cn("pagination-btn pagination-btn-inactive")}
        >
          ‹
        </button>
      )}

      {pages.map((page) => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={cn(
            "pagination-btn",
            page === currentPage
              ? "pagination-btn-active"
              : "pagination-btn-inactive"
          )}
        >
          {page}
        </button>
      ))}

      {canGoNextWindow && (
        <button
          onClick={goNextWindow}
          className={cn("pagination-btn pagination-btn-inactive")}
        >
          ›
        </button>
      )}
    </div>
  );
}
