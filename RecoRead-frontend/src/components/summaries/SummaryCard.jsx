import { formatShortDate, truncateText } from '../../utils/helpers';

export default function SummaryCard({ summary }) {
  return (
    <div className="rounded-lg border border-neutral-300 bg-card-500 p-4">
      <div className="text-xs text-neutral-600">Created: {formatShortDate(summary.createdAt)}</div>
      <div className="mt-2">
        <div className="text-sm text-neutral-700">
          <span className="font-semibold">Original:</span> {truncateText(summary.originalText, 220)}
        </div>
        <div className="text-sm text-neutral-900 mt-2">
          <span className="font-semibold">Summary ({summary.aiProvider || 'AI'}):</span> {summary.summaryText}
        </div>
      </div>
    </div>
  );
}