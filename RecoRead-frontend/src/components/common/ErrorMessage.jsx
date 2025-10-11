export default function ErrorMessage({ message = 'Something went wrong.', onRetry }) {
  return (
    <div className="p-4 rounded-lg border border-error-500 bg-red-50 text-error-500">
      <div className="flex items-center justify-between gap-3">
        <p className="font-medium">{message}</p>
        {onRetry && (
          <button onClick={onRetry} className="px-3 py-1 rounded bg-error-500 text-white hover:opacity-90">
            Retry
          </button>
        )}
      </div>
    </div>
  );
}