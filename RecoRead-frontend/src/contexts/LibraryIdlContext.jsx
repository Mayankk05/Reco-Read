import { createContext, useContext } from 'react';

export const LibraryIdsContext = createContext(new Set());

export function useLibraryIds() {
  return useContext(LibraryIdsContext);
}
