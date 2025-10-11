import { useEffect, useRef, useState } from 'react';
import { generateSummary } from '../../api/summaryApi';
import FocusTrap from '../common/FocusTrap';

const MAX_CHARS = 5000;
const COOLDOWN_SECONDS = 10;

export default function GenerateSummaryModal({ open, bookId, onClose, onGenerated }) {
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const initialFocusRef = useRef(null);

  useEffect(() => {
    if (!open) {
      setText('');
      setErr('');
      setCooldown(0);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setInterval(() => setCooldown((s) => s - 1), 1000);
    return () => clearInterval(id);
  }, [cooldown]);

  const handleGenerate = async () => {
    const value = text.trim();
    if (!value) {
      setErr('Please paste some text to summarize.');
      return;
    }
    if (value.length > MAX_CHARS) {
      setErr(`Please keep input under ${MAX_CHARS.toLocaleString()} characters.`);
      return;
    }
    setSubmitting(true);
    setErr('');

    try {
      const created = await generateSummary(bookId, value);
      onGenerated?.(created);
      onClose?.();
    } catch (e) {
      const status = e?.response?.status;
      const message = e?.response?.data?.message || e?.message || 'Something went wrong.';
      if (status === 429 || status === 503) {
        setErr('Please wait ~10 seconds before generating another summary.');
        setCooldown(COOLDOWN_SECONDS);
      } else if (status === 400 && message?.toLowerCase()?.includes('long')) {
        setErr('Your text is too long. Try a shorter passage or split it into parts.');
      } else if (status === 401) {
        setErr('Your session expired. Please sign in again.');
      } else {
        setErr(message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const onOverlayMouseDown = (e) => {
    if (e.target === e.currentTarget) onClose?.();
  };

  const chars = text.length;
  const remaining = Math.max(0, MAX_CHARS - chars);

  return open ? (
    <div
      className="fixed inset-0 z-50 bg-black/40 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="generate-summary-title"
      onMouseDown={onOverlayMouseDown}
    >
      <div className="min-h-full py-8 px-4">
        <FocusTrap
          initialFocusRef={initialFocusRef}
          onEscape={onClose}
          className="relative w-full max-w-2xl mx-auto rounded-xl border border-neutral-300 bg-card-500 p-6 shadow-xl max-h-[85vh] flex flex-col"
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="absolute top-2 right-2 h-9 w-9 rounded-full bg-neutral-200 text-neutral-800 hover:bg-neutral-300 flex items-center justify-center shadow"
          >
            ×
          </button>

          <div className="flex items-center justify-between mb-3">
            <h3 id="generate-summary-title" className="text-lg font-semibold text-neutral-900">
              Generate AI Summary
            </h3>
            <button
              type="button"
              ref={initialFocusRef}
              onClick={onClose}
              className="px-3 py-2 rounded border border-neutral-400"
            >
              Close
            </button>
          </div>

          <p className="text-sm text-neutral-700">
            Paste your notes or an excerpt. Keep it focused — shorter inputs produce clearer summaries.
          </p>
          <textarea
            className="input-field mt-4 min-h-[180px]"
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, MAX_CHARS))}
            placeholder="Paste text to summarize (max 5000 characters)"
          />
          <div className="mt-1 text-xs text-neutral-600">{remaining.toLocaleString()} characters remaining</div>

          {err && <div className="text-error-500 mt-2">{err}</div>}

          <div className="mt-4 flex items-center justify-end gap-3">
            {cooldown > 0 && <div className="text-sm text-neutral-700">Please wait {cooldown}s…</div>}
            <button type="button" onClick={onClose} className="px-4 py-2 rounded border border-neutral-400">
              Cancel
            </button>
            <button type="button" disabled={submitting || cooldown > 0} onClick={handleGenerate} className="btn-primary">
              {submitting ? 'Generating…' : 'Generate'}
            </button>
          </div>

          <div className="text-xs text-neutral-600 mt-2">
            Tip: If the provider flags your text or it’s too long, try a shorter passage or different wording.
          </div>
        </FocusTrap>
      </div>
    </div>
  ) : null;
}