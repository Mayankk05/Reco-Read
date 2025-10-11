export default function Loading({ label = 'Loading...' }) {
  return (
    <div className="w-full flex items-center justify-center py-16">
      <div className="flex items-center gap-3">
        <div className="h-6 w-6 rounded-full border-4 border-neutral-300 border-top border-t-primary-600 animate-spin" />
        <span className="text-neutral-700 font-medium">{label}</span>
      </div>
    </div>
  );
}