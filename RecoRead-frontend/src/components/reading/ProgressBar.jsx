export default function ProgressBar({ percent = 0, label }) {
  const pct = Math.max(0, Math.min(100, Math.round(Number(percent) || 0)));
  return (
    <div className="w-full">
      {label ? <div className="mb-2 text-sm font-medium text-neutral-800">{label}</div> : null}
      <div className="relative h-3 rounded-full bg-neutral-200 overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 transition-[width] duration-500"
          style={{ width: `${pct}%` }}
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          role="progressbar"
        />
      </div>
      <div className="mt-1 text-xs text-neutral-600">{pct}% complete</div>
    </div>
  );
}