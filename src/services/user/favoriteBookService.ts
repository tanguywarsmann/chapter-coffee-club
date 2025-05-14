
import { supabase } from "@/integrations/supabase/client";

export interface FavoriteBook {
  id: string;
  user_id: string;
  book_title: string;
  position: number;
  added_at: string;
}

/**
 * Récupère les livres préférés d'un utilisateur
 * @param userId ID de l'utilisateur
 * @returns Liste des livres préférés
 */
export async function getUserFavoriteBooks(userId: string): Promise<FavoriteBook[]> {
  try {
    const { data, error } = await supabase
      .from("user_favorite_books")
      .select("*")
      .eq("user_id", userId)
      .order("position", { ascending: true });
    
    if (error) {
      console.error("Erreur lors de la récupération des livres préférés:", error);
      return [];
    }
    
    return data || [];
  } catch (error) {
    console.error("Exception lors de la récupération des livres préférés:", error);
    return [];
  }
}

/**
 * Ajoute un livre préféré pour l'utilisateur
 * @param userId ID de l'utilisateur
 * @param bookTitle Titre du livre
 * @param position Position du livre (1-3)
 * @returns Succès de l'opération
 */
export async function addFavoriteBook(
  userId: string, 
  bookTitle: string, 
  position: number
): Promise<boolean> {
  try {
    // Vérifions d'abord si cette position est déjà occupée
    const { data: existing } = await supabase
      .from("user_favorite_books")
      .select("id")
      .eq("user_id", userId)
      .eq("position", position)
      .single();
    
    // Si un livre existe déjà à cette position, le supprimer
    if (existing) {
      const { error: deleteError } = await supabase
        .from("user_favorite_books")
        .delete()
        .eq("id", existing.id);
      
      if (deleteError) {
        console.error("Erreur lors de la suppression du livre existant:", deleteError);
        return false;
      }
    }
    
    // Ajouter le nouveau livre
    const { error } = await supabase
      .from("user_favorite_books")
      .insert({
        user_id: userId,
        book_title: bookTitle,
        position: position
      });
    
    if (error) {
      console.error("Erreur lors de l'ajout du livre préféré:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Exception lors de l'ajout du livre préféré:", error);
    return false;
  }
}

/**
 * Supprime un livre préféré
 * @param userId ID de l'utilisateur
 * @param bookId ID du livre à supprimer
 * @returns Succès de l'opération
 */
export async function removeFavoriteBook(userId: string, bookId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("user_favorite_books")
      .delete()
      .eq("id", bookId)
      .eq("user_id", userId);
    
    if (error) {
      console.error("Erreur lors de la suppression du livre préféré:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Exception lors de la suppression du livre préféré:", error);
    return false;
  }
}
