
import { Book } from "@/types/book";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookGrid } from "@/components/books/BookGrid";

interface BookListSectionProps {
  title: string;
  description: string;
  books: Book[];
  showProgress?: boolean;
  showDate?: boolean;
  actionLabel?: string;
  onAction?: (bookId: string) => void;
}

export function BookListSection({
  title,
  description,
  books,
  showProgress,
  showDate,
  actionLabel,
  onAction
}: BookListSectionProps) {
  return (
    <Card className="border-coffee-light">
      <CardHeader>
        <CardTitle className="text-xl font-serif text-coffee-darker">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <BookGrid
          books={books}
          showProgress={showProgress}
          showDate={showDate}
          actionLabel={actionLabel}
          onAction={onAction}
        />
      </CardContent>
    </Card>
  );
}
