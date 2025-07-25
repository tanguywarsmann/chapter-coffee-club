import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface JokerUsageResult {
  jokersRemaining: number;
  success: boolean;
  message: string;
}

/**
 * Utilise un joker de manière atomique via RPC
 * @param bookId - ID du livre
 * @param userId - ID de l'utilisateur
 * @param segment - Numéro du segment
 * @returns Résultat de l'utilisation du joker
 */
export async function useJokerAtomically(
  bookId: string,
  userId: string,
  segment: number
): Promise<JokerUsageResult> {
  try {
    const { data, error } = await supabase.rpc('use_joker', {
      p_book_id: bookId,
      p_user_id: userId,
      p_segment: segment
    });

    if (error) {
      console.error('Erreur RPC use_joker:', error);
      throw new Error(`Erreur serveur: ${error.message}`);
    }

    if (!data || data.length === 0) {
      throw new Error('Aucun résultat retourné par le serveur');
    }

    const result = data[0];
    
    if (!result.success) {
      toast.error(result.message);
      return {
        jokersRemaining: result.jokers_remaining,
        success: false,
        message: result.message
      };
    }

    return {
      jokersRemaining: result.jokers_remaining,
      success: true,
      message: result.message
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    console.error('Erreur lors de l\'utilisation du joker:', errorMessage);
    toast.error(`Impossible d'utiliser le joker: ${errorMessage}`);
    
    return {
      jokersRemaining: 0,
      success: false,
      message: errorMessage
    };
  }
}

/**
 * Récupère le nombre de jokers restants pour un livre
 * @param bookId - ID du livre
 * @param userId - ID de l'utilisateur
 * @returns Nombre de jokers restants
 */
export async function getRemainingJokers(
  bookId: string,
  userId: string
): Promise<number> {
  try {
    // Récupérer les informations du livre
    const { data: bookData, error: bookError } = await supabase
      .from('books')
      .select('expected_segments')
      .eq('id', bookId)
      .single();

    if (bookError || !bookData) {
      console.error('Erreur lors de la récupération du livre:', bookError);
      return 0;
    }

    // Récupérer l'ID de progression
    const { data: progressData, error: progressError } = await supabase
      .from('reading_progress')
      .select('id')
      .eq('user_id', userId)
      .eq('book_id', bookId)
      .single();

    if (progressError || !progressData) {
      console.error('Erreur lors de la récupération de la progression:', progressError);
      return 0;
    }

    // Calculer les jokers autorisés
    const jokersAllowed = Math.floor(bookData.expected_segments / 10) + 1;

    // Compter les jokers utilisés
    const { data: validationsData, error: validationsError } = await supabase
      .from('reading_validations')
      .select('id')
      .eq('progress_id', progressData.id)
      .eq('used_joker', true);

    if (validationsError) {
      console.error('Erreur lors du comptage des jokers:', validationsError);
      return 0;
    }

    const jokersUsed = validationsData?.length || 0;
    return Math.max(0, jokersAllowed - jokersUsed);
  } catch (error) {
    console.error('Erreur lors du calcul des jokers restants:', error);
    return 0;
  }
}