
import { supabase } from "@/integrations/supabase/client";
import { UserQuest, QuestSlug } from "@/types/quest";
import { toast } from "sonner";
import { differenceInDays } from "date-fns";

// Catalogue des quêtes disponibles
export const QUESTS: Record<QuestSlug, { title: string; description: string; icon?: string }> = {
  early_reader: {
    title: "Lève-tôt",
    description: "Lire entre 4h et 6h du matin",
    icon: "sun"
  },
  triple_valide: {
    title: "Triple validation",
    description: "Valider 3 segments le même jour",
    icon: "zap"
  },
  multi_booker: {
    title: "Multi-livres",
    description: "Lire 2 livres différents dans la même semaine",
    icon: "books"
  },
  back_on_track: {
    title: "De retour",
    description: "Reprendre la lecture après 7 jours d'inactivité",
    icon: "refresh"
  }
};

// Vérifie si une quête a déjà été débloquée
export async function isQuestUnlocked(userId: string, questSlug: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from("user_quests")
      .select("id")
      .eq("user_id", userId)
      .eq("quest_slug", questSlug)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error("Erreur lors de la vérification de quête:", error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error("Exception lors de la vérification de quête:", error);
    return false;
  }
}

// Ajoute une quête débloquée
export async function unlockQuest(userId: string, questSlug: QuestSlug): Promise<UserQuest | null> {
  try {
    // Vérifie si la quête est déjà débloquée
    const alreadyUnlocked = await isQuestUnlocked(userId, questSlug);
    if (alreadyUnlocked) {
      return null;
    }

    // Ajoute la nouvelle quête débloquée
    const { data, error } = await supabase
      .from("user_quests")
      .insert({
        user_id: userId,
        quest_slug: questSlug
      })
      .select("*")
      .single();

    if (error) {
      console.error("Erreur lors du débloquage de la quête:", error);
      return null;
    }

    // Ajoute les métadonnées de la quête au résultat
    const quest = QUESTS[questSlug as QuestSlug];
    const userQuest: UserQuest = {
      ...data,
      quest: quest ? {
        slug: questSlug,
        title: quest.title,
        description: quest.description,
        icon: quest.icon
      } : undefined
    };

    // Affiche une notification
    toast.success(`Quête débloquée: ${quest?.title || questSlug}`, {
      description: quest?.description,
      duration: 5000
    });

    return userQuest;
  } catch (error) {
    console.error("Exception lors du débloquage de quête:", error);
    return null;
  }
}

// Récupère toutes les quêtes débloquées d'un utilisateur
export async function getUserQuests(userId: string): Promise<UserQuest[]> {
  if (!userId) return [];

  try {
    const { data, error } = await supabase
      .from("user_quests")
      .select("*")
      .eq("user_id", userId)
      .order("unlocked_at", { ascending: false });

    if (error) {
      console.error("Erreur lors de la récupération des quêtes:", error);
      return [];
    }

    // Ajoute les métadonnées des quêtes
    return data.map(quest => {
      const questInfo = QUESTS[quest.quest_slug as QuestSlug];
      return {
        ...quest,
        quest: questInfo ? {
          slug: quest.quest_slug,
          title: questInfo.title,
          description: questInfo.description,
          icon: questInfo.icon
        } : undefined
      };
    });
  } catch (error) {
    console.error("Exception lors de la récupération des quêtes:", error);
    return [];
  }
}

// Fonction principale pour vérifier et débloquer les quêtes
export async function checkUserQuests(userId: string): Promise<UserQuest[]> {
  if (!userId) return [];
  
  try {
    const unlockedQuests: UserQuest[] = [];
    
    // Vérifie la quête "early_reader" (lecture entre 4h et 6h du matin)
    const earlyReaderUnlocked = await checkEarlyReaderQuest(userId);
    if (earlyReaderUnlocked) {
      unlockedQuests.push(earlyReaderUnlocked);
    }
    
    // Vérifie la quête "triple_valide" (3 validations le même jour)
    const tripleValideUnlocked = await checkTripleValideQuest(userId);
    if (tripleValideUnlocked) {
      unlockedQuests.push(tripleValideUnlocked);
    }
    
    // Vérifie la quête "multi_booker" (2 livres différents dans la même semaine)
    const multiBookerUnlocked = await checkMultiBookerQuest(userId);
    if (multiBookerUnlocked) {
      unlockedQuests.push(multiBookerUnlocked);
    }
    
    // Vérifie la quête "back_on_track" (retour après 7 jours d'inactivité)
    const backOnTrackUnlocked = await checkBackOnTrackQuest(userId);
    if (backOnTrackUnlocked) {
      unlockedQuests.push(backOnTrackUnlocked);
    }
    
    return unlockedQuests;
  } catch (error) {
    console.error("Erreur lors de la vérification des quêtes:", error);
    return [];
  }
}

