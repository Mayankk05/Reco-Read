import axiosInstance from './axiosConfig';

/**
 * Create a reading event for a book.
 * payload: { eventType: 'OPENED'|'PROGRESS'|'FINISHED', page?, progressPercent?, durationSeconds?, note? }
 * Returns: ReadingEventResponse
 */
export async function postReadingEvent(bookId, payload) {
  const res = await axiosInstance.post(`/books/${bookId}/reading-events`, payload);
  return res.data;
}

/**
 * Get all reading events for a book (newest first).
 * Returns: ReadingEventResponse[]
 */
export async function getBookReadingEvents(bookId) {
  const res = await axiosInstance.get(`/books/${bookId}/reading-events`);
  return res.data;
}

/**
 * Get the latest reading state for a book.
 * Tolerant of 204/empty responses. Returns null if no state is found.
 * Returns: { bookId, page?, progressPercent?, note?, updatedAt? } | null
 */
export async function getLatestReadingState(bookId) {
  const res = await axiosInstance.get(`/books/${bookId}/reading-state`, {
    validateStatus: (s) => (s >= 200 && s < 300) || s === 204,
  });
  if (res.status === 204 || !res.data || Object.keys(res.data || {}).length === 0) {
    return null;
  }
  return res.data;
}

/**
 * Get recent reading events across all books for the user.
 * Returns: ReadingEventResponse[]
 */
export async function getReadingHistory(limit = 50) {
  const res = await axiosInstance.get('/reading/history', { params: { limit } });
  return res.data;
}