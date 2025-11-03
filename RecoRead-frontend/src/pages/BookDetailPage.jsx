import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { getBookById, deleteBook, getBookByUserNo } from '../api/bookApi';
import { getLatestReadingState } from '../api/readingApi';
import { parseErrorMessage } from '../utils/helpers';

import BookDetail from '../components/books/BookDetail';
import ReadingTracker from '../components/reading/ReadingTracker';
import ProgressBar from '../components/reading/ProgressBar';
import SummaryList from '../components/summaries/SummaryList';
import RecommendationList from '../components/recommendations/RecommendationList';
import GenerateSummaryModal from '../components/summaries/GenerateSummaryModal';
import Loading from '../components/common/Loading';
import ErrorMessage from '../components/common/ErrorMessage';

function stateKey(id) {
  return `recoread:reading-state:${id}`;
}

export default function BookDetailPage() {
  const { id, no } = useParams(); 
  const nav = useNavigate();

  const [book, setBook] = useState(null);
  const [readingState, setReadingState] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [openGen, setOpenGen] = useState(false);
  const [summariesKey, setSummariesKey] = useState(0);

  const usingUserNo = !!no;

  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!id) return;
    try {
      const raw = localStorage.getItem(stateKey(id));
      if (raw) {
        const data = JSON.parse(raw);
        if (
          typeof data?.progressPercent === 'number' ||
          typeof data?.page === 'number' ||
          typeof data?.note === 'string'
        ) {
          setReadingState((prev) => prev ?? data);
        }
      }
    } catch {}
  }, [id]);

  const fetchReadingState = useCallback(async (bookId) => {
    try {
      const rs = await getLatestReadingState(bookId);
      if (!mountedRef.current) return;
      if (
        rs &&
        (typeof rs.progressPercent === 'number' || typeof rs.page === 'number' || typeof rs.note === 'string')
      ) {
        setReadingState(rs);
        try {
          localStorage.setItem(
            stateKey(bookId),
            JSON.stringify({
              progressPercent: rs.progressPercent,
              page: rs.page,
              note: rs.note,
              updatedAt: rs.updatedAt || new Date().toISOString(),
            })
          );
        } catch {}
      }
    } catch {}
  }, []);

  const load = useCallback(async () => {
    const key = usingUserNo ? no : id;
    if (!key) return;
    setLoading(true);
    setErr('');
    const currentKey = key;
    try {
      const b = usingUserNo ? await getBookByUserNo(currentKey) : await getBookById(currentKey);
      if (!mountedRef.current || key !== currentKey) return;
      setBook(b);
      if (b?.id) fetchReadingState(b.id);
    } catch (e) {
      if (!mountedRef.current || key !== currentKey) return;
      setErr(parseErrorMessage(e));
    } finally {
      if (mountedRef.current && key === currentKey) setLoading(false);
    }
  }, [id, no, usingUserNo, fetchReadingState]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible' && book?.id) {
        fetchReadingState(book.id);
      }
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [book?.id, fetchReadingState]);

  useEffect(() => {
    if (!book?.title) return;
    const prev = document.title;
    const n = typeof book?.userBookNo === 'number' ? ` #${book.userBookNo}` : '';
    document.title = `${book.title}${n} • RecoRead`;
    return () => {
      document.title = prev;
    };
  }, [book?.title, book?.userBookNo]);

  const handleDelete = async () => {
    if (!book?.id) return;
    const ok = window.confirm('Delete this book?');
    if (!ok) return;
    try {
      await deleteBook(book.id);
      try {
        localStorage.removeItem(stateKey(book.id));
      } catch {}
      nav('/library', { replace: true });
    } catch (e) {
      alert(parseErrorMessage(e));
    }
  };

  const handleSaved = (saved) => {
    if (
      saved &&
      (typeof saved.progressPercent === 'number' || typeof saved.page === 'number' || typeof saved.note === 'string')
    ) {
      setReadingState((prev) => ({
        ...(prev || {}),
        ...saved,
        updatedAt: new Date().toISOString(),
      }));
      if (book?.id) {
        try {
          localStorage.setItem(
            stateKey(book.id),
            JSON.stringify({
              progressPercent: saved.progressPercent,
              page: saved.page,
              note: saved.note,
              updatedAt: new Date().toISOString(),
            })
          );
        } catch {}
      }
    }
    if (book?.id) fetchReadingState(book.id);
  };

  if (loading) return <Loading label="Loading book..." />;

  if (err) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-6">
        <ErrorMessage message={err} onRetry={load} />
      </div>
    );
  }

  if (!book) return null;

  const pct = typeof readingState?.progressPercent === 'number' ? readingState.progressPercent : null;
  const currentPage = typeof readingState?.page === 'number' ? readingState.page : null;
  const latestNote = typeof readingState?.note === 'string' ? readingState.note : '';

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      {/* Header actions */}
      <div className="flex items-center justify-between mb-4">
        <button onClick={() => nav('/library')} className="btn-ghost">
          ← Back to Library
        </button>
        <div className="flex gap-2">
          <button onClick={() => setOpenGen(true)} className="btn-primary">
            Generate Summary
          </button>
          <button onClick={handleDelete} className="btn-danger">
            Delete
          </button>
        </div>
      </div>

      <div className="mb-3">
        <ProgressBar
          percent={pct ?? 0}
          label={
            pct != null
              ? `Reading progress • ${pct}%${
                  book.pageCount && currentPage != null ? ` • Page ${currentPage}/${book.pageCount}` : ''
                }`
              : 'Reading progress • No progress yet'
          }
        />
      </div>

      {latestNote ? (
        <div className="rounded-lg border border-neutral-300 bg-card-500 p-3 mb-4">
          <div className="text-sm text-neutral-700">
            <span className="font-semibold text-neutral-900">Latest note:</span>{' '}
            <span className="whitespace-pre-wrap break-words">{latestNote}</span>
          </div>
        </div>
      ) : null}

      <BookDetail book={book} />

      <div className="mt-5">
        <ReadingTracker book={book} onSaved={handleSaved} />
      </div>

      <div className="mt-7 grid md:grid-cols-2 gap-5 items-start">
        <section>
          <h3 className="section-title">Summaries</h3>
          <p className="section-subtitle">Your AI summaries and notes for this book.</p>
          <SummaryList key={summariesKey} bookId={book.id} />
        </section>

        <section>
          <h3 className="section-title">Recommendations</h3>
          <p className="section-subtitle">Books you might like based on this title and your library.</p>
          <RecommendationList bookId={book.id} />
        </section>
      </div>

      <GenerateSummaryModal
        open={openGen}
        onClose={() => setOpenGen(false)}
        bookId={book.id}
        onGenerated={() => {
          setOpenGen(false);
          setSummariesKey((k) => k + 1);
        }}
      />
    </div>
  );
}
