type KeyPart = string | number;

const buildKey = (...parts: Array<KeyPart | null | undefined>) =>
  parts.filter((part): part is KeyPart => part !== undefined && part !== null);

export const queryKeys = {
  readingProgress: (userId?: string | null) => buildKey("reading-progress", userId),
  bookProgress: (bookId?: string | null) => buildKey("book-progress", bookId),
  jokersInfo: (bookId?: string | null, userId?: string | null) =>
    buildKey("jokers-info", bookId, userId),
};

export type QueryKeyFactory = typeof queryKeys;
