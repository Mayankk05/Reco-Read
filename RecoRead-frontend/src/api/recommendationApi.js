import axiosInstance from './axiosConfig';

export async function getRecommendations(bookId, limit) {
  const res = await axiosInstance.get(`/books/${bookId}/recommendations`, {
    params: { limit },
  });
  return res.data; 
