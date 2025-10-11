import { useEffect, useRef, useState } from 'react';
import SearchGoogleBooks from './SearchGoogleBooks';
import ManualBookForm from './ManualBookForm';

export default function AddBookModal({ open, onClose, onAdded }) {
  const [tab, setTab] = useState('search'); // 'search' | 'manual'
  const overlayRef = useRef(null);
  const closeBtnRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const t = setTimeout(() => closeBtnRef.current?.focus(), 0);
    return () => {
      clearTimeout(t);
      document.body.style.overflow = prev;
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

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      onMouseDown={handleOverlay}
      className="fixed inset-0 z-50 bg-neutral-900/40 backdrop-blur-sm"
      aria-modal="true"
      role="dialog"
      aria-labelledby="add-book-title"
    >
      <div className="min-h-full py-8 px-4 flex items-start justify-center overflow-auto">
        <div className="modal-panel mx-auto w-full max-w-4xl flex flex-col max-h-[85vh]">
          {/* Header */}
          <div className="modal-header sticky top-0 z-10">
            <div className="flex items-center gap-2">
              <span className="modal-title" id="add-book-title">Add Book</span>
              <span className="hidden sm:inline text-neutral-600">•</span>
              <span className="hidden sm:inline text-neutral-700">Search or enter details</span>
            </div>
            <button
              ref={closeBtnRef}
              type="button"
              onClick={onClose}
              className="modal-close"
              aria-label="Close add book modal"
            >
              Close
            </button>
          </div>

          {/* Tabs */}
          <div className="px-5 pt-4">
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setTab('search')}
                className={`seg-btn ${tab === 'search' ? 'seg-btn-active' : ''}`}
              >
                <span aria-hidden="true">🔎</span>
                <span className="truncate">Search Google Books</span>
              </button>
              <button
                type="button"
                onClick={() => setTab('manual')}
                className={`seg-btn ${tab === 'manual' ? 'seg-btn-active' : ''}`}
              >
                <span aria-hidden="true">✍️</span>
                <span className="truncate">Add Manually</span>
              </button>
            </div>
          </div>

          {/* Body (scrolls) */}
          <div className="modal-body flex-1 overflow-y-auto min-h-0">
            {tab === 'search' ? (
              <SearchGoogleBooks
                onAdded={(created) => {
                  onAdded?.(created);
                }}
              />
            ) : (
              <ManualBookForm
                onAdded={(created) => {
                  onAdded?.(created);
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}