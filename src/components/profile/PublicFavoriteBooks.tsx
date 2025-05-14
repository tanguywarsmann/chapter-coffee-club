
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getUserFavoriteBooks } from "@/services/user/favoriteBookService";
import { Skeleton } from "@/components/ui/skeleton";

interface FavoriteBook {
  id: string;
  book_title: string;
  position: number;
}

interface PublicFavoriteBooksProps {
  userId: string;
}

export function PublicFavoriteBooks({ userId }: PublicFavoriteBooksProps) {
  const [books, setBooks] = useState<FavoriteBook[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooks = async () => {
      setLoading(true);
      try {
        const favoriteBooks = await getUserFavoriteBooks(userId);
        setBooks(favoriteBooks);
      } catch (error) {
        console.error("Erreur lors du chargement des livres préférés:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, [userId]);

  if (loading) {
    return (
      <Card className="border-coffee-light">
        <CardHeader>
          <CardTitle className="text-xl font-serif text-coffee-darker">Livres préférés</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="flex-none text-2xl opacity-50">{i}.</div>
                <Skeleton className="h-16 w-full rounded-md" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (books.length === 0) {
    return (
      <Card className="border-coffee-light">
        <CardHeader>
          <CardTitle className="text-xl font-serif text-coffee-darker">Livres préférés</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center p-6 text-center space-y-2">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <span className="text-2xl text-muted-foreground">❤️</span>
            </div>
            <p className="text-muted-foreground">Aucun livre favori</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-coffee-light">
      <CardHeader>
        <CardTitle className="text-xl font-serif text-coffee-darker">Livres préférés</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {books.sort((a, b) => a.position - b.position).map((book) => (
            <div key={book.id} className="rounded-lg border border-coffee-light bg-coffee-lightest/30 p-4">
              <div className="flex items-start">
                <div className="flex-none text-3xl font-serif text-coffee-medium mr-4 opacity-70">
                  {book.position}.
                </div>
                <div className="flex-grow">
                  <p className="text-lg font-medium text-coffee-darker">{book.book_title}</p>
                  <div className="mt-2 text-sm italic text-coffee-medium">
                    "Un livre qui compte beaucoup pour moi"
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
