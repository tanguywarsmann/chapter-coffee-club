
import { supabase } from "@/integrations/supabase/client";

/**
 * Calcule le nombre total de pages lues validées par l’utilisateur (1 segment = 30 pages).
 */
export async function getTotalPagesRead(userId: string): Promise<number> {
  try {
    const { data, error } = await supabase
      .from('reading_validations')
      .select('segment')
      .eq('user_id', userId);

    if (error) {
      console.error('Erreur lors du calcul du total de pages lues:', error);
      return 0;
    }

    // Un segment = 30 pages
    return (data?.length || 0) * 30;
  } catch (e) {
    console.error(e);
    return 0;
  }
}

/**
 * Calcule le nombre de livres pour lesquels current_page = total_pages (livres terminés).
 */
export async function getBooksReadCount(userId: string): Promise<number> {
  try {
    const { data, error } = await supabase
      .from('reading_progress')
      .select('id, current_page, total_pages')
      .eq('user_id', userId);

    if (error) {
      console.error('Erreur lors du calcul des livres lus:', error);
      return 0;
    }

    if (!data) return 0;

    // Livre terminé si current_page >= total_pages
    return data.filter((item: any) => {
      // current_page et total_pages pourraient être nuls, on sécurise
      if (typeof item.current_page !== "number" || typeof item.total_pages !== "number") return false;
      return item.current_page >= item.total_pages;
    }).length;
  } catch (e) {
    console.error(e);
    return 0;
  }
}

/**
 * Calcule le nombre de jours consécutifs avec au moins une validation
 * (à partir des dates de validations dans reading_validations).
 */
export async function getCurrentStreak(userId: string): Promise<number> {
  try {
    const { data, error } = await supabase
      .from('reading_validations')
      .select('validated_at')
      .eq('user_id', userId)
      .order('validated_at', { ascending: false });

    if (error) {
      console.error("Erreur calcul current streak:", error);
      return 0;
    }
    if (!data || data.length === 0) return 0;

    // On récupère uniquement les jours uniques (date sans l'heure)
    const datesSet = new Set<string>();
    data.forEach((row: any) => {
      if (row.validated_at) {
        const dateIso = new Date(row.validated_at).toISOString().split("T")[0];
        datesSet.add(dateIso);
      }
    });
    const dates = Array.from(datesSet).sort((a, b) => b.localeCompare(a));
    if (dates.length === 0) return 0;

    // Streak = combien de jours consécutifs jusqu'à aujourd'hui (0 inclus)
    let streak = 0;
    let day = new Date();
    for (const d of dates) {
      const compareStr = day.toISOString().slice(0, 10);
      if (d === compareStr) {
        streak += 1;
        // passer au jour précédent
        day.setDate(day.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  } catch (e) {
    console.error(e);
    return 0;
  }
}

/**
 * Calcule le plus long enchaînement de jours avec validation.
 */
export async function getBestStreak(userId: string): Promise<number> {
  try {
    const { data, error } = await supabase
      .from('reading_validations')
      .select('validated_at')
      .eq('user_id', userId)
      .order('validated_at', { ascending: true });

    if (error) {
      console.error("Erreur best streak:", error);
      return 0;
    }
    if (!data || data.length === 0) return 0;

    // Liste des jours uniques croissants
    const days = Array.from(new Set(
      data
        .map((row: any) => row.validated_at && new Date(row.validated_at).toISOString().split("T")[0])
        .filter(Boolean)
    )) as string[];

    if (days.length === 0) return 0;

    // Calcul du streak maximal
    let maxStreak = 1, streak = 1;
    for (let i = 1; i < days.length; i++) {
      const prev = new Date(days[i - 1]);
      const curr = new Date(days[i]);
      const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
      if (diff === 1) {
        streak++;
        maxStreak = Math.max(maxStreak, streak);
      } else {
        streak = 1;
      }
    }
    return maxStreak;
  } catch (e) {
    console.error(e);
    return 0;
  }
}

/**
 * Calcule la moyenne de pages validées par semaine sur les 30 derniers jours.
 */
export async function getAveragePagesPerWeek(userId: string): Promise<number> {
  try {
    // Sélectionne les validations sur les 30 derniers jours
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - 30);
    const { data, error } = await supabase
      .from('reading_validations')
      .select('validated_at')
      .eq('user_id', userId)
      .gte('validated_at', fromDate.toISOString());

    if (error) {
      console.error("Erreur calcul moyenne pages/semaine:", error);
      return 0;
    }
    if (!data) return 0;

    const segmentCount = data.length;
    const totalPages = segmentCount * 30;
    // Nombre de semaines sur la période (30j/7)
    const weeks = 30 / 7;

    // Arrondi à l'entier
    return Math.round(totalPages / weeks);
  } catch (e) {
    console.error(e);
    return 0;
  }
}
