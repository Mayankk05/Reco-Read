import { formatDate } from '../../utils/helpers';
import BookCover from './BookCover';

export default function BookDetail({ book }) {
  if (!book) return null;

  const showUserNo = typeof book.userBookNo === 'number' && book.userBookNo > 0;

  return (
    <div className="hero-card shadow-xl">
      <div className="flex flex-col lg:flex-row gap-5">
        {/* Cover (compact) */}
        <div className="lg:w-[220px] lg:shrink-0">
          <BookCover
            src={book.coverImageUrl}
            alt={book.title}
            widthClass="w-[180px] md:w-[200px] lg:w-[220px]"
            priority
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            {showUserNo && (
              <span className="chip" title={`Your book number`}>
                # {book.userBookNo}
              </span>
            )}
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-neutral-900 leading-tight break-words">
              {book.title}
            </h1>
          </div>
          <p className="text-neutral-700 mt-1 text-base md:text-lg break-words">
            {book.author || 'Unknown author'}
          </p>

          {/* Meta grid */}
          <div className="meta-grid mt-4">
            <MetaItem label="Publisher" value={book.publisher || '—'} />
            <MetaItem label="Published" value={formatDate(book.publishedDate)} />
            <MetaItem label="Pages" value={book.pageCount || '—'} />
            <MetaItem label="ISBN‑10" value={book.isbn10 || '—'} />
            <MetaItem label="ISBN‑13" value={book.isbn13 || '—'} />
          </div>

          {/* Description (narrower measure) */}
          <div className="mt-5 max-w-3xl">
            <h4 className="text-base md:text-lg font-semibold text-neutral-900">Description</h4>
            <p className="mt-2 text-neutral-800 whitespace-pre-line leading-relaxed break-words text-[15px] md:text-base">
              {book.description || 'No description'}
            </p>
          </div>

          {/* Tags */}
          {!!(book.tags && book.tags.length) && (
            <div className="mt-4 flex flex-wrap gap-2">
              {(book.tags || []).map((t) => (
                <span className="chip" key={t}># {t}</span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MetaItem({ label, value }) {
  return (
    <div className="meta-item">
      <div className="meta-label">{label}</div>
      <div className="meta-value">{value}</div>
    </div>
  );
}