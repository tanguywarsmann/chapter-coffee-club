import { supabase } from "@/integrations/supabase/client";
import { Book } from "@/types/book";
import { mapBookFromRecord } from "./bookMapper";

export const getAllBooks = async (): Promise<Book[]> => {
  try {
    const { data, error } = await supabase
      .from('books')
      .select('*');

    if (error) {
      console.error('Error fetching books:', error);
      return [];
    }

    return data ? data.map(mapBookFromRecord) : [];
  } catch (error) {
    console.error('Exception fetching books:', error);
    return [];
  }
};

export const getBookById = async (id: string): Promise<Book | null> => {
  if (!id) {
    console.error('Invalid book ID provided (empty)');
    return null;
  }
  
  try {
    console.log(`[DEBUG] getBookById: Construction requête pour id=${id}`);
    console.log(`[DEBUG] getBookById: Requête Supabase: from('books').select('*').eq('id', '${id}').maybeSingle()`);
    
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error(`[ERREUR] Error fetching book ID ${id}:`, error);
      return null;
    }

    if (!data) {
      console.log(`[DEBUG] getBookById: Aucune donnée trouvée pour id=${id}`);
      return null;
    }

    console.log(`[DEBUG] getBookById: Livre trouvé pour id=${id}:`, JSON.stringify(data));
    return mapBookFromRecord(data);
  } catch (error) {
    console.error(`[ERREUR] Exception fetching book ID ${id}:`, error);
    return null;
  }
};

export const getBooksByCategory = async (category: string): Promise<Book[]> => {
  if (!category) {
    console.error('Invalid category provided (empty)');
    return [];
  }
  
  try {
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .contains('tags', `{${category}}`);

    if (error) {
      console.error('Error fetching books by category:', error);
      return [];
    }

    return data ? data.map(mapBookFromRecord) : [];
  } catch (error) {
    console.error(`Exception fetching books for category ${category}:`, error);
    return [];
  }
};

export const getAvailableCategories = async (): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from('books')
      .select('tags');

    if (error) {
      console.error('Error fetching book categories:', error);
      return [];
    }

    const allTags = data ? data.flatMap(book => book.tags || []) : [];
    return [...new Set(allTags)];
  } catch (error) {
    console.error('Exception fetching categories:', error);
    return [];
  }
};
