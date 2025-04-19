
import { Book } from "@/types/book";
import { BookCard } from "./BookCard";
import { Card, CardContent } from "@/components/ui/card";
import { ListPlus } from "lucide-react";

interface PopularBooksProps {
  books: Book[];
  readersCount: { [key: string]: number };
}

export function PopularBooks({ books, readersCount }: PopularBooksProps) {
  if (!books.length) return null;

  return (
    <Card className="border-coffee-light bg-white">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <ListPlus className="h-5 w-5 text-coffee-dark" />
          <h2 className="text-xl font-serif font-medium text-coffee-darker">Les plus lus en ce moment</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {books.map((book) => (
            <div key={book.id} className="space-y-2">
              <BookCard 
                book={book} 
                showAddButton={true}
              />
              <p className="text-sm text-center text-muted-foreground">
                {readersCount[book.id] || 0} lecteur{readersCount[book.id] !== 1 ? "s" : ""} en ce moment
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
