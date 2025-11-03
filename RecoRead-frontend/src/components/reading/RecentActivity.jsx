import { useEffect, useState } from 'react';
import { getReadingHistory } from '../../api/readingApi';
import { getBookCoverHighRes, parseErrorMessage } from '../../utils/helpers';

function Pill({ children, tone = 'neutral' }) {
  const tones = {
    neutral: 'bg-neutral-100 text-neutral-800 border-neutral-300',
    violet: 'bg-violet-100 text-violet-800 border-violet-200',
    green: 'bg-green-100 text-green-800 border-green-200',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] border ${tones[tone] || tones.neutral}`}>
      {children}
    </span>
  );
}
const toneFor = (type) => {
  const t = String(type || '').toUpperCase();
  if (t === 'PROGRESS') return 'violet';
  if (t === 'FINISHED') return 'green';
  return 'neutral';
};

export default function RecentActivity({ limit = 16, className = '' }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  const load = async () => {
    setLoading(true);
    setErr('');
    try {
      const data = await getReadingHistory(limit);
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(parseErrorMessage(e));
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [limit]);

  return (
    <div className={`rounded-2xl border border-neutral-200 bg-card-500 p-3 shadow-sm ${className}`}>
      <div className="mb-2 flex items-center justify-between">
        <div className="text-[12px] font-semibold text-neutral-900">Recent activity</div>
        <button
          type="button"
          className="px-2 py-1 rounded-lg border border-neutral-300 bg-white hover:bg-neutral-50 text-[11px] text-neutral-800"
          onClick={load}
          aria-label="Refresh activity"
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="mt-2 space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-9 rounded-lg bg-neutral-200 animate-pulse" />
          ))}
        </div>
      ) : err ? (
        <div className="mt-2 text-xs text-error-500">{err}</div>
      ) : items.length === 0 ? (
        <div className="mt-2 text-xs text-neutral-700">No recent activity.</div>
      ) : (
        <div
          className="mt-1 space-y-2 overflow-y-auto pr-1"
          style={{ maxHeight: 200 }}
          role="list"
          aria-label="Recent reading events"
        >
          {items.slice(0, limit).map((e) => {
            const when = e.createdAt ? new Date(e.createdAt).toLocaleString() : '';
            return (
              <div
                key={e.id}
                role="listitem"
                className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white p-2"
              >
                <div className="relative w-7 h-10 rounded-md overflow-hidden border border-neutral-300 bg-white shrink-0">
                  <img
                    src={getBookCoverHighRes(e.bookCoverImageUrl)}
                    alt={e.bookTitle || 'Book cover'}
                    className="absolute inset-0 w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                    referrerPolicy="no-referrer"
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="text-[12px] font-medium text-neutral-900 truncate">
                      {e.bookTitle || 'Untitled'}
                    </div>
                    <Pill tone={toneFor(e.eventType)}>{String(e.eventType || '').toLowerCase()}</Pill>
                  </div>
                  <div className="mt-0.5 text-[10px] text-neutral-600 truncate">{when}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
