
import { supabase } from "@/integrations/supabase/client";
import { Book } from "@/types/book";

export const getBookById = async (id: string): Promise<Book | null> => {
  const { data, error } = await supabase
    .from('books')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error('Error fetching book:', error);
    return null;
  }

  if (!data) return null;

  return {
    ...data,
    id: data.id,
    title: data.title,
    author: data.author,
    coverImage: data.cover_url,
    description: data.description || "",
    totalChapters: Math.ceil(data.total_pages / 30),
    chaptersRead: 0,
    isCompleted: false,
    language: "français",
    categories: [],
    pages: data.total_pages,
    publicationYear: new Date(data.created_at).getFullYear()
  };
};

export const getAllBooks = async (): Promise<Book[]> => {
  const { data, error } = await supabase
    .from('books')
    .select('*')
    .order('created_at', { ascending: false });

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
    categories: [],
    pages: book.total_pages,
    publicationYear: new Date(book.created_at).getFullYear()
  }));
};

export const getPopularBooks = async (): Promise<Book[]> => {
  // Pour l'instant, on retourne simplement les 4 premiers livres
  const { data, error } = await supabase
    .from('books')
    .select('*')
    .limit(4);

  if (error) {
    console.error('Error fetching popular books:', error);
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
    categories: [],
    pages: book.total_pages,
    publicationYear: new Date(book.created_at).getFullYear()
  }));
};

export const getRecentlyAddedBooks = async (): Promise<Book[]> => {
  const { data, error } = await supabase
    .from('books')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(4);

  if (error) {
    console.error('Error fetching recently added books:', error);
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
    categories: [],
    pages: book.total_pages,
    publicationYear: new Date(book.created_at).getFullYear()
  }));
};
