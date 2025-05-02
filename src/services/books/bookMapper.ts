
import { BookRecord } from "./types";
import { Book } from "@/types/book";

export const mapBookFromRecord = (record: BookRecord): Book => {
  return {
    id: record.id,
    title: record.title,
    author: record.author,
    coverImage: record.cover_url || undefined,
    description: record.description || "",
    totalChapters: 1, // Default value if not provided
    chaptersRead: 0, // Default value if not provided
    isCompleted: false, // Default value if not provided
    language: "fr", // Default language
    categories: record.tags || [],
    pages: record.total_pages || 0,
    publicationYear: new Date().getFullYear(), // Default to current year
    isPublished: record.is_published !== false // Default to true if undefined
  };
};
