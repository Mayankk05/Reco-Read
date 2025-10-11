export default function Pagination({ page, totalPages, isFirst, isLast, onPageChange }) {
  if (!totalPages || totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-3 mt-6">
      <button
        disabled={isFirst}
        onClick={() => onPageChange(page - 1)}
        className="px-4 py-2 rounded bg-neutral-200 text-neutral-800 disabled:opacity-50"
      >
        Prev
      </button>
      <span className="text-neutral-700">
        Page <strong>{page + 1}</strong> of <strong>{totalPages}</strong>
      </span>
      <button
        disabled={isLast}
        onClick={() => onPageChange(page + 1)}
        className="px-4 py-2 rounded bg-neutral-200 text-neutral-800 disabled:opacity-50"
      >
        Next
      </button>
    </div>
  );
}