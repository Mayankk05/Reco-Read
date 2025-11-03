
export const formatDate = (d) => {
  if (!d) return 'N/A';
  const dt = new Date(d);
  return dt.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
};

export const formatShortDate = (d) => {
  if (!d) return 'N/A';
  const dt = new Date(d);
  return dt.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
};

export const truncateText = (text, max = 160) => {
  if (!text) return '';
  if (text.length <= max) return text;
  return `${text.slice(0, max)}…`;
};

export const getInitials = (name) => {
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const getBookCover = (url) =>
  url || 'https://via.placeholder.com/240x360/9333ea/ffffff?text=No+Cover';

export function getBookCoverHighRes(url, fallback = 'https://via.placeholder.com/160x240/9333ea/ffffff?text=No+Cover') {
  if (!url || typeof url !== 'string') return fallback;

  try {
    const u = new URL(url.replace('http://', 'https://'));
    if (u.hostname.includes('google') && u.searchParams) {
      if (!u.searchParams.has('img')) u.searchParams.set('img', '1');
      const existing = u.searchParams.get('zoom');
      const desired = Math.min(2, Math.max(1, Number(existing || 2)));
      u.searchParams.set('zoom', String(desired));
      return u.toString();
    }
    return url;
  } catch {
    return url;
  }
}

export const parseErrorMessage = (error) => {
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.response?.data?.error) return error.response.data.error;
  if (error?.message) return error.message;
  return 'Unexpected error';
};

export const debounce = (func, delay = 400) => {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => func(...args), delay);
  };
};

export function computeMatchScore(rec, source) {
  const srcTags = Array.isArray(source?.tags) ? source.tags : [];
  const shared = Array.isArray(rec?.sharedTags) ? rec.sharedTags : [];

  if (srcTags.length > 0 && shared.length > 0) {
    const pct = Math.round((shared.length / new Set(srcTags).size) * 100);
    return clamp(Math.min(98, Math.max(60, pct)), 0, 100);
  }

  const a1 = (source?.author || '').trim().toLowerCase();
  const a2 = (rec?.book?.author || '').trim().toLowerCase();
  if (a1 && a2 && a1 === a2) return 88;

  const t1 = (source?.title || '').toLowerCase();
  const t2 = (rec?.book?.title || '').toLowerCase();
  if (t1 && t2) {
    const w1 = new Set(t1.split(/[^a-z0-9]+/).filter((w) => w.length >= 4));
    const w2 = new Set(t2.split(/[^a-z0-9]+/).filter((w) => w.length >= 4));
    const inter = [...w1].filter((w) => w2.has(w)).length;
    const uni = new Set([...w1, ...w2]).size || 1;
    const j = inter / uni;
    const pct = Math.round(60 + j * 32); // 60..92 window
    if (!Number.isNaN(pct) && pct > 60) return clamp(pct, 60, 92);
  }

  return null;
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}
