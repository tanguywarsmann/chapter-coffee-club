
export interface Book {
  id: string;
  title: string;
  author: string;
  coverImage?: string;
  description?: string;
  totalChapters?: number;
  chaptersRead?: number;
  isCompleted?: boolean;
  isBookmarked?: boolean;
  language?: string;
  categories?: string[];
  tags?: string[]; // Propriété tags ajoutée pour correspondre à la base de données
  pages?: number;
  publicationYear?: number;
  isUnavailable?: boolean; // Explicitly marked flag to identify fallback books
  isStableUnavailable?: boolean; // Flag to mark books that are consistently unavailable
  isPublished?: boolean; // Flag to mark if a book is published or in draft status
  
  // Admin-specific fields
  slug?: string;
  total_pages?: number;
  expected_segments?: number; // Snake case from database
  total_chapters?: number; // Snake case from database
  missingSegments?: number[];
  cover_url?: string;
  
  // Add these properties to fix type errors
  totalSegments?: number;
  progressPercent?: number;
  nextSegmentPage?: number;
  currentSegment?: number;
  
  // Add camelCase alias for expected_segments to fix type errors
  expectedSegments?: number;
  completed_at?: string;
}
