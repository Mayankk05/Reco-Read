import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { deleteBook } from '../../api/bookApi';
import { getLatestReadingState } from '../../api/readingApi';
import { getBookCoverHighRes, parseErrorMessage, truncateText } from '../../utils/helpers';

function stateKey(id) {
  return `recoread:reading-state:${id}`;
}

export default function BookCard({ book, onDelete }) {
  const navigate = useNavigate();
  const [deleting, setDeleting] = useState(false);
  const [percent, setPercent] = useState(null);
  const [page, setPage] = useState(null);
  const [loadingState, setLoadingState] = useState(true);

  const cid = useMemo(() => book?.id ?? null, [book?.id]);

  useEffect(() => {
    let cancelled = false;
    if (!cid) {
      setLoadingState(false);
      return;
    }

    // 1) cache-first
    try {
      const raw = localStorage.getItem(stateKey(cid));
      if (raw) {
        const data = JSON.parse(raw);
        if (typeof data?.progressPercent === 'number') setPercent(data.progressPercent);
        if (typeof data?.page === 'number') setPage(data.page);
      }
    } catch {}

    // 2) fetch
    async function load() {
      try {
        const rs = await getLatestReadingState(cid);
        if (cancelled) return;
        if (rs) {
          setPercent(typeof rs.progressPercent === 'number' ? rs.progressPercent : null);
          setPage(typeof rs.page === 'number' ? rs.page : null);
          try {
            localStorage.setItem(
              stateKey(cid),
              JSON.stringify({
                progressPercent: rs.progressPercent,
                page: rs.page,
                updatedAt: rs.updatedAt || new Date().toISOString(),
              })
            );
          } catch {}
        } else {
          setPercent(null);
          setPage(null);
        }
      } catch {
        // ignore, keep cache
      } finally {
        if (!cancelled) setLoadingState(false);
      }
    }
    load();

    // 3) sync from other tabs
    const onStorage = (e) => {
      if (!e.key || e.key !== stateKey(cid)) return;
      try {
        const data = JSON.parse(e.newValue || '{}');
        if (typeof data?.progressPercent === 'number') setPercent(data.progressPercent);
        if (typeof data?.page === 'number') setPage(data.page);
      } catch {}
    };
    window.addEventListener('storage', onStorage);
    return () => {
      cancelled = true;
      window.removeEventListener('storage', onStorage);
    };
  }, [cid]);

  const openDetails = () => {
    if (!book) return;
    if (typeof book.userBookNo === 'number' && book.userBookNo > 0) {
      navigate(`/books/n/${book.userBookNo}`);
    } else if (book.id) {
      navigate(`/books/${book.id}`);
    } else {
      alert('This item has no id yet.');
    }
  };

  const handleDelete = async () => {
    if (deleting) return;
    const ok = window.confirm('Delete this book?');
    if (!ok) return;
    try {
      setDeleting(true);
      await deleteBook(book.id);
      onDelete?.(book);
    } catch (err) {
      alert(parseErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  const pct = typeof percent === 'number' ? Math.max(0, Math.min(100, Math.round(percent))) : null;

  return (
    <article className="rounded-xl border border-neutral-300 bg-card-500 h-full flex flex-col shadow-sm">
      {/* Body (cover + info) */}
      <div className="p-4 flex gap-3">
        {/* Cover */}
        <div className="relative w-16 h-24 sm:w-20 sm:h-30 md:w-24 md:h-36 rounded-lg overflow-hidden border border-neutral-300 bg-white shrink-0">
          <img
            src={getBookCoverHighRes(book.coverImageUrl)}
            alt={book.title}
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Text */}
        <div className="min-w-0 flex-1">
          <div className="text-neutral-900 font-semibold truncate" title={book.title}>
            {typeof book.userBookNo === 'number' ? `#${book.userBookNo} ` : ''}
            {book.title}
          </div>
          <div className="text-sm text-neutral-700 truncate">{book.author || 'Unknown author'}</div>

          {book.description ? (
            <div className="text-sm text-neutral-700 mt-2 line-clamp-2">
              {truncateText(book.description, 140)}
            </div>
          ) : (
            <div className="text-sm text-neutral-500 mt-2">No description</div>
          )}

          {/* Progress */}
          <div className="mt-3">
            {loadingState ? (
              <div className="h-1.5 rounded-full bg-neutral-200 overflow-hidden">
                <div className="h-full bg-neutral-300 animate-pulse" style={{ width: '40%' }} />
              </div>
            ) : pct != null ? (
              <>
                <div className="h-1.5 bg-neutral-200 rounded-full overflow-hidden" title={`${pct}%`}>
                  <div
                    className="h-full bg-gradient-to-r from-violet-600 to-fuchsia-600 transition-[width] duration-300"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="mt-1 text-xs text-neutral-600">
                  {pct}% read
                  {book.pageCount && typeof page === 'number' ? ` • Page ${page}/${book.pageCount}` : ''}
                </div>
              </>
            ) : (
              <div className="text-xs text-neutral-500">No progress yet</div>
            )}
          </div>
        </div>
      </div>

      {/* Footer actions (always inside, never overflow) */}
      <div className="mt-auto px-4 pb-4">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={openDetails}
            className="w-full px-4 py-2 rounded-lg border border-primary-300 bg-white text-primary-700 hover:bg-primary-50 text-sm"
            aria-label={`Open details for ${book.title}`}
          >
            Details
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="w-full px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-60 text-sm"
            disabled={deleting}
            aria-label={`Delete ${book.title}`}
          >
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </article>
  );
}