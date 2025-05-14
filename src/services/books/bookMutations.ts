
import { supabase } from "@/integrations/supabase/client";
import { InsertableBook } from "./types";
import { slugify } from "./utils";
import { Database } from "@/integrations/supabase/types";

type BookRecord = Database['public']['Tables']['books']['Insert'];

/**
 * Insère un ou plusieurs livres dans la base de données
 * @param booksToInsert Livres à insérer
 */
export const insertBooks = async (booksToInsert: InsertableBook[]): Promise<void> => {
  for (const book of booksToInsert) {
    const slug = slugify(book.title + "-" + book.author);
    
    // Vérifier si le livre existe déjà
    const { data: existingBook, error: checkError } = await supabase
      .from('books')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();
    
    if (checkError) {
      console.warn("Erreur lors de la vérification du livre existant:", checkError);
      continue;
    }
    
    if (!existingBook) {
      // Générer un UUID pour le livre
      const id = crypto.randomUUID();
      
      const bookRecord: BookRecord = {
        id: id,
        title: book.title,
        author: book.author,
        cover_url: book.coverImage || null,
        description: book.description || null,
        total_pages: book.pages || 0,
        slug: slug,
        tags: book.categories || []
      };
      
      const { error: insertError } = await supabase
        .from('books')
        .insert(bookRecord);
      
      if (insertError) {
        console.warn("Erreur lors de l'insertion du livre :", book.title, insertError);
      }
    }
  }
};
