
import { supabase } from "@/integrations/supabase/client";
import { Book } from "@/types/book";

export const getAllBooks = async (): Promise<Book[]> => {
  const { data, error } = await supabase
    .from('books')
    .select('*');

  if (error) {
    console.error('Error fetching books:', error);
    return [];
  }

  return data.map(book => ({
    id: book.id,
    title: book.title,
    author: book.author,
    coverImage: book.cover_url,
    description: book.description || "",
    totalChapters: Math.ceil(book.total_pages / 30),
    chaptersRead: 0,
    isCompleted: false,
    language: "français",
    categories: book.tags || [],
    pages: book.total_pages,
    publicationYear: new Date(book.created_at || Date.now()).getFullYear()
  }));
};

export const getBookById = async (id: string): Promise<Book | null> => {
  const { data, error } = await supabase
    .from('books')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching book by ID:', error);
    return null;
  }

  if (!data) return null;

  return {
    id: data.id,
    title: data.title,
    author: data.author,
    coverImage: data.cover_url,
    description: data.description || "",
    totalChapters: Math.ceil(data.total_pages / 30),
    chaptersRead: 0,
    isCompleted: false,
    language: "français",
    categories: data.tags || [],
    pages: data.total_pages,
    publicationYear: new Date(data.created_at || Date.now()).getFullYear()
  };
};

export const getBooksByCategory = async (category: string): Promise<Book[]> => {
  const { data, error } = await supabase
    .from('books')
    .select('*')
    .contains('tags', `{${category}}`);

  if (error) {
    console.error('Error fetching books by category:', error);
    return [];
  }

  return data.map(book => ({
    id: book.id,
    title: book.title,
    author: book.author,
    coverImage: book.cover_url,
    description: book.description || "",
    totalChapters: Math.ceil(book.total_pages / 30),
    chaptersRead: 0,
    isCompleted: false,
    language: "français",
    categories: book.tags || [],
    pages: book.total_pages,
    publicationYear: new Date(book.created_at || Date.now()).getFullYear()
  }));
};

export const getAvailableCategories = async (): Promise<string[]> => {
  const { data, error } = await supabase
    .from('books')
    .select('tags');

  if (error) {
    console.error('Error fetching book categories:', error);
    return [];
  }

  const allTags = data.flatMap(book => book.tags || []);
  return [...new Set(allTags)];
};

/**
 * Insère en base une liste de livres, en évitant les doublons via le champ slug (id UUID généré automatiquement)
 * @param booksToInsert Tableau de livres au format Book, sans id
 * @returns Promise<void>
 */
export const insertBooks = async (booksToInsert: Omit<Book, "id">[]) => {
  for (const book of booksToInsert) {
    // Create an object with the correct shape for Supabase insert
    const bookRecord = {
      title: book.title,
      author: book.author,
      cover_url: book.coverImage || null,
      description: book.description,
      total_pages: book.pages,
      slug: slugify(book.title + "-" + book.author),
      tags: book.categories
    };
    
    // First check if the book already exists by slug
    const { data: existingBook } = await supabase
      .from('books')
      .select('id')
      .eq('slug', bookRecord.slug)
      .maybeSingle();
    
    // If the book doesn't exist, insert it
    if (!existingBook) {
      const { error } = await supabase
        .from('books')
        .insert(bookRecord);
      
      if (error) {
        console.warn("Erreur lors de l'insertion du livre :", book.title, error);
      }
    }
  }
};

/**
 * Créée un slug unique pour le livre
 */
function slugify(str: string) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}
