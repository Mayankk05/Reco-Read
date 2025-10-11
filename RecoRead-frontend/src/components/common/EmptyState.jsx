export default function EmptyState({
  title = 'Your library is empty',
  subtitle = 'Add your first book to start tracking, summarizing, and getting recommendations.',
  actionLabel = 'Add Book',
  onAction,
  illustration = 'https://raw.githubusercontent.com/twitter/twemoji/master/assets/svg/1f4d6.svg', // 📖
}) {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-10 shadow-sm text-center">
      <div className="mx-auto mb-6 h-28 w-28 rounded-2xl bg-gradient-to-br from-violet-100 to-fuchsia-100 flex items-center justify-center">
        <img
          src={illustration}
          alt="Books"
          className="h-16 w-16 opacity-90"
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
        />
      </div>
      <h3 className="text-xl font-semibold text-neutral-900">{title}</h3>
      <p className="mt-2 text-neutral-700 max-w-xl mx-auto">{subtitle}</p>
      {onAction && (
        <div className="mt-6">
          <button type="button" onClick={onAction} className="btn-primary">
            {actionLabel}
          </button>
        </div>
      )}
    </div>
  );
}