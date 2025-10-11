import axiosInstance from './axiosConfig';

// Create a summary for a book from user-provided text
export async function generateSummary(bookId, originalText) {
  const res = await axiosInstance.post(`/books/${bookId}/summary`, { originalText });
  return res.data; // SummaryResponse
}

// Get all summaries for a book
export async function getSummaries(bookId) {
  const res = await axiosInstance.get(`/books/${bookId}/summaries`);
  return res.data; // SummaryResponse[]
}

// Get recommendations for a book, with optional limit (default 3)
export async function getRecommendations(bookId, limit = 3) {
  const res = await axiosInstance.get(`/books/${bookId}/recommendations`, { params: { limit } });
  return res.data; // RecommendationResponse
}