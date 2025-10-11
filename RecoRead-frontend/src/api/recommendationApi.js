import axiosInstance from './axiosConfig';

// GET /api/books/{bookId}/recommendations
export async function getRecommendations(bookId, limit) {
  const res = await axiosInstance.get(`/books/${bookId}/recommendations`, {
    params: { limit },
  });
  return res.data; // Could be { recommendations: [], sourceBook: {} } or { items: [] } etc.
}