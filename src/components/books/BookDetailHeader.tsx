
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Book } from "@/types/book";

interface BookDetailHeaderProps {
  title: string;
}

export const BookDetailHeader = ({ title }: BookDetailHeaderProps) => (
  <CardHeader>
    <CardTitle className="text-2xl font-serif text-coffee-darker">{title}</CardTitle>
  </CardHeader>
);
