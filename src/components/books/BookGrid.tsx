
import { BookCard } from "./BookCard";
import { Book } from "@/types/book";

interface BookGridProps {
  books: Book[];
  title?: string;
}

export function BookGrid({ books, title }: BookGridProps) {
  if (!books.length) {
    return (
      <div className="text-center p-8 border border-dashed border-coffee-light rounded-lg bg-muted/50">
        <h3 className="text-lg font-medium text-coffee-darker mb-2">Aucun livre trouvé</h3>
        <p className="text-muted-foreground">Essayez une autre recherche ou explorez notre catalogue</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {title && <h2 className="text-xl font-serif font-medium text-coffee-darker">{title}</h2>}
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
        {books.map((book) => (
          <BookCard key={book.id} book={book} />
        ))}
      </div>
    </div>
  );
}
