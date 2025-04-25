
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
  isUnavailable?: boolean; // Added flag to identify fallback books
}
