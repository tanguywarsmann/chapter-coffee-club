
import { supabase } from "@/integrations/supabase/client";
import { Book } from "@/types/book";
import { mapBookFromRecord } from "./bookMapper";

export const getAllBooks = async (): Promise<Book[]> => {
  const { data, error } = await supabase
    .from('books')
    .select('*');

  if (error) {
    console.error('Error fetching books:', error);
    return [];
  }

  return data.map(mapBookFromRecord);
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

  return mapBookFromRecord(data);
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

  return data.map(mapBookFromRecord);
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
