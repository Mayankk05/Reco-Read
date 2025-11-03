import axiosInstance from './axiosConfig';

export async function generateSummary(bookId, originalText) {
  const res = await axiosInstance.post(`/books/${bookId}/summary`, { originalText });
  return res.data; 
}

export async function getSummaries(bookId) {
  const res = await axiosInstance.get(`/books/${bookId}/summaries`);
  return res.data; 
}

export async function getRecommendations(bookId, limit = 3) {
  const res = await axiosInstance.get(`/books/${bookId}/recommendations`, { params: { limit } });
  return res.data; 
}
