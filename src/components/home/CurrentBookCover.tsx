
import { Book } from "@/types/book";

interface CurrentBookCoverProps {
  book: Book;
}

export const CurrentBookCover = ({ book }: CurrentBookCoverProps) => {
  if (!book) {
    return null;
  }

  return (
    <div className="book-cover w-20 h-30 flex-shrink-0">
      {book.coverImage ? (
        <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-chocolate-medium">
          <span className="text-white font-serif italic text-xl">{book.title.substring(0, 1)}</span>
        </div>
      )}
    </div>
  );
};
