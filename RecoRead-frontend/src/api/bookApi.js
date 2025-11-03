import axiosInstance from './axiosConfig';

export async function searchGoogleBooks(q, maxResults = 10, signal) {
  const res = await axiosInstance.post('/books/search', null, {
    params: { q, maxResults },
    signal,
  });
  return res.data; 
}


export async function addBook(payload) {
  const res = await axiosInstance.post('/books', payload);
  return res.data; 
}


export async function getBookById(id) {
  const res = await axiosInstance.get(`/books/${id}`);
  return res.data; 
}

export async function deleteBook(id) {
  try {
    const res = await axiosInstance.delete(`/books/${id}`);
    return res.status >= 200 && res.status < 300;
  } catch (e) {
    if (e?.response?.status === 409) {
      const msg =
        e.response?.data?.message ||
        'Cannot delete book because it has related data (e.g., reading history). Remove related records first.';
      throw new Error(msg);
    }
    throw e;
  }
}

export async function listBooks({ search, tag, page = 0, size = 12, sort = 'createdAt,desc' } = {}) {
  const params = { page, size, sort };
  if (search) params.search = search;
  if (tag) params.tag = tag;
  const res = await axiosInstance.get('/books', { params });
  return res.data; 
}

export async function getAllTags() {
  const res = await axiosInstance.get('/books/tags');
  return res.data; 
}

export async function getLibraryCount() {
  const res = await axiosInstance.get('/books', { params: { page: 0, size: 1, sort: 'createdAt,desc' } });
  return typeof res.data?.totalElements === 'number' ? res.data.totalElements : null;
}
export async function getBookByUserNo(no) {
  const res = await axiosInstance.get(`/books/no/${no}`);
  return res.data;
}
