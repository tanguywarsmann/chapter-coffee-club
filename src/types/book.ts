
export interface Book {
  id: string;
  title: string;
  author: string;
  coverImage?: string;
  description: string;
  totalChapters: number;
  chaptersRead: number;
  isCompleted: boolean;
  isBookmarked?: boolean;
  language: string;
  categories: string[];
  pages: number;
  publicationYear: number;
  isUnavailable?: boolean; // Explicitly marked flag to identify fallback books
  isStableUnavailable?: boolean; // Flag to mark books that are consistently unavailable
  isPublished?: boolean; // Flag to mark if a book is published or in draft status
  
  // Admin-specific fields
  slug?: string;
  total_pages?: number;
  expectedSegments?: number;
  total_chapters?: number; // Add this field to match database structure
  missingSegments?: number[];
  cover_url?: string;
}
