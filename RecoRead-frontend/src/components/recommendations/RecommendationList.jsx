import { useEffect, useMemo, useState } from 'react';
import { addBook, getLibraryCount } from '../../api/bookApi';
import { getRecommendations } from '../../api/recommendationApi';
import { computeMatchScore, getBookCoverHighRes, parseErrorMessage, truncateText } from '../../utils/helpers';
import { useLibraryIds } from '../../contexts/LibraryIdlContext';

// Normalize various backend shapes into a single { recs: [], source: {} }
function normalizeRecommendations(res) {
  if (!res) return { recs: [], source: {} };

  // Common shapes:
  // 1) { recommendations: [...], sourceBook: {...} }
  // 2) { items: [...], source: {...} }
  // 3) Array of recommendation-like items
  let raw = [];
  let source = res.sourceBook || res.source || res.context || {};

  if (Array.isArray(res)) {
    raw = res;
  } else if (Array.isArray(res.recommendations)) {
    raw = res.recommendations;
  } else if (Array.isArray(res.items)) {
    raw = res.items;
  } else {
    raw = [];
  }

  // Ensure each item looks like { book, reason?, sharedTags? }
  const recs = raw.map((it) => {
    if (it && it.book) return it;
    // Flattened item: wrap into { book: it }
    const {
      title,
      author,
      publisher,
      description,
      coverImageUrl,
      googleBooksId,
      isbn10,
      isbn13,
      pageCount,
      tags,
      ...rest
    } = it || {};
    return {
      book: {
        title,
        author,
        publisher,
        description,
        coverImageUrl,
        googleBooksId,
        isbn10,
        isbn13,
        pageCount,
        tags: tags || [],
      },
      ...rest,
    };
  });

  return { recs, source: source || {} };
}

export default function RecommendationList({ data, bookId, limit = 6 }) {
  const [fetched, setFetched] = useState(null); // server response
  const [loading, setLoading] = useState(!!bookId && !data);
  const [err, setErr] = useState('');
  const [addingId, setAddingId] = useState(null);
  const [libraryCount, setLibraryCount] = useState(null);
  const libraryIds = useLibraryIds();

  // Fetch when bookId is provided and no data prop
  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!bookId || data) return;
      setLoading(true);
      setErr('');
      try {
        const res = await getRecommendations(bookId, limit);
        if (!cancelled) setFetched(res);
      } catch (e) {
        if (!cancelled) setErr(e?.response?.data?.message || e?.message || 'Failed to load recommendations.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [bookId, data, limit]);

  // Library count (nice stat in the header)
  useEffect(() => {
    getLibraryCount().then(setLibraryCount).catch(() => setLibraryCount(null));
  }, []);

  // Prefer prop 'data' if given; otherwise use fetched
  const { recs, source } = useMemo(() => {
    const res = data || fetched;
    return normalizeRecommendations(res);
  }, [data, fetched]);

  const { scores, avgScore } = useMemo(() => {
    const s = recs.map((r) => computeMatchScore(r, source));
    const vals = s.filter((v) => typeof v === 'number');
    const avg = vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : null;
    return { scores: s, avgScore: avg };
  }, [recs, source]);

  const addRec = async (rec) => {
    const rb = rec?.book || {};
    const payload = {
      googleBooksId: rb.googleBooksId || null,
      title: rb.title || 'Untitled',
      author: rb.author || null,
      publisher: rb.publisher || null,
      description: rb.description || null,
      coverImageUrl: rb.coverImageUrl || null,
      isbn10: rb.isbn10 || null,
      isbn13: rb.isbn13 || null,
      pageCount: rb.pageCount || null,
      tags: rb.tags || [],
    };
    try {
      const key = rb.googleBooksId || rb.isbn13 || rb.isbn10 || rb.title;
      setAddingId(key);
      await addBook(payload);
      alert('Added to library.');
    } catch (e) {
      alert(parseErrorMessage(e));
    } finally {
      setAddingId(null);
    }
  };

  if (loading) return <div className="text-neutral-700">Loading recommendations…</div>;
  if (err) return <div className="text-red-600 text-sm">{err}</div>;

  const total = recs.length;
  if (!total) {
    return <div className="text-neutral-700">No recommendations available.</div>;
  }

  return (
    <div className="grid gap-4">
      {/* Stats header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="stat-card">
          <div className="stat-icon">↗</div>
          <div>
            <div className="stat-value">{total}</div>
            <div className="stat-title">New Recommendations</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">★</div>
          <div>
            <div className="stat-value">
              {avgScore != null ? `${avgScore}%` : '—'}
            </div>
            <div className="stat-title">Avg Match Score</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📚</div>
          <div>
            <div className="stat-value">
              {libraryCount != null ? libraryCount : '—'}
            </div>
            <div className="stat-title">Books in Library</div>
          </div>
        </div>
      </div>

      {/* Recommendation cards */}
      <div className="grid gap-3">
        {recs.map((r, idx) => {
          const b = r.book || {};
          const idKey = b.googleBooksId || b.isbn13 || b.isbn10 || `${b.title || 'untitled'}-${idx}`;
          const already = b.googleBooksId && libraryIds.has(b.googleBooksId);
          const score = scores[idx];

          return (
            <div key={idKey} className="w-full overflow-hidden rounded-xl border border-neutral-300 bg-card-500 p-4">
              <div className="flex gap-4 items-start">
                <div className="relative w-24 sm:w-28 aspect-[2/3] shrink-0 rounded-lg overflow-hidden border border-neutral-300 bg-white">
                  <img
                    src={getBookCoverHighRes(b.coverImageUrl)}
                    alt={b.title || 'Book cover'}
                    className="absolute inset-0 h-full w-full object-cover"
                    loading="lazy"
                    decoding="async"
                    referrerPolicy="no-referrer"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-neutral-900 font-semibold break-words">{b.title || 'Untitled'}</div>
                      {b.author && <div className="text-sm text-neutral-700 truncate">{b.author}</div>}
                    </div>
                    {typeof score === 'number' && (
                      <span className="match-pill">{score}% Match</span>
                    )}
                  </div>

                  {b.description && (
                    <div className="text-sm text-neutral-700 mt-2 break-words">
                      {truncateText(b.description, 220)}
                    </div>
                  )}

                  {!!(r.sharedTags && r.sharedTags.length) && (
                    <div className="mt-2 flex gap-2 flex-wrap">
                      {r.sharedTags.map((t) => (
                        <span key={t} className="badge">{t}</span>
                      ))}
                    </div>
                  )}

                  {r.reason && (
                    <div className="text-sm text-neutral-700 mt-2 break-words">Reason: {r.reason}</div>
                  )}

                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={() => addRec(r)}
                      className={`btn-primary ${already ? 'opacity-60 cursor-not-allowed' : ''}`}
                      disabled={already || addingId === idKey}
                      title={already ? 'Already in your library' : 'Add this recommended book'}
                    >
                      {already ? 'In Library' : addingId === idKey ? 'Adding…' : 'Add to Library'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}