// Vérifie si l'utilisateur a validé un segment entre 4h et 6h du matin
async function checkEarlyReaderQuest(userId: string): Promise<UserQuest | null> {
  try {
    const { data, error } = await supabase
      .from("reading_validations")
      .select("validated_at")
      .eq("user_id", userId)
      .order("validated_at", { ascending: false });

    if (error || !data || data.length === 0) {
      return null;
    }

    // Vérifie si l'une des validations a eu lieu entre 4h et 6h du matin
    const earlyMorningValidation = data.some(validation => {
      const validationDate = new Date(validation.validated_at);
      const hours = validationDate.getHours();
      return hours >= 4 && hours < 6;
    });

    if (earlyMorningValidation) {
      return await unlockQuest(userId, "early_reader");
    }

    return null;
  } catch (error) {
    console.error("Erreur lors de la vérification de la quête early_reader:", error);
    return null;
  }
}

// Vérifie si l'utilisateur a validé 3 segments le même jour
async function checkTripleValideQuest(userId: string): Promise<UserQuest | null> {
  try {
    const { data, error } = await supabase
      .from("reading_validations")
      .select("validated_at")
      .eq("user_id", userId)
      .order("validated_at", { ascending: false });

    if (error || !data || data.length === 0) {
      return null;
    }

    // Groupe les validations par jour
    const validationsByDay: Record<string, number> = {};
    data.forEach(validation => {
      const date = new Date(validation.validated_at).toISOString().split('T')[0];
      validationsByDay[date] = (validationsByDay[date] || 0) + 1;
    });

    // Vérifie s'il y a au moins un jour avec 3 validations ou plus
    const hasTripleValidation = Object.values(validationsByDay).some(count => count >= 3);

    if (hasTripleValidation) {
      return await unlockQuest(userId, "triple_valide");
    }

    return null;
  } catch (error) {
    console.error("Erreur lors de la vérification de la quête triple_valide:", error);
    return null;
  }
}

// Vérifie si l'utilisateur a lu 2 livres différents dans la même semaine
async function checkMultiBookerQuest(userId: string): Promise<UserQuest | null> {
  try {
    const { data, error } = await supabase
      .from("reading_validations")
      .select("book_id, validated_at")
      .eq("user_id", userId)
      .order("validated_at", { ascending: false });

    if (error || !data || data.length === 0) {
      return null;
    }

    // Groupe les validations par semaine
    const booksByWeek: Record<string, Set<string>> = {};
    data.forEach(validation => {
      const date = new Date(validation.validated_at);
      // Get ISO week number (1-53)
      const weekNumber = getWeekNumber(date);
      const weekYear = `${date.getFullYear()}-W${weekNumber}`;
      
      if (!booksByWeek[weekYear]) {
        booksByWeek[weekYear] = new Set();
      }
      booksByWeek[weekYear].add(validation.book_id);
    });

    // Vérifie s'il y a au moins une semaine avec 2 livres différents ou plus
    const hasMultiBookWeek = Object.values(booksByWeek).some(books => books.size >= 2);

    if (hasMultiBookWeek) {
      return await unlockQuest(userId, "multi_booker");
    }

    return null;
  } catch (error) {
    console.error("Erreur lors de la vérification de la quête multi_booker:", error);
    return null;
  }
}

// Vérifie si l'utilisateur est revenu après une période d'inactivité de 7 jours ou plus
async function checkBackOnTrackQuest(userId: string): Promise<UserQuest | null> {
  try {
    const { data, error } = await supabase
      .from("reading_validations")
      .select("validated_at")
      .eq("user_id", userId)
      .order("validated_at", { ascending: false });

    if (error || !data || data.length <= 1) {
      return null;
    }

    // Trie les dates par ordre chronologique
    const dates = data.map(v => new Date(v.validated_at)).sort((a, b) => a.getTime() - b.getTime());

    // Cherche un écart de 7 jours ou plus entre deux validations consécutives
    for (let i = 1; i < dates.length; i++) {
      const daysDiff = differenceInDays(dates[i], dates[i-1]);
      if (daysDiff >= 7) {
        return await unlockQuest(userId, "back_on_track");
      }
    }

    return null;
  } catch (error) {
    console.error("Erreur lors de la vérification de la quête back_on_track:", error);
    return null;
  }
}

// Fonction utilitaire pour obtenir le numéro de semaine
function getWeekNumber(date: Date): number {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}
