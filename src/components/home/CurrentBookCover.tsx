
import { Book } from "@/types/book";
import Image from "@/components/ui/image";

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
        <Image 
          src={book.coverImage} 
          alt={book.title} 
          className="w-full h-full object-cover"
          priority={true} // Image critique pour la lecture en cours
          sizes="(max-width: 768px) 72px, 80px"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-chocolate-medium">
          <span className="text-white font-serif italic text-h4">{book.title.substring(0, 1)}</span>
        </div>
      )}
    </div>
  );
};
