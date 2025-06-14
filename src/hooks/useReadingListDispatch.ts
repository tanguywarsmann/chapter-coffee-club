
import { Book } from "@/types/book";

export function updateBooksDispatch(
  setToReadBooks: (b: Book[]) => void,
  setInProgressBooks: (b: Book[]) => void,
  setCompletedBooks: (b: Book[]) => void,
  toRead: Book[],
  inProgress: Book[],
  completed: Book[]
) {
  setToReadBooks([...toRead]);
  setInProgressBooks([...inProgress]);
  setCompletedBooks([...completed]);
}
