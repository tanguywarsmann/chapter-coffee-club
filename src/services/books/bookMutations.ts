
import { supabase } from "@/integrations/supabase/client";
import { InsertableBook } from "./types";
import { slugify } from "./utils";

export const insertBooks = async (booksToInsert: InsertableBook[]) => {
  for (const book of booksToInsert) {
    const slug = slugify(book.title + "-" + book.author);
    
    // Check if book already exists
    const { data: existingBook } = await supabase
      .from('books')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();
    
    if (!existingBook) {
      const bookRecord = {
        title: book.title,
        author: book.author,
        cover_url: book.coverImage || null,
        description: book.description,
        total_pages: book.pages,
        slug: slug,
        tags: book.categories
      };
      
      const { error } = await supabase
        .from('books')
        .insert(bookRecord);
      
      if (error) {
        console.warn("Erreur lors de l'insertion du livre :", book.title, error);
      }
    }
  }
};
