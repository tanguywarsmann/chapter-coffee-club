import { supabase } from "@/integrations/supabase/client";

/**
 * Calcule le nombre de jokers autorisés selon le nombre de segments
 */
export function calculateJokersAllowed(expectedSegments: number): number {
  return Math.floor(expectedSegments / 10) + 1;
}

/**
 * Compte le nombre de jokers déjà utilisés pour une lecture
 */
export async function getUsedJokersCount(progressId: string): Promise<number> {
  try {
    const { data, error } = await supabase
      .from('reading_validations')
      .select('id')
      .eq('progress_id', progressId)
      .eq('used_joker', true);
    if (error) return 0;
    return data?.length || 0;
  } catch {
    return 0;
  }
}

/**
 * Calcule les informations de jokers pour un livre
 */
export async function getJokersInfo(expectedSegments: number, progressId?: string): Promise<{
  jokersAllowed: number;
  jokersUsed: number;
}> {
  const jokersAllowed = calculateJokersAllowed(expectedSegments);
  const jokersUsed = progressId ? await getUsedJokersCount(progressId) : 0;
  
  return {
    jokersAllowed,
    jokersUsed
  };
}