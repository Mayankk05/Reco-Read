export default function ConfirmDialog({ open, title = 'Confirm', message, onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-xl border border-neutral-300 bg-card-500 p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-neutral-900">{title}</h3>
        <p className="mt-2 text-neutral-700">{message}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onCancel} className="px-4 py-2 rounded border border-neutral-400 text-neutral-800">
            Cancel
          </button>
          <button onClick={onConfirm} className="px-4 py-2 rounded bg-error-500 text-white">
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}