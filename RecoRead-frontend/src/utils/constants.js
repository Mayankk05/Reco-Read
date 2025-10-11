export const API_BASE_URL = 'http://localhost:8080/api';

export const ROUTES = {
  LANDING: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  LIBRARY: '/library',
  BOOK_DETAIL: '/books/:id',
  PROFILE: '/profile',
};

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
};

export const MESSAGES = {
  LOGIN_SUCCESS: 'Login successful!',
  REGISTER_SUCCESS: 'Registration successful!',
  LOGOUT_SUCCESS: 'Logged out successfully',
  BOOK_ADDED: 'Book added to library!',
  BOOK_DELETED: 'Book deleted successfully',
  SUMMARY_GENERATED: 'Summary generated successfully!',
  ERROR_GENERIC: 'Something went wrong. Please try again.',
  ERROR_NETWORK: 'Network error. Please check your connection.',
  ERROR_RATE_LIMIT: 'Rate limit exceeded. Please wait 10s and try again.',
};