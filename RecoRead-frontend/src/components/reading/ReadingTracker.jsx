import { useEffect, useMemo, useState } from 'react';
import { getLatestReadingState, postReadingEvent } from '../../api/readingApi';

function bookStorageKey(book) {
  if (!book) return null;
  if (book.id) return `recoread:reading:${book.id}`;
  if (book.googleBooksId) return `recoread:reading:gb:${book.googleBooksId}`;
  const slug = (book.title || 'untitled').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);
  return `recoread:reading:title:${slug}`;
}
function stateKey(id) {
  return `recoread:reading-state:${id}`;
}
function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }

export default function ReadingTracker({ book, onSaved }) {
  const [progress, setProgress] = useState('');
  const [page, setPage] = useState('');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [useBackend, setUseBackend] = useState(true);

  const storageKey = useMemo(() => bookStorageKey(book), [book]);
  const totalPages = Number(book?.pageCount) > 0 ? Number(book.pageCount) : null;

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!book?.id) {
        setUseBackend(false);
        tryLoadLocal();
        return;
      }
      try {
        const state = await getLatestReadingState(book.id);
        if (cancelled) return;
        if (typeof state?.progressPercent === 'number') setProgress(String(state.progressPercent));
        if (typeof state?.page === 'number') setPage(String(state.page));
        if (typeof state?.note === 'string') setNote(state.note);
        setUseBackend(true);
      } catch {
        setUseBackend(false);
        tryLoadLocal();
      }
    }
    const tryLoadLocal = () => {
      if (book?.id) {
        try {
          const raw = localStorage.getItem(stateKey(book.id));
          if (raw) {
            const data = JSON.parse(raw);
            if (typeof data.progressPercent === 'number') setProgress(String(data.progressPercent));
            if (typeof data.page === 'number') setPage(String(data.page));
          }
        } catch {}
      }
      if (!storageKey) return;
      try {
        const raw = localStorage.getItem(storageKey);
        if (raw) {
          const data = JSON.parse(raw);
          if (typeof data.progressPercent === 'number') setProgress(String(data.progressPercent));
          if (typeof data.page === 'number') setPage(String(data.page));
          if (typeof data.note === 'string') setNote(data.note);
        }
      } catch {}
    };
    load();
    return () => { cancelled = true; };
  }, [book?.id, storageKey]);

  useEffect(() => {
    if (!useBackend || !book?.id) return;
    postReadingEvent(book.id, { eventType: 'OPENED' }).catch(() => {});
  }, [useBackend, book?.id]);

  const handlePageChange = (e) => {
    const val = e.target.value;
    if (val === '') { setPage(''); return; }
    const n = Number(val); if (Number.isNaN(n)) return;
    const cleaned = String(Math.max(0, Math.floor(n)));
    setPage(cleaned);
    if (totalPages) {
      const pct = clamp(Math.round((Number(cleaned) / totalPages) * 100), 0, 100);
      setProgress(String(pct));
    }
  };

  const handleProgressChange = (e) => {
    const val = e.target.value;
    if (val === '') { setProgress(''); return; }
    const n = Number(val); if (Number.isNaN(n)) return;
    const pct = clamp(Math.round(n), 0, 100);
    setProgress(String(pct));
    if (totalPages) {
      const approxPage = clamp(Math.round((pct / 100) * totalPages), 0, totalPages);
      setPage(String(approxPage));
    }
  };

  const showSaved = () => {
    setJustSaved(true);
    window.clearTimeout(showSaved._t);
    showSaved._t = window.setTimeout(() => setJustSaved(false), 1200);
  };

  const cacheCompactState = (bookId, { progressPercent, page }) => {
    if (!bookId) return;
    try {
      const now = new Date().toISOString();
      localStorage.setItem(stateKey(bookId), JSON.stringify({
        progressPercent: typeof progressPercent === 'number' ? progressPercent : undefined,
        page: typeof page === 'number' ? page : undefined,
        updatedAt: now,
      }));
    } catch {}
  };

  const onSaveProgress = async () => {
    setSaving(true);
    try {
      let pct = progress !== '' && !Number.isNaN(Number(progress)) ? clamp(Math.round(Number(progress)), 0, 100) : undefined;
      let pg = page !== '' && !Number.isNaN(Number(page)) ? Math.max(0, Math.round(Number(page))) : undefined;

      if (totalPages) {
        if (pg != null && pct == null) pct = clamp(Math.round((pg / totalPages) * 100), 0, 100);
        else if (pct != null && pg == null) pg = clamp(Math.round((pct / 100) * totalPages), 0, totalPages);
      }

      if (pct != null) setProgress(String(pct));
      if (pg != null) setPage(String(pg));

      if (useBackend && book?.id) {
        await postReadingEvent(book.id, { eventType: 'PROGRESS', progressPercent: pct, page: pg, note: note.trim() || undefined });
        cacheCompactState(book.id, { progressPercent: pct, page: pg });
      } else if (book?.id) {
        cacheCompactState(book.id, { progressPercent: pct, page: pg });
      }

      showSaved();
      onSaved?.({ progressPercent: pct, page: pg }); 
    } finally {
      setSaving(false);
    }
  };

  const onMarkFinished = async () => {
    setSaving(true);
    try {
      const computedPage =
        totalPages != null
          ? totalPages
          : (page !== '' && !Number.isNaN(Number(page)) ? Math.max(0, Math.round(Number(page))) : undefined);

      setProgress('100');
      if (computedPage != null) setPage(String(computedPage));

      if (useBackend && book?.id) {
        await postReadingEvent(book.id, { eventType: 'FINISHED', progressPercent: 100, page: computedPage });
        cacheCompactState(book.id, { progressPercent: 100, page: computedPage });
      } else if (book?.id) {
        cacheCompactState(book.id, { progressPercent: 100, page: computedPage });
      }

      showSaved();
      onSaved?.({ progressPercent: 100, page: computedPage });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-lg border border-neutral-300 bg-card-500 p-4">
      <div className="flex items-center justify-between">
        <div className="font-semibold text-neutral-900">Reading tracker</div>
        {justSaved && <div className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800 border border-green-200">Saved</div>}
      </div>

      <div className="mt-3 grid sm:grid-cols-3 gap-3">
        <div>
          <label className="text-sm text-neutral-700">Progress (%)</label>
          <input type="number" min="0" max="100" className="input-field mt-1" value={progress} onChange={handleProgressChange} placeholder="e.g., 25" />
        </div>
        <div>
          <label className="text-sm text-neutral-700">Page</label>
          <input type="number" min="0" className="input-field mt-1" value={page} onChange={handlePageChange} placeholder={totalPages ? `0–${totalPages}` : 'page #'} />
        </div>
        <div>
          <label className="text-sm text-neutral-700">Note (optional)</label>
          <input className="input-field mt-1" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Brief note…" />
        </div>
      </div>

      <div className="mt-3 flex gap-2">
        <button type="button" onClick={onSaveProgress} className="btn-primary" disabled={saving}>
          {saving ? 'Saving…' : 'Save Progress'}
        </button>
        <button type="button" onClick={onMarkFinished} className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-60" disabled={saving}>
          Mark Finished
        </button>
      </div>

      <div className="mt-2 text-xs text-neutral-600">
        {useBackend ? 'Synced to your account.' : 'Stored locally in this browser.'}
      </div>
    </div>
  );
}
