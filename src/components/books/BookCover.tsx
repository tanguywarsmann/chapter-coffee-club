
import React from "react";
import { Progress } from "@/components/ui/progress";
import { Book } from "@/types/book";
import Image from "@/components/ui/image";

interface BookCoverProps {
  book?: Book;
  showProgress?: boolean;
  size?: "sm" | "md" | "lg";
  image?: string;
  title?: string;
}

export const BookCover: React.FC<BookCoverProps> = ({ 
  book, 
  showProgress, 
  size = "md",
  image,
  title
}) => {
  // Use either the passed image or get it from the book
  const coverImage = image || book?.coverImage;
  const bookTitle = title || book?.title || "Unknown";
  
  // Calculate progress only if we have a book with chapters
  const progressPercentage = book ? (book.chaptersRead / book.totalChapters) * 100 : 0;
  const pagesRead = book ? Math.floor((book.pages / book.totalChapters) * book.chaptersRead) : 0;

  // Size classes based on the size prop
  const sizeClasses = {
    sm: "w-24 h-36",
    md: "w-32 h-48",
    lg: "w-40 h-60"
  };

  return (
    <div className={`book-cover bg-coffee-medium relative aspect-[2/3] ${sizeClasses[size]}`}>
      {coverImage ? (
        <Image
          src={coverImage}
          alt={bookTitle}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-chocolate-medium">
          <span className="text-white font-serif italic text-xl">{bookTitle.substring(0, 1)}</span>
        </div>
      )}

      {showProgress && book && book.chaptersRead > 0 && (
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
