
import { z } from 'zod';
import { Book } from '@/types/book';
import { InvalidBookError } from './readingListErrors';

/**
 * Schéma Zod pour valider les livres avant ajout à la Reading List
 */
const BookValidationSchema = z.object({
  id: z.string().min(1, "L'ID du livre ne peut pas être vide"),
  title: z.string().min(1, "Le titre ne peut pas être vide"),
  author: z.string().optional(),
  slug: z.string().optional(),
}).refine(
  (book) => {
    // Accepter UUID ou slug non vide comme identifiant valide
    const hasValidId = book.id && book.id.trim().length > 0;
    const hasValidSlug = book.slug && book.slug.trim().length > 0;
    return hasValidId || hasValidSlug;
  },
  {
    message: "Le livre doit avoir un ID ou un slug valide",
    path: ["id"]
  }
);

/**
 * Fonction d'assertion pour valider un livre avant ajout
 * Lève une InvalidBookError si le livre n'est pas valide
 */
export function assertValidBook(book: unknown): asserts book is Book {
  if (!book) {
    throw new InvalidBookError("Le livre ne peut pas être null ou undefined");
  }

  try {
    BookValidationSchema.parse(book);
  } catch (zodError) {
    if (zodError instanceof z.ZodError) {
      const firstError = zodError.errors[0];
      throw new InvalidBookError(firstError?.message || "Livre invalide");
    }
    throw new InvalidBookError("Validation du livre échouée");
  }
}

/**
 * Fonction utilitaire pour vérifier si un livre est valide sans lever d'erreur
 */
export const isValidBook = (book: Book | null | undefined): book is Book => {
  try {
    assertValidBook(book);
    return true;
  } catch {
    return false;
  }
};
