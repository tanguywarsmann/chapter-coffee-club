
const unavailableBooks = new Set<string>();

export const unavailableBooksCache = {
  has: (bookId: string): boolean => unavailableBooks.has(bookId),
  add: (bookId: string): void => unavailableBooks.add(bookId),
  getAll: (): string[] => Array.from(unavailableBooks),
  clear: (): void => unavailableBooks.clear()
};
