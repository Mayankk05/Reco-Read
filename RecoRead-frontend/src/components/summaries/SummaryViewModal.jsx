import { useEffect, useMemo, useRef, useState } from 'react';

export default function SummaryViewModal({ open, summary, onClose }) {
  const overlayRef = useRef(null);
  const closeBtnRef = useRef(null);
  const [copied, setCopied] = useState('');

  const createdAt = useMemo(() => {
    if (!summary?.createdAt) return '';
    try {
      const d = new Date(summary.createdAt);
      return d.toLocaleString();
    } catch {
      return String(summary.createdAt);
    }
  }, [summary?.createdAt]);

  const provider = summary?.aiProvider || summary?.model || 'AI';

  const originalText = summary?.originalText || '';
  const summaryText = summary?.summaryText || '';

  const originalStats = useMemo(() => ({
    words: originalText ? originalText.trim().split(/\s+/).length : 0,
    chars: originalText?.length || 0,
  }), [originalText]);

  const summaryStats = useMemo(() => ({
    words: summaryText ? summaryText.trim().split(/\s+/).length : 0,
    chars: summaryText?.length || 0,
  }), [summaryText]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const t = setTimeout(() => closeBtnRef.current?.focus(), 0);
    return () => {
      clearTimeout(t);
      document.body.style.overflow = prev;
      setCopied('');
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const handleOverlay = (e) => {
    if (e.target === overlayRef.current) onClose?.();
  };

  const doCopy = async (label, text) => {
    try {
      await navigator.clipboard.writeText(text || '');
      setCopied(label);
      setTimeout(() => setCopied(''), 1200);
    } catch {
      // ignore
    }
  };

  const downloadText = (filename, text) => {
    const blob = new Blob([text || ''], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  if (!open || !summary) return null;

  return (
    <div
      ref={overlayRef}
      onMouseDown={handleOverlay}
      className="fixed inset-0 z-50 bg-neutral-900/40 backdrop-blur-sm"
      aria-modal="true"
      role="dialog"
      aria-labelledby="summary-title"
    >
      <div className="min-h-full py-8 px-4 flex items-start justify-center overflow-auto">
        <div className="mx-auto w-full max-w-5xl rounded-2xl border border-neutral-200 bg-white shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200 bg-gradient-to-r from-violet-50 to-fuchsia-50 rounded-t-2xl">
            <div className="flex items-center gap-3">
              <h2 id="summary-title" className="text-lg sm:text-xl font-semibold text-neutral-900">
                Summary
              </h2>
              {provider ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full bg-violet-100 text-violet-800">
                  {provider}
                </span>
              ) : null}
            </div>
            <div className="flex items-center gap-3">
              {createdAt ? (
                <span className="text-xs text-neutral-700 bg-white/70 border border-neutral-200 px-2.5 py-1 rounded-lg">
                  Created: {createdAt}
                </span>
              ) : null}
              <button
                ref={closeBtnRef}
                type="button"
                onClick={onClose}
                className="px-3 py-2 rounded-lg border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-800"
                aria-label="Close"
              >
                Close
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="p-5">
            {/* Responsive: side-by-side on md+, stacked on mobile */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Original */}
              <SectionCard
                title="Original"
                text={originalText}
                stats={originalStats}
                onCopy={() => doCopy('original', originalText)}
                onDownload={() =>
                  downloadText(
                    `original-${summary?.id || 'summary'}.txt`,
                    originalText
                  )
                }
                copied={copied === 'original'}
              />

              {/* Generated summary */}
              <SectionCard
                title={`Summary${provider ? ` (${provider})` : ''}`}
                text={summaryText}
                stats={summaryStats}
                onCopy={() => doCopy('summary', summaryText)}
                onDownload={() =>
                  downloadText(
                    `summary-${summary?.id || 'summary'}.txt`,
                    summaryText
                  )
                }
                copied={copied === 'summary'}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionCard({ title, text, stats, onCopy, onDownload, copied }) {
  return (
    <div className="rounded-xl border border-neutral-200 bg-gradient-to-br from-violet-50/60 to-fuchsia-50/40">
      <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-neutral-200">
        <div className="flex items-center gap-2">
          <h3 className="text-base sm:text-lg font-semibold text-neutral-900">{title}</h3>
          <div className="hidden sm:flex items-center gap-2">
            <CountPill label="words" value={stats?.words ?? 0} />
            <CountPill label="chars" value={stats?.chars ?? 0} />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCopy}
            className="px-3 py-1.5 rounded-lg border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-800 text-sm"
            title="Copy to clipboard"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
          <button
            type="button"
            onClick={onDownload}
            className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-sm hover:from-violet-700 hover:to-fuchsia-700"
            title="Download as .txt"
          >
            Download
          </button>
        </div>
      </div>
      <div className="p-4">
        <div className="rounded-lg border border-neutral-200 bg-white px-4 py-3 text-neutral-800 leading-relaxed whitespace-pre-wrap">
          {text || '—'}
        </div>
        {/* counts on mobile */}
        <div className="sm:hidden mt-2 flex items-center gap-2">
          <CountPill label="words" value={stats?.words ?? 0} />
          <CountPill label="chars" value={stats?.chars ?? 0} />
        </div>
      </div>
    </div>
  );
}

function CountPill({ label, value }) {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/70 border border-neutral-200 text-neutral-800 text-xs">
      <span className="font-semibold">{value}</span> {label}
    </span>
  );
}