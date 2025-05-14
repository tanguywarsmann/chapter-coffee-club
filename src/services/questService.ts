
import { supabase } from "@/integrations/supabase/client";
import { Quest, UserQuest, QuestSlug } from "@/types/quest";
import { getValidatedSegmentsCount } from "./reading/statsService";
import { toast } from "sonner";
import { getAllReadingProgress } from "./reading/progressService";
import { addXP } from "./user/levelService";

// Liste des quêtes disponibles dans l'application
const AVAILABLE_QUESTS: Record<QuestSlug, Quest> = {
  'early_reader': {
    slug: 'early_reader',
    title: 'Démarrage précoce',
    description: 'Valider au moins un segment de lecture',
    icon: '📚'
  },
  'triple_valide': {
    slug: 'triple_valide',
    title: 'Triple validation',
    description: 'Valider 3 segments de lecture',
    icon: '🏆'
  },
  'multi_booker': {
    slug: 'multi_booker',
    title: 'Multi-lecteur',
    description: 'Commencer la lecture de 2 livres différents',
    icon: '📚'
  },
  'back_on_track': {
    slug: 'back_on_track',
    title: 'De retour sur les rails',
    description: 'Reprendre la lecture après une pause de plus de 3 jours',
    icon: '🔄'
  }
};

/**
 * Récupère les quêtes d'un utilisateur
 * @param userId ID de l'utilisateur
 * @returns Liste des quêtes débloquées
 */
export async function getUserQuests(userId: string): Promise<UserQuest[]> {
  if (!userId) return [];
  
  try {
    const { data, error } = await supabase
      .from('user_quests')
      .select('*')
      .eq('user_id', userId);
      
    if (error) throw error;
    
    // Enrichir les quêtes avec leurs métadonnées
    return data.map(quest => ({
      ...quest,
      quest: AVAILABLE_QUESTS[quest.quest_slug as QuestSlug]
    }));
  } catch (error) {
    console.error('Error fetching user quests:', error);
    return [];
  }
}

/**
 * Vérifie si une quête est déjà débloquée pour un utilisateur
 */
async function isQuestUnlocked(userId: string, questSlug: QuestSlug): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('user_quests')
      .select('id')
      .eq('user_id', userId)
      .eq('quest_slug', questSlug)
      .maybeSingle();
      
    if (error) throw error;
    
    return !!data;
  } catch (error) {
    console.error('Error checking quest status:', error);
    return false;
  }
}

/**
 * Débloque une nouvelle quête pour un utilisateur
 */
async function unlockQuest(userId: string, questSlug: QuestSlug): Promise<boolean> {
  try {
    // Vérifier si la quête est déjà débloquée
    const alreadyUnlocked = await isQuestUnlocked(userId, questSlug);
    if (alreadyUnlocked) return false;
    
    const { error } = await supabase
      .from('user_quests')
      .insert({
        user_id: userId,
        quest_slug: questSlug
      });
      
    if (error) throw error;
    
    // Ajouter 20 XP pour avoir débloqué une quête
    await addXP(userId, 20);
    
    // Notify user
    toast.success(`Nouvelle quête débloquée : ${AVAILABLE_QUESTS[questSlug].title}`, {
      description: AVAILABLE_QUESTS[questSlug].description
    });
    
    return true;
  } catch (error) {
    console.error('Error unlocking quest:', error);
    return false;
  }
}

/**
 * Vérifie toutes les quêtes pour un utilisateur et débloque celles qui sont accomplies
 */
export async function checkUserQuests(userId: string): Promise<void> {
  try {
    if (!userId) return;
    
    // Récupérer les données nécessaires pour vérifier les quêtes
    const segmentCount = await getValidatedSegmentsCount(userId);
    const progress = await getAllReadingProgress(userId);
    
    // Quête "early_reader" - Valider au moins un segment de lecture
    if (segmentCount > 0) {
      await unlockQuest(userId, 'early_reader');
    }
    
    // Quête "triple_valide" - Valider 3 segments de lecture
    if (segmentCount >= 3) {
      await unlockQuest(userId, 'triple_valide');
    }
    
    // Quête "multi_booker" - Commencer la lecture de 2 livres différents
    if (progress.filter(p => p.current_page > 0).length >= 2) {
      await unlockQuest(userId, 'multi_booker');
    }
    
    // La quête "back_on_track" est vérifiée lors de la reprise de lecture
    // après une période d'inactivité, elle est gérée séparément
    
  } catch (error) {
    console.error('Error checking quests:', error);
  }
}

/**
 * Vérifie si l'utilisateur reprend après une pause (pour la quête back_on_track)
 */
export async function checkBackOnTrack(userId: string, lastReadingDate: string): Promise<void> {
  try {
    // Calculer la différence en jours
    const lastDate = new Date(lastReadingDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - lastDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Si la différence est supérieure à 3 jours, c'est une reprise après pause
    if (diffDays > 3) {
      await unlockQuest(userId, 'back_on_track');
    }
  } catch (error) {
    console.error('Error checking back on track quest:', error);
  }
}

/**
 * Renvoie la liste de toutes les quêtes disponibles
 */
export function getAllAvailableQuests(): Quest[] {
  return Object.values(AVAILABLE_QUESTS);
}
