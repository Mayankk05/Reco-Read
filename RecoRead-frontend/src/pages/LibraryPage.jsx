import { useEffect, useMemo, useState } from 'react';
import { listBooks, getAllTags } from '../api/bookApi';
import BookCard from '../components/books/BookCard';
import AddBookModal from '../components/books/AddBookModal';
import Loading from '../components/common/Loading';
import ErrorMessage from '../components/common/ErrorMessage';
import EmptyState from '../components/common/EmptyState';
import { LibraryIdsContext } from '../contexts/LibraryIdlContext';
import { parseErrorMessage } from '../utils/helpers';
import Select from '../components/common/Select';
import RecentActivity from '../components/reading/RecentActivity';

export default function LibraryPage() {
  const [search, setSearch] = useState('');
  const [tag, setTag] = useState('');
  const [sort, setSort] = useState('createdAt,desc');
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(12);
  const [data, setData] = useState(null);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [openAdd, setOpenAdd] = useState(false);

  const load = async () => {
    setLoading(true);
    setErr('');
    try {
      const res = await listBooks({
        search: search.trim() || undefined,
        tag: tag || undefined,
        page,
        size,
        sort,
      });
      setData(res);
    } catch (e) {
      setErr(parseErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  const refreshTags = async () => {
    try {
      const t = await getAllTags();
      setTags(Array.isArray(t) ? t : []);
    } catch {
      setTags([]);
    }
  };

  useEffect(() => {
    refreshTags();
  }, []);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, size, sort]);

  useEffect(() => {
    setPage(0);
    const t = setTimeout(load, 0);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, tag]);

  const libraryIdSet = useMemo(() => {
    const ids = new Set();
    if (data?.content) {
      for (const b of data.content) {
        if (b.googleBooksId) ids.add(b.googleBooksId);
      }
    }
    return ids;
  }, [data]);

  const onDelete = async () => {
    await load();
    await refreshTags();
    if (data && data.content?.length === 0 && page > 0) {
      setPage((p) => Math.max(0, p - 1));
    }
  };

  if (loading && !data && !err) return <Loading label="Loading your library..." />;
  if (err) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <ErrorMessage message={err} onRetry={load} />
      </div>
    );
  }

  const total = data?.totalElements ?? 0;

  const tagOptions = [{ value: '', label: 'All' }, ...tags.map((t) => ({ value: t, label: t }))];
  const sortOptions = [
    { value: 'createdAt,desc', label: 'Newest' },
    { value: 'createdAt,asc', label: 'Oldest' },
    { value: 'title,asc', label: 'Title A–Z' },
    { value: 'title,desc', label: 'Title Z–A' },
  ];
  const perPageOptions = [6, 12, 18, 24].map((n) => ({ value: n, label: `${n}/page` }));

  return (
    <LibraryIdsContext.Provider value={libraryIdSet}>
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 justify-between">
          <div className="flex-1 min-w-[240px]">
            <input
              className="input-field bg-violet-50/70 focus:bg-white"
              placeholder="Search title or author..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search books"
            />
          </div>

          <div className="flex items-center gap-3">
            <Select
              items={tagOptions}
              value={tag}
              onChange={setTag}
              ariaLabel="Filter by Tag"
              className="min-w-[160px]"
            />
            <Select
              items={sortOptions}
              value={sort}
              onChange={setSort}
              ariaLabel="Sort books"
              className="min-w-[160px]"
            />
            <button className="btn-primary" onClick={() => setOpenAdd(true)}>
              Add Book
            </button>
          </div>
        </div>

        {/* Two-column layout (Recent Activity first on mobile) */}
        <div className="mt-5 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
          {/* Right rail becomes first on mobile */}
          <aside className="min-w-0 lg:sticky lg:top-20 order-1 lg:order-2">
            <RecentActivity limit={16} />
          </aside>

          {/* Books grid becomes second on mobile, first on desktop */}
          <section className="min-w-0 order-2 lg:order-1">
            {total === 0 ? (
              <EmptyState
                onAction={() => setOpenAdd(true)}
                subtitle="Use Google search or enter details manually to start your collection."
              />
            ) : (
              <div className="grid gap-5 [grid-template-columns:repeat(auto-fill,minmax(280px,1fr))]">
                {(data?.content || []).map((book) => (
                  <div key={book.id} className="h-full min-w-0">
                    <BookCard book={book} onDelete={onDelete} />
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Pagination: info left, controls under right rail on desktop */}
        {total > 0 && (
          <div className="mt-6 grid items-center gap-3 lg:grid-cols-[minmax(0,1fr)_300px]">
            {/* Left column: page info */}
            <div className="text-sm text-neutral-700">
              Page {data.number + 1} of {data.totalPages || 1} • {data.totalElements} items
            </div>

            {/* Right column: controls aligned to right of the activity panel (stacks below on mobile) */}
            <div className="flex justify-start lg:justify-end items-center gap-2">
              <button
                className="px-3 py-2 rounded-lg border border-neutral-300 disabled:opacity-50 bg-white"
                disabled={data.first}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
              >
                Prev
              </button>
              <button
                className="px-3 py-2 rounded-lg border border-neutral-300 disabled:opacity-50 bg-white"
                disabled={data.last}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </button>

              <Select
                items={perPageOptions}
                value={size}
                onChange={(v) => setSize(Number(v))}
                ariaLabel="Items per page"
                size="sm"
                placement="top"
                className="w-[120px]"
              />
            </div>
          </div>
        )}

        {/* Add Book Modal */}
        <AddBookModal
          open={openAdd}
          onClose={() => setOpenAdd(false)}
          onAdded={async () => {
            setOpenAdd(false);
            await load();
            await refreshTags();
          }}
        />
      </div>
    </LibraryIdsContext.Provider>
  );
}