
import { Book } from "@/types/book";
import Image from "@/components/ui/image";

interface BookCoverInfoProps {
  book: Book;
}

export const BookCoverInfo = ({ book }: BookCoverInfoProps) => (
  <div className="flex items-start gap-4">
    <div className="book-cover w-32 h-48 flex-shrink-0">
      {book.coverImage ? (
        <Image 
          src={book.coverImage} 
          alt={book.title} 
          className="w-full h-full object-cover"
          sizes="(max-width: 768px) 120px, 128px"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-chocolate-medium">
          <span className="text-white font-serif italic text-4xl">{book.title.substring(0, 1)}</span>
        </div>
      )}
    </div>
    <div className="flex-1">
      <h2 className="text-xl font-medium text-coffee-darker">{book.title}</h2>
      <p className="text-sm text-muted-foreground">{book.author}</p>
      <div className="mt-2 flex flex-wrap gap-1">
        {(book.categories || book.tags || []).map((category, index) => (
          <span
            key={index}
            className="px-2 py-1 bg-coffee-light/30 text-coffee-darker rounded-full text-xs"
          >
            {category}
          </span>
        ))}
      </div>
    </div>
  </div>
);
