
import { supabase } from "@/integrations/supabase/client";
import { Quest, UserQuest, QuestSlug } from "@/types/quest";
import { addXP } from "@/services/user/levelService";
import { getUserReadingProgress } from "./reading/progressService";
import { Database } from "@/integrations/supabase/types";
import { toast } from "sonner";

type UserQuestRecord = Database['public']['Tables']['user_quests']['Row'];

// Définition des quêtes disponibles
export const availableQuests: Quest[] = [
  {
    slug: 'early_reader' as QuestSlug,
    title: 'Lecteur matinal',
    description: 'Lire un livre avant 7h du matin',
    icon: 'sun'
  },
  {
    slug: 'triple_valide' as QuestSlug,
    title: 'Triple validation',
    description: 'Valider 3 segments de lecture en une seule journée',
    icon: 'zap'
  },
  {
    slug: 'multi_booker' as QuestSlug,
    title: 'Multi-lecteur',
    description: 'Avoir 3 livres en cours de lecture simultanément',
    icon: 'books'
  },
  {
    slug: 'back_on_track' as QuestSlug,
    title: 'De retour sur les rails',
    description: 'Reprendre la lecture après une pause de 7 jours',
    icon: 'refresh'
  }
];

/**
 * Complète une quête pour un utilisateur
 */
export const completeQuest = async (userId: string, questSlug: string): Promise<boolean> => {
  try {
    if (!userId || !questSlug) {
      console.error("completeQuest: userId and questSlug are required");
      return false;
    }

    // Vérifier si la quête est déjà débloquée
    const { data: existingQuest, error: questError } = await supabase
      .from('user_quests')
      .select('*')
      .eq('user_id', userId)
      .eq('quest_slug', questSlug)
      .maybeSingle();

    if (questError && questError.code !== 'PGRST116') {
      console.error("Error checking existing quest:", questError);
      return false;
    }

    if (existingQuest) {
      console.log("Quest already unlocked:", questSlug);
      return true; // Quête déjà débloquée
    }

    // Insérer la quête terminée dans la table user_quests
    const { data, error } = await supabase
      .from('user_quests')
      .insert({
        user_id: userId,
        quest_slug: questSlug,
        unlocked_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("Error completing quest:", error);
      return false;
    }

    console.log(`✅ Quête terminée avec succès: ${questSlug} pour l'utilisateur ${userId}`);
    
    // Ajouter des points XP pour la complétion d'une quête (50 XP)
    const xpSuccess = await addXP(userId, 50);
    if (xpSuccess) {
      console.log(`✅ XP ajouté pour la quête: +50 XP`);
    }

    // Notifier l'utilisateur
    const questInfo = availableQuests.find(q => q.slug === questSlug);
    if (questInfo) {
      toast.success(`Quête terminée : ${questInfo.title}`, {
        duration: 5000,
      });
    }
    
    return true;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    console.error("Error completing quest:", errorMsg);
    return false;
  }
};

/**
 * Vérifie les quêtes d'un utilisateur et les débloque selon certaines conditions
 */
export const checkUserQuests = async (userId: string): Promise<void> => {
  try {
    if (!userId) {
      console.error("checkUserQuests: userId is required");
      return;
    }

    console.log(`🔍 Vérification des quêtes pour l'utilisateur ${userId}`);

    // Récupérer la progression de lecture de l'utilisateur
    const readingProgress = await getUserReadingProgress(userId);
    
    // Récupérer les validations de l'utilisateur
    const { data: validations, error: validationError } = await supabase
      .from('reading_validations')
      .select('*')
      .eq('user_id', userId)
      .order('validated_at', { ascending: false });

    if (validationError) {
      console.error("Error fetching validations:", validationError);
      return;
    }

    // Vérifier chaque quête disponible
    for (const quest of availableQuests) {
      let shouldUnlock = false;

      switch (quest.slug) {
        case 'triple_valide':
          // Vérifier si l'utilisateur a validé 3 segments dans la même journée
          if (validations && validations.length >= 3) {
            const today = new Date().toISOString().split('T')[0];
            const todayValidations = validations.filter(v => 
              v.validated_at.startsWith(today)
            );
            shouldUnlock = todayValidations.length >= 3;
          }
          break;
          
        case 'multi_booker':
          // Vérifier si l'utilisateur a 3 livres en cours
          const inProgressBooks = readingProgress.filter(p => p.status === 'in_progress');
          shouldUnlock = inProgressBooks.length >= 3;
          break;
          
        case 'back_on_track':
          // Vérifier si l'utilisateur a repris la lecture après 7 jours
          if (validations && validations.length >= 2) {
            const lastValidation = new Date(validations[0].validated_at);
            const previousValidation = new Date(validations[1].validated_at);
            const daysDifference = Math.floor((lastValidation.getTime() - previousValidation.getTime()) / (1000 * 60 * 60 * 24));
            shouldUnlock = daysDifference >= 7;
          }
          break;
          
        default:
          break;
      }

      if (shouldUnlock) {
        const success = await completeQuest(userId, quest.slug);
        if (success) {
          console.log(`🎉 Quête automatiquement débloquée: ${quest.slug}`);
        }
      }
    }
  } catch (error) {
    console.error("Error checking user quests:", error);
  }
};

/**
 * Récupère toutes les quêtes d'un utilisateur
 */
export const getUserQuests = async (userId: string): Promise<UserQuest[]> => {
  try {
    if (!userId) {
      console.error("getUserQuests: userId is required");
      return [];
    }

    const { data, error } = await supabase
      .from('user_quests')
      .select('*')
      .eq('user_id', userId)
      .order('unlocked_at', { ascending: false });

    if (error) {
      console.error("Error fetching user quests:", error);
      return [];
    }

    // Mapper les quêtes de l'utilisateur pour inclure les détails de la quête
    const userQuests = data.map(item => {
      const questDetails = availableQuests.find(q => q.slug === item.quest_slug);
      return {
        ...item,
        quest: questDetails
      };
    });

    return userQuests;
  } catch (error) {
    console.error("Error fetching user quests:", error);
    return [];
  }
};

/**
 * Récupère les statistiques des quêtes pour l'affichage
 */
export const getQuestStats = async (userId: string): Promise<{
  completed: number;
  total: number;
  completionRate: number;
}> => {
  try {
    const userQuests = await getUserQuests(userId);
    const completed = userQuests.length;
    const total = availableQuests.length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      completed,
      total,
      completionRate
    };
  } catch (error) {
    console.error("Error fetching quest stats:", error);
    return {
      completed: 0,
      total: availableQuests.length,
      completionRate: 0
    };
  }
};
