
// Cache pour stocker les IDs des livres qui ont échoué lors du chargement
const failedBookIds = new Set<string>();

export const bookFailureCache = {
  has: (bookId: string): boolean => failedBookIds.has(bookId),
  add: (bookId: string): void => { 
    failedBookIds.add(bookId);
  },
  getAll: (): string[] => Array.from(failedBookIds),
  clear: (): void => failedBookIds.clear()
};
