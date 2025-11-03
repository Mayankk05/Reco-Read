import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import axiosInstance from '../../api/axiosConfig';
import { LibraryIdsContext } from '../../contexts/LibraryIdlContext';
import { searchGoogleBooks as searchViaBackend } from '../../api/bookApi';


function debounce(fn, ms = 450) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}

function normalizePublishedDate(s) {
  if (!s || typeof s !== 'string') return '';
  const raw = s.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;          
  if (/^\d{4}-\d{2}$/.test(raw)) return `${raw}-01`;           
  if (/^\d{4}$/.test(raw)) return `${raw}-01-01`;           
  const d = new Date(raw);
  if (!isNaN(d.valueOf())) {
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, '0');
    const day = String(d.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }
  return '';
}

function volumeToPayload(v) {
  const info = v?.volumeInfo || {};
  const ids = (info.industryIdentifiers || []).reduce(
    (acc, it) => {
      if (it.type === 'ISBN_10') acc.isbn10 = it.identifier;
      if (it.type === 'ISBN_13') acc.isbn13 = it.identifier;
      return acc;
    },
    { isbn10: '', isbn13: '' }
  );

  const normalizedDate = normalizePublishedDate(info.publishedDate || '');

  const rawCats = Array.isArray(info.categories) ? info.categories : [];
  const tags = [...new Set(
    rawCats
      .flatMap(c => String(c).split('/'))
      .map(s => s.trim().toLowerCase())
      .filter(Boolean)
  )].slice(0, 3);

  return {
    title: info.title || 'Untitled',
    author: Array.isArray(info.authors) ? info.authors.join(', ') : info.authors || '',
    description: info.description || '',
    pageCount: info.pageCount || null,
    publisher: info.publisher || '',
    publishedDate: normalizedDate,
    coverImageUrl:
      info.imageLinks?.thumbnail?.replace('http://', 'https://') ||
      info.imageLinks?.smallThumbnail?.replace('http://', 'https://') ||
      '',
    googleBooksId: v.id,
    isbn10: ids.isbn10 || '',
    isbn13: ids.isbn13 || '',
    tags,
  };
}

