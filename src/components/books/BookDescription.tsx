
import { Book } from "@/types/book";

interface BookDescriptionProps {
  description: string;
}

export const BookDescription = ({ description }: BookDescriptionProps) => (
  <p className="text-body text-coffee-darker">{description}</p>
);
