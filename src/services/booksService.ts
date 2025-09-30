import { supabase } from "@/integrations/supabase/client";
import { Book } from "@/types/book";

/**
 * Optimized book service using public views for performance and security
 */
export class BooksService {
  /**
   * Get paginated books with performance optimizations
   */
  static async getBooksPage({ offset = 0, limit = 16 } = {}) {
    try {
      const { data, error, count } = await supabase
        .from('books_public')
        .select('id, slug, title, author, cover_url, expected_segments, description', { count: 'exact' })
        .range(offset, offset + limit - 1)
        .order('title');

      if (error) {
        console.error('Error fetching books page:', error);
        return { books: [], count: 0, error };
      }

      return { books: data || [], count: count || 0, error: null };
    } catch (error) {
      console.error('Error in getBooksPage:', error);
      return { books: [], count: 0, error };
    }
  }

  /**
   * Get book by slug (public view)
   */
  static async getBookBySlug(slug: string): Promise<Book | null> {
    try {
      const { data, error } = await supabase
        .from('books_public')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();

      if (error) {
        console.error('Error fetching book by slug:', error);
        return null;
      }

      if (!data) {
        return null;
      }

      // Transform the public book data to match Book interface
      return {
        id: data.id || "",
        title: data.title || "",
        author: data.author || "",
        coverImage: data.cover_url || undefined,
        description: data.description || "",
        totalChapters: 1,
        chaptersRead: 0,
        isCompleted: false,
        language: "fr",
        categories: data.tags || [],
        tags: data.tags || [],
        pages: 0,
        total_pages: 0,
        publicationYear: new Date().getFullYear(),
        isPublished: true,
        slug: data.slug || "",
        expectedSegments: data.expected_segments || 1,
        totalSegments: data.expected_segments || 1
      } as Book;
    } catch (error) {
      console.error('Error in getBookBySlug:', error);
      return null;
    }
  }

  /**
   * Search books by title/author (public view)
   */
  static async searchBooks(query: string): Promise<Book[]> {
    try {
      const { data, error } = await supabase
        .from('books_public')
        .select('*')
        .or(`title.ilike.%${query}%,author.ilike.%${query}%`)
        .limit(20);

      if (error) {
        console.error('Error searching books:', error);
        return [];
      }

      return (data || []).map(book => ({
        id: book.id || "",
        title: book.title || "",
        author: book.author || "",
        coverImage: book.cover_url || undefined,
        description: book.description || "",
        totalChapters: 1,
        chaptersRead: 0,
        isCompleted: false,
        language: "fr",
        categories: book.tags || [],
        tags: book.tags || [],
        pages: 0,
        total_pages: 0,
        publicationYear: new Date().getFullYear(),
        isPublished: true,
        slug: book.slug || "",
        expectedSegments: book.expected_segments || 1,
        totalSegments: book.expected_segments || 1
      } as Book));
    } catch (error) {
      console.error('Error in searchBooks:', error);
      return [];
    }
  }

  /**
   * Get books by category/tag (public view)
   */
  static async getBooksByCategory(category: string): Promise<Book[]> {
    try {
      const { data, error } = await supabase
        .from('books_public')
        .select('*')
        .contains('tags', `{${category}}`)
        .order('title');

      if (error) {
        console.error('Error fetching books by category:', error);
        return [];
      }

      return (data || []).map(book => ({
        id: book.id || "",
        title: book.title || "",
        author: book.author || "",
        coverImage: book.cover_url || undefined,
        description: book.description || "",
        totalChapters: 1,
        chaptersRead: 0,
        isCompleted: false,
        language: "fr",
        categories: book.tags || [],
        tags: book.tags || [],
        pages: 0,
        total_pages: 0,
        publicationYear: new Date().getFullYear(),
        isPublished: true,
        slug: book.slug || "",
        expectedSegments: book.expected_segments || 1,
        totalSegments: book.expected_segments || 1
      } as Book));
    } catch (error) {
      console.error('Error in getBooksByCategory:', error);
      return [];
    }
  }

  /**
   * Get available categories from published books
   */
  static async getAvailableCategories(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('books_public')
        .select('tags');

      if (error) {
        console.error('Error fetching categories:', error);
        return [];
      }

      // Extract unique tags
      const allTags = data?.flatMap(book => book.tags || []) || [];
      const uniqueTags = [...new Set(allTags)].sort();

      return uniqueTags;
    } catch (error) {
      console.error('Error in getAvailableCategories:', error);
      return [];
    }
  }
}