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

      return data;
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

      return data || [];
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

      return data || [];
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