export default function SearchGoogleBooks({ onAdded }) {
  const libraryIdSet = useContext(LibraryIdsContext);
  const [q, setQ] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [addingId, setAddingId] = useState(null);
  const [justAdded, setJustAdded] = useState(null);


  const abortRef = useRef(null);

  const cacheRef = useRef(new Map()); 

  const canSearch = q.trim().length >= 2;

  const doBackendSearch = async (query, signal) => {
    const key = query.trim().toLowerCase();
    const now = Date.now();
    const cached = cacheRef.current.get(key);
    if (cached && now - cached.ts < 5 * 60_000) {
      return cached.items;
    }

    let attempt = 0;
    const maxAttempts = 3;
    const baseDelay = 600; 

    while (true) {
      try {
        const data = await searchViaBackend(key, { signal });
        const items = Array.isArray(data?.items) ? data.items : [];
        cacheRef.current.set(key, { ts: now, items });
        return items;
      } catch (e) {
        const status = e?.response?.status || e?.status;
        if (status === 429 && attempt < maxAttempts - 1) {

          const delay = baseDelay * Math.pow(2, attempt);
          await new Promise((r) => setTimeout(r, delay));
          attempt += 1;
          continue;
        }
        throw e;
      }
    }
  };

  const performSearch = useMemo(
    () =>
      debounce(async (query) => {
        if (!query || query.trim().length < 2) {
          setResults([]);
          setLoading(false);
          setErr('');
          return;
        }

        if (abortRef.current) {
          try { abortRef.current.abort(); } catch {}
        }
        const controller = new AbortController();
        abortRef.current = controller;

        setLoading(true);
        setErr('');
        try {
          const items = await doBackendSearch(query, controller.signal);

          const mapped = items.map((it) => {
            const info = it.volumeInfo || {};
            return {
              id: it.id,
              title: info.title || 'Untitled',
              authors: Array.isArray(info.authors) ? info.authors.join(', ') : info.authors || '',
              cover:
                info.imageLinks?.thumbnail?.replace('http://', 'https://') ||
                info.imageLinks?.smallThumbnail?.replace('http://', 'https://') ||
                '',
              raw: it,
            };
          });
          setResults(mapped);
        } catch (e) {
          const status = e?.response?.status || e?.status;
          if (status === 429) {
            setErr('We’re hitting the search rate limit. Please wait a moment and try again.');
          } else {
            const msg = e?.response?.data?.message || e?.message || 'Search failed';
            setErr(msg);
          }
          setResults([]);
        } finally {
          setLoading(false);
        }
      }, 500),
    []
  );

  useEffect(() => {
    setLoading(true);
    setErr('');
    performSearch(q);
  }, [q]);

  const handleAdd = async (vol) => {
    if (!vol?.raw) return;
    const gid = vol.id;
    if (!gid) return;
    if (addingId) return;

    if (libraryIdSet && libraryIdSet.has(gid)) {
      setJustAdded(gid);
      setTimeout(() => setJustAdded(null), 1200);
      return;
    }

    setAddingId(gid);
    try {
      const payload = volumeToPayload(vol.raw);
      const res = await axiosInstance.post('/books', payload);
      const created = res.data;
      setJustAdded(gid);
      setTimeout(() => setJustAdded(null), 1200);
      onAdded?.(created);
    } catch (e) {
      alert(e?.response?.data?.message || e?.message || 'Could not add book');
    } finally {
      setAddingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <input
        className="input-field"
        placeholder="Search books (min 2 characters)…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        aria-label="Search Google Books"
      />
      {err ? <div className="text-red-600 text-sm">{err}</div> : null}

      <div className="space-y-3">
        {!canSearch && !loading ? null : loading ? (
          <>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-neutral-200 bg-white p-4 flex gap-3 items-center">
                <div className="w-12 h-16 rounded bg-neutral-200 animate-pulse" />
                <div className="flex-1">
                  <div className="h-4 w-1/3 bg-neutral-200 rounded animate-pulse" />
                  <div className="mt-2 h-3 w-2/3 bg-neutral-200 rounded animate-pulse" />
                </div>
                <div className="w-32 h-10 bg-neutral-200 rounded-lg animate-pulse" />
              </div>
            ))}
          </>
        ) : results.length === 0 ? null : (
          results.map((r, idx) => {
            const already = libraryIdSet?.has(r.id);
            const isAdding = addingId === r.id;
            const wasJustAdded = justAdded === r.id;

            return (
              <div
                key={`${r.id}-${idx}`}
                className="rounded-xl border border-neutral-200 bg-gradient-to-br from-violet-50 to-fuchsia-50 p-4 flex gap-3 items-center"
              >
                <div className="relative w-12 h-16 rounded overflow-hidden border border-neutral-300 bg-white shrink-0">
                  {r.cover ? (
                    <img
                      src={r.cover}
                      alt={r.title}
                      className="absolute inset-0 w-full h-full object-cover"
                      loading="lazy"
                      decoding="async"
                      referrerPolicy="no-referrer"
                      onError={(e) => { e.currentTarget.src = 'https://placehold.co/96x128/EEE/555?text=No+Cover'; }}
                    />
                  ) : (
                    <img
                      src="https://placehold.co/96x128/EEE/555?text=No+Cover"
                      alt="No cover"
                      className="absolute inset-0 w-full h-full object-cover"
                      loading="lazy"
                      decoding="async"
                    />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-neutral-900 truncate">{r.title}</div>
                  <div className="text-sm text-neutral-700 truncate">{r.authors || 'Unknown author'}</div>
                </div>

                <div className="flex items-center gap-2">
                  {already || wasJustAdded ? (
                    <span className="px-3 py-2 rounded-lg border border-green-300 bg-green-50 text-green-700">
                      ✓ In Library
                    </span>
                  ) : (
                    <button
                      type="button"
                      className="btn-primary"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleAdd(r);
                      }}
                      disabled={isAdding}
                    >
                      {isAdding ? 'Adding…' : 'Add to Library'}
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
