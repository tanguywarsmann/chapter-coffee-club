
import { BookRecord } from "./types";
import { Book } from "@/types/book";

/**
 * Convertit un enregistrement de livre de la base de données en un objet Book
 * @param record Enregistrement de livre de la base de données
 * @returns Objet Book formaté pour l'application
 */
export const mapBookFromRecord = (record: BookRecord): Book => {
  return {
    id: record.id,
    title: record.title,
    author: record.author,
    coverImage: record.cover_url || undefined,
    description: record.description || "",
    totalChapters: record.total_chapters || 1,
    chaptersRead: 0, // Valeur par défaut
    isCompleted: false, // Valeur par défaut
    language: "fr", // Langue par défaut
    categories: record.tags || [],
    pages: record.total_pages || 0,
    publicationYear: new Date().getFullYear(), // Année par défaut
    isPublished: record.is_published !== false // True par défaut si undefined
  };
};
