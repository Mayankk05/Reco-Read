import { useEffect, useState } from 'react';
import { getBookReadingEvents } from '../../api/readingApi';
import { parseErrorMessage, truncateText } from '../../utils/helpers';

function EventBadge({ type }) {
  const t = String(type || '').toUpperCase();
  const map = {
    OPENED: { label: 'Opened', cls: 'bg-neutral-100 text-neutral-800 border-neutral-300' },
    PROGRESS: { label: 'Progress', cls: 'bg-violet-100 text-violet-800 border-violet-200' },
    FINISHED: { label: 'Finished', cls: 'bg-green-100 text-green-800 border-green-200' },
  };
  const v = map[t] || { label: t || 'Event', cls: 'bg-neutral-100 text-neutral-800 border-neutral-300' };
  return <span className={`px-2 py-0.5 rounded-full text-xs border ${v.cls}`}>{v.label}</span>;
}

export default function ReadingHistoryPanel({ bookId, className = '' }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  const load = async () => {
    if (!bookId) return;
    setLoading(true);
    setErr('');
    try {
      const data = await getBookReadingEvents(bookId);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookId]);

  return (
    <div className={`widget-card ${className}`}>
      <div className="flex items-center justify-between">
        <div className="text-base font-semibold text-neutral-900">Reading history</div>
        <button type="button" className="btn-ghost px-2 py-1 text-sm" onClick={load} aria-label="Refresh history">
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="mt-3 space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 rounded bg-neutral-200 animate-pulse" />
          ))}
        </div>
      ) : err ? (
        <div className="mt-3 text-sm text-error-500">{err}</div>
      ) : items.length === 0 ? (
        <div className="mt-3 text-sm text-neutral-700">No events yet.</div>
      ) : (
        <div className="mt-3 space-y-2">
          {items.map((e) => {
            const when = e.createdAt ? new Date(e.createdAt).toLocaleString() : '';
            const bits = [];
            if (typeof e.progressPercent === 'number') bits.push(`${e.progressPercent}%`);
            if (typeof e.page === 'number') bits.push(`p.${e.page}`);
            if (typeof e.durationSeconds === 'number' && e.durationSeconds > 0) {
              const m = Math.floor(e.durationSeconds / 60);
              const s = e.durationSeconds % 60;
              bits.push(`${m ? `${m}m` : ''}${s ? `${s}s` : ''}`.trim());
            }
            const meta = bits.join(' • ');
            return (
              <div key={e.id} className="rounded-lg border border-neutral-200 bg-white px-3 py-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <EventBadge type={e.eventType} />
                      {meta && <div className="text-sm text-neutral-800">{meta}</div>}
                    </div>
                    {e.note && (
                      <div className="text-sm text-neutral-700 mt-1">
                        {truncateText(e.note, 180)}
                      </div>
                    )}
                  </div>
                  {when && <div className="text-xs text-neutral-500 shrink-0">{when}</div>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}