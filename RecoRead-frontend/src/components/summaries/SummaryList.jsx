import { useEffect, useState } from 'react';
import { getSummaries } from '../../api/summaryApi';
import SummaryViewModal from './SummaryViewModal';

export default function SummaryList({ bookId }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [active, setActive] = useState(null);

  const load = async () => {
    setLoading(true);
    setErr('');
    try {
      if (!bookId) {
        setItems([]);
        return;
      }
      const data = await getSummaries(bookId);
      const list = Array.isArray(data) ? data : (data?.items || data?.summaries || []);
      const sorted = [...(list || [])].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setItems(sorted);
    } catch (e) {
      setErr(e?.response?.data?.message || e?.message || 'Failed to load summaries.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [bookId]);

  if (loading) return <div className="text-neutral-700">Loading summaries…</div>;
  if (err) return <div className="text-red-600 text-sm">{err}</div>;
  if (!items.length) return <div className="text-neutral-700">No summaries yet.</div>;

  const preview = (t, n = 220) => {
    if (!t) return '';
    if (t.length <= n) return t;
    return t.slice(0, n) + '…';
    };

  return (
    <>
      <div className="grid gap-4">
        {items.map((s) => {
          const created = new Date(s.createdAt).toLocaleString();
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => setActive(s)}
              className="text-left rounded-lg border border-neutral-300 bg-card-500 p-4 hover:bg-card-500/70 focus:outline-none focus:ring-2 focus:ring-primary-500 transition"
              aria-label={`Open summary created ${created}`}
            >
              <div className="text-xs text-neutral-600 mb-1">Created: {created}</div>
              <div className="text-sm text-neutral-800">
                <span className="font-semibold">Original:</span> {preview(s.originalText)}
              </div>
              <div className="text-sm text-neutral-800 mt-2">
                <span className="font-semibold">Summary{ s.aiProvider ? ` (${s.aiProvider})` : '' }:</span>{' '}
                {preview(s.summaryText) || '[Summary unavailable]'}
              </div>
              <div className="mt-3 text-xs text-primary-700 underline">Click to view full</div>
            </button>
          );
        })}
      </div>

      <SummaryViewModal open={!!active} summary={active} onClose={() => setActive(null)} />
    </>
  );
}
