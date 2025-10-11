import { useState } from 'react';
import { addBook } from '../../api/bookApi';

export default function ManualBookForm({ onAdded }) {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [publisher, setPublisher] = useState('');
  const [description, setDescription] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [isbn10, setIsbn10] = useState('');
  const [isbn13, setIsbn13] = useState('');
  const [pageCount, setPageCount] = useState('');
  const [tagsCsv, setTagsCsv] = useState('');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setErr('Title is required');
      return;
    }
    setErr('');
    setSaving(true);
    try {
      const tags = tagsCsv
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
        .slice(0, 3);
      const payload = {
        title: title.trim(),
        author: author.trim() || null,
        publisher: publisher.trim() || null,
        description: description.trim() || null,
        coverImageUrl: coverImageUrl.trim() || null,
        isbn10: isbn10.trim() || null,
        isbn13: isbn13.trim() || null,
        pageCount: pageCount ? Number(pageCount) : null,
        tags,
      };
      const created = await addBook(payload);
      onAdded?.(created);
    } catch (e2) {
      setErr(e2?.response?.data?.message || e2?.message || 'Could not save book');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="grid gap-3">
      <input className="input-field" placeholder="Title *" value={title} onChange={(e) => setTitle(e.target.value)} />
      <input className="input-field" placeholder="Author" value={author} onChange={(e) => setAuthor(e.target.value)} />
      <input className="input-field" placeholder="Publisher" value={publisher} onChange={(e) => setPublisher(e.target.value)} />
      <textarea className="input-field min-h-[120px]" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
      <input className="input-field" placeholder="Cover Image URL" value={coverImageUrl} onChange={(e) => setCoverImageUrl(e.target.value)} />
      <div className="grid sm:grid-cols-3 gap-3">
        <input className="input-field" placeholder="ISBN-10" value={isbn10} onChange={(e) => setIsbn10(e.target.value)} />
        <input className="input-field" placeholder="ISBN-13" value={isbn13} onChange={(e) => setIsbn13(e.target.value)} />
        <input className="input-field" placeholder="Page Count" value={pageCount} onChange={(e) => setPageCount(e.target.value)} />
      </div>
      <input
        className="input-field"
        placeholder="Tags (comma separated, up to 3) e.g. fantasy, classic"
        value={tagsCsv}
        onChange={(e) => setTagsCsv(e.target.value)}
      />
      {err && <div className="text-error-500">{err}</div>}
      <div className="flex justify-end">
        <button className="btn-primary" type="submit" disabled={saving}>
          {saving ? 'Saving…' : 'Add Book'}
        </button>
      </div>
    </form>
  );
}