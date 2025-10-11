import Pagination from '../common/Pagination';
import BookCard from './BookCard';

export default function BookGrid({ pageData, onOpen, onDelete, onPageChange }) {
  const content = pageData?.content || [];
  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {content.map((b) => (
          <BookCard key={b.id} book={b} onOpen={() => onOpen(b)} onDelete={() => onDelete(b)} />
        ))}
      </div>
      <Pagination
        page={pageData?.number || 0}
        totalPages={pageData?.totalPages || 0}
        isFirst={pageData?.first}
        isLast={pageData?.last}
        onPageChange={onPageChange}
      />
    </div>
  );
}