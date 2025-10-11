import { createContext, useContext } from 'react';

// Holds a Set of googleBooksId currently known in the user's library (from current page)
export const LibraryIdsContext = createContext(new Set());

export function useLibraryIds() {
  return useContext(LibraryIdsContext);
}