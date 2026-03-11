
import { Book } from "@/types/book";

interface BookSchemaProps {
  book: Book;
}

export function BookSchema({ book }: BookSchemaProps) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Book",
    "name": book.title,
    "author": {
      "@type": "Person",
      "name": book.author
    },
    "description": book.description || "",
    "url": `https://www.vread.fr/book/${book.slug}`,
    "image": book.cover_url || "",
    "numberOfPages": book.total_pages || 0,
    "bookFormat": "EBook",
    "inLanguage": "fr",
    "publisher": {
      "@type": "Organization",
      "name": "VREAD"
    },
    "genre": book.tags?.join(", ") || ""
  };

  return (
    <script 
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
