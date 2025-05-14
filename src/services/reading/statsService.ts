
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

/**
 * Calcule le nombre total de pages lues validées par l'utilisateur (1 segment = 30 pages).
 * @param userId ID de l'utilisateur
 * @returns Nombre total de pages lues
 */
export async function getTotalPagesRead(userId: string): Promise<number> {
  try {
    const { data, error } = await supabase
      .from('reading_validations')
      .select('segment', { count: 'exact' })
      .eq('user_id', userId);

    if (error) {
      console.error('Erreur lors du calcul du total de pages lues:', error);
      return 0;
    }

    // Un segment = 30 pages
    return (data?.length || 0) * 30;
  } catch (error) {
    console.error('Exception lors du calcul du total de pages lues:', error);
    return 0;
  }
}

/**
 * Calcule le nombre de livres terminés (tous les segments sont validés)
 * @param userId ID de l'utilisateur
 * @returns Nombre de livres terminés
 */
export async function getBooksReadCount(userId: string): Promise<number> {
  try {
    const { data, error } = await supabase
      .from('reading_progress')
      .select('id')
      .eq('user_id', userId)
      .eq('status', 'completed');

    if (error) {
      console.error('Erreur lors du calcul des livres terminés:', error);
      return 0;
    }

    return data?.length || 0;
  } catch (error) {
    console.error('Exception lors du calcul des livres terminés:', error);
    return 0;
  }
}

/**
 * Calcule le nombre de segments validés pour un utilisateur
 * @param userId ID de l'utilisateur
 * @returns Nombre de segments validés
 */
export async function getValidatedSegmentsCount(userId: string): Promise<number> {
  try {
    const { count, error } = await supabase
      .from('reading_validations')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (error) {
      console.error('Erreur lors du calcul des segments validés:', error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error('Exception lors du calcul des segments validés:', error);
    return 0;
  }
}

/**
 * Calcule le temps total de lecture estimé (20 minutes par segment)
 * @param userId ID de l'utilisateur
 * @returns Temps de lecture estimé en minutes
 */
export async function getEstimatedReadingTime(userId: string): Promise<number> {
  try {
    const segments = await getValidatedSegmentsCount(userId);
    return segments * 20; // 20 minutes par segment
  } catch (error) {
    console.error('Exception lors du calcul du temps de lecture estimé:', error);
    return 0;
  }
}

/**
 * Calcule la moyenne de pages validées par semaine sur les 30 derniers jours
 * @param userId ID de l'utilisateur
 * @returns Moyenne de pages par semaine
 */
export async function getAveragePagesPerWeek(userId: string): Promise<number> {
  try {
    // Sélectionne les validations sur les 30 derniers jours
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - 30);
    
    const { data, error } = await supabase
      .from('reading_validations')
      .select('segment')
      .eq('user_id', userId)
      .gte('validated_at', fromDate.toISOString());

    if (error) {
      console.error("Erreur calcul moyenne pages/semaine:", error);
      return 0;
    }
    
    if (!data || data.length === 0) return 0;
    
    const totalPages = data.length * 30; // 30 pages par segment
    const weeks = 30 / 7; // Nombre de semaines sur la période (30j/7)
    
    // Arrondi à l'entier
    return Math.round(totalPages / weeks);
  } catch (error) {
    console.error('Exception lors du calcul de la moyenne de pages par semaine:', error);
    return 0;
  }
}

/**
 * Génère un message personnalisé selon les statistiques de lecture de l'utilisateur
 * @param totalBooks Nombre total de livres lus
 * @param totalSegments Nombre total de segments lus
 * @param readingTimeMinutes Temps de lecture total en minutes
 * @returns Message personnalisé
 */
export function getReaderProfileMessage(totalBooks: number, totalSegments: number, readingTimeMinutes: number): string {
  if (totalBooks === 0) {
    return "Commencez votre aventure de lecture !";
  }
  
  if (totalBooks >= 10 && readingTimeMinutes > 1000) {
    return "Lecteur marathonien - Impressionnant !";
  }
  
  if (totalSegments >= 50) {
    return "Lecteur assidu - Bravo pour votre constance !";
  }
  
  if (totalBooks >= 5) {
    return "Lecteur régulier - Continuez sur votre lancée !";
  }
  
  if (totalBooks >= 1) {
    return "Lecteur prometteur - Un bon début !";
  }
  
  return "Lecteur curieux - Prêt à explorer !";
}

/**
 * Récupère la série de lecture actuelle de l'utilisateur
 * @param userId ID de l'utilisateur
 * @returns Série actuelle
 */
export async function getCurrentStreak(userId: string): Promise<number> {
  try {
    // Pour l'instant, retournons une valeur fictive
    // Dans une implémentation réelle, nous calculerions le nombre de jours consécutifs
    // avec des validations jusqu'à aujourd'hui
    return 5;
  } catch (error) {
    console.error('Exception lors de la récupération de la série actuelle:', error);
    return 0;
  }
}

/**
 * Récupère la meilleure série de lecture de l'utilisateur
 * @param userId ID de l'utilisateur
 * @returns Meilleure série
 */
export async function getBestStreak(userId: string): Promise<number> {
  try {
    // Pour l'instant, retournons une valeur fictive
    // Dans une implémentation réelle, nous regarderions la plus longue séquence
    // de jours consécutifs avec des validations
    return 12;
  } catch (error) {
    console.error('Exception lors de la récupération de la meilleure série:', error);
    return 0;
  }
}
