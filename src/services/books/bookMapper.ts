import { BookRecord, BookPublicRecord } from "./types";
import { Book } from "@/types/book";

/**
 * Convertit un enregistrement de livre de la base de données en un objet Book
 * @param record Enregistrement de livre de la base de données
 * @returns Objet Book formaté pour l'application
 */
export const mapBookFromRecord = (record: BookRecord | BookPublicRecord): Book => {
  return {
    id: record.id || "",
    title: record.title || "",
    author: record.author || "",
    coverImage: record.cover_url || undefined,
    description: record.description || "",
    totalChapters: ('total_chapters' in record ? record.total_chapters : null) || 1,
    chaptersRead: 0, // Valeur par défaut
    isCompleted: false, // Valeur par défaut
    language: "fr", // Langue par défaut
    categories: record.tags || [], // Ensure categories is always an array
    tags: record.tags || [], // Add tags property from database
    pages: ('total_pages' in record ? record.total_pages : null) || 0,
    total_pages: ('total_pages' in record ? record.total_pages : null) || 0, // Add both formats
    publicationYear: new Date().getFullYear(), // Année par défaut
    isPublished: ('is_published' in record ? record.is_published !== false : true), // True par défaut si undefined
    slug: record.slug || "",
    expectedSegments: record.expected_segments || 1,
    totalSegments: record.expected_segments || 1
  };
};