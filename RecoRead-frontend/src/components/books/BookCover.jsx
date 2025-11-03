import React, { useMemo, useState } from 'react';

function toSafeCover(url) {
  const fallback = 'https://placehold.co/224x336/ede9fe/1f2937?text=No+Cover'; // 2:3
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
    return u.toString();
  } catch {
    return url.startsWith('http') ? url : fallback;
  }
}

export default function BookCover({
  src,
  alt = 'Book cover',
  className = '',
  widthClass = 'w-48 md:w-56',
  priority = true,
}) {
  const [failed, setFailed] = useState(false);
  const safeSrc = useMemo(() => toSafeCover(src), [src]);
  const fallback = 'https://placehold.co/224x336/ede9fe/1f2937?text=No+Cover';

  return (
    <div className={`relative ${widthClass} aspect-[2/3] overflow-hidden rounded-xl border border-neutral-300 bg-white shadow-sm ${className}`}>
      <img
        src={failed ? fallback : (safeSrc || fallback)}
        alt={alt}
        className="absolute inset-0 h-full w-full object-cover"
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        decoding="async"
        onError={() => setFailed(true)}
        referrerPolicy="no-referrer"
      />
    </div>
  );
}
