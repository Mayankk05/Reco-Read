import { useEffect, useState } from 'react';
import { getAllTags } from '../../api/bookApi';

export default function TagFilter({ value = '', onChange }) {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setErr('');
      try {
        const data = await getAllTags();
        if (!cancelled) setTags(Array.isArray(data) ? data : []);
      } catch (e) {
        if (!cancelled) {
          setErr(e?.response?.data?.message || e?.message || 'Failed to load tags');
          setTags([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const hasTags = tags.length > 0;

  return (
    <div className="relative">
      <select
        className="seg-btn"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        aria-label="Filter by tag"
        title={err ? err : (hasTags ? 'Filter by tag' : 'No tags yet — add tags to your books')}
      >
        <option value="">All</option>
        {loading ? (
          <option value="" disabled>Loading…</option>
        ) : hasTags ? (
          tags.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))
        ) : (
          <option value="" disabled>No tags yet</option>
        )}
      </select>
      {err && <div className="absolute mt-1 text-xs text-red-600">{err}</div>}
    </div>
  );
}