import axiosInstance from './axiosConfig';

// Search Google Books (public endpoint) using POST with query params
export async function searchGoogleBooks(q, maxResults = 10, signal) {
  const res = await axiosInstance.post('/books/search', null, {
    params: { q, maxResults },
    signal,
  });
  return res.data; // { totalItems, items: [...] }
}

// Add a book to the user's library
export async function addBook(payload) {
  const res = await axiosInstance.post('/books', payload);
  return res.data; // BookResponse
}

// Get a single book
export async function getBookById(id) {
  const res = await axiosInstance.get(`/books/${id}`);
  return res.data; // BookResponse
}

// Delete a book (handles 204 and 409 gracefully)
export async function deleteBook(id) {
  try {
    const res = await axiosInstance.delete(`/books/${id}`);
    // Backend returns 204 No Content on success; res.data may be undefined
    return res.status >= 200 && res.status < 300;
  } catch (e) {
    // If deletion is blocked by related data (FK constraint), backend should return 409
    if (e?.response?.status === 409) {
      const msg =
        e.response?.data?.message ||
        'Cannot delete book because it has related data (e.g., reading history). Remove related records first.';
      throw new Error(msg);
    }
    // Re-throw other errors (404, 500, network, etc.)
    throw e;
  }
}

// List books with pagination, optional search/tag and sort
export async function listBooks({ search, tag, page = 0, size = 12, sort = 'createdAt,desc' } = {}) {
  const params = { page, size, sort };
  if (search) params.search = search;
  if (tag) params.tag = tag;
  const res = await axiosInstance.get('/books', { params });
  return res.data; // Spring Page<BookResponse>
}

// Get all distinct tags used by this user
export async function getAllTags() {
  const res = await axiosInstance.get('/books/tags');
  return res.data; // string[]
}

// Total library size using totalElements from a tiny page
export async function getLibraryCount() {
  const res = await axiosInstance.get('/books', { params: { page: 0, size: 1, sort: 'createdAt,desc' } });
  return typeof res.data?.totalElements === 'number' ? res.data.totalElements : null;
}
export async function getBookByUserNo(no) {
  const res = await axiosInstance.get(`/books/no/${no}`);
  return res.data; // BookResponse
}