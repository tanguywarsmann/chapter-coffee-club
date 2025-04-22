
import React from "react";
import { Progress } from "@/components/ui/progress";
import { Book } from "@/types/book";

interface BookCoverProps {
  book: Book;
  showProgress?: boolean;
}

export const BookCover: React.FC<BookCoverProps> = ({ book, showProgress }) => {
  const progressPercentage = (book.chaptersRead / book.totalChapters) * 100;
  const pagesRead = Math.floor((book.pages / book.totalChapters) * book.chaptersRead);

  return (
    <div className="book-cover bg-coffee-medium relative aspect-[2/3]">
      {book.coverImage ? (
        <img
          src={book.coverImage}
          alt={book.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-chocolate-medium">
          <span className="text-white font-serif italic text-xl">{book.title.substring(0, 1)}</span>
        </div>
      )}

      {showProgress && book.chaptersRead > 0 && (
        <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-2">
          <Progress value={progressPercentage} className="h-2" />
          <p className="text-white text-xs mt-1 text-center">
            {pagesRead} / {book.pages} pages
          </p>
        </div>
      )}
    </div>
  );
};
