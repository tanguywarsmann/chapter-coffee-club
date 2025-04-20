
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
