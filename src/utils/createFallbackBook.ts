
import { Book } from "@/types/book";

export const createFallbackBook = (item: { book_id: string; current_page?: number; total_pages?: number; status?: string }, errorMessage: string): Book => ({
  id: item.book_id,
  title: "Livre indisponible",
  author: "Auteur inconnu",
  description: `Les détails de ce livre ne sont pas disponibles. (${errorMessage})`,
  chaptersRead: Math.floor((item.current_page || 0) / 30),
  totalChapters: Math.ceil((item.total_pages || 30) / 30) || 1,
  isCompleted: item.status === "completed",
  language: "fr",
  categories: [],
  pages: item.total_pages || 0,
  publicationYear: 0,
  isUnavailable: true
});
