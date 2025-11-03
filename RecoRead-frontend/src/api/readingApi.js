import axiosInstance from './axiosConfig';

export async function postReadingEvent(bookId, payload) {
  const res = await axiosInstance.post(`/books/${bookId}/reading-events`, payload);
  return res.data;
}

export async function getBookReadingEvents(bookId) {
  const res = await axiosInstance.get(`/books/${bookId}/reading-events`);
  return res.data;
}

export async function getLatestReadingState(bookId) {
  const res = await axiosInstance.get(`/books/${bookId}/reading-state`, {
    validateStatus: (s) => (s >= 200 && s < 300) || s === 204,
  });
  if (res.status === 204 || !res.data || Object.keys(res.data || {}).length === 0) {
    return null;
  }
  return res.data;
}

export async function getReadingHistory(limit = 50) {
  const res = await axiosInstance.get('/reading/history', { params: { limit } });
  return res.data;
}
