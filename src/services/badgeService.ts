import { toast } from "sonner";
import { Book } from "@/types/book";
import { Badge } from "@/types/badge";
import { ReadingStreak } from "@/types/reading";
import { getUserStreak } from "./streakService";
import { supabase } from "@/integrations/supabase/client";
import { UserBadge } from "./books/types";
import { ExtendedDatabase } from "@/types/supabase-extensions";
import { SupabaseClient } from "@supabase/supabase-js";

// Create a local extended Supabase client with proper typing support for user_badges
const supabaseExtended = supabase as SupabaseClient<ExtendedDatabase>;

// Interface pour les sessions de lecture
interface ReadingSession {
  startTime: string;
  endTime: string;
  duration: number; // en minutes
  startHour: number;
}

// Interface pour les données de l'utilisateur nécessaires à la vérification des badges
interface UserBadgeData {
  id: string;
  completedBooks: Book[];
  readingSessions: ReadingSession[];
  reviews?: { id: string; bookId: string; content: string }[];
  recommendations?: { id: string; bookId: string; recipientId: string }[];
  preferredLanguage?: string;
}

// Mapping temporaire des nationalités d'auteurs aux continents
const authorContinentMap: Record<string, string> = {
  'france': 'europe',
  'uk': 'europe',
  'usa': 'north_america',
  'canada': 'north_america',
  'japan': 'asia',
  'china': 'asia',
  'russia': 'europe',
  'brazil': 'south_america',
  'nigeria': 'africa',
  'australia': 'oceania',
  // Ajouter d'autres mappings au besoin
};

// Fonction helper pour obtenir le continent d'une nationalité
export const getContinent = (nationality: string): string => {
  return authorContinentMap[nationality.toLowerCase()] || 'unknown';
};

// Définition des badges disponibles dans le système
export const availableBadges: Omit<Badge, "dateEarned">[] = [
  {
    id: "premier-livre",
    name: "Premier livre terminé",
    description: "Vous avez terminé votre premier livre. Bravo!",
    icon: "📚",
    color: "green-100"
  },
  {
    id: "lecteur-classique",
    name: "Lecteur Classique",
    description: "Vous avez lu 3 classiques de la littérature française.",
    icon: "🏛️",
    color: "coffee-light"
  },
  {
    id: "serie-7-jours",
    name: "Série de 7 jours",
    description: "Vous avez lu pendant 7 jours consécutifs.",
    icon: "🔥",
    color: "orange-100"
  },
  {
    id: "lecteur-nocturne",
    name: "Lecteur Nocturne",
    description: "Vous avez lu plus de 2 heures après 22h.",
    icon: "🌙",
    color: "purple-100"
  },
  {
    id: "critique-litteraire",
    name: "Critique Littéraire",
    description: "Vous avez partagé 5 critiques de livres.",
    icon: "✍️",
    color: "blue-100"
  },
  {
    id: "marathon-lecture",
    name: "Marathon Lecture",
    description: "Vous avez lu pendant plus de 5 heures d'affilée.",
    icon: "🏃",
    color: "red-100"
  },
  {
    id: "globe-trotter",
    name: "Globe-trotter",
    description: "Vous avez lu des livres d'auteurs de 3 continents différents.",
    icon: "🌍",
    color: "teal-100"
  },
  {
    id: "polyglotte",
    name: "Polyglotte",
    description: "Vous avez lu un livre en langue étrangère.",
    icon: "🗣️",
    color: "indigo-100"
  },
  {
    id: "mentor",
    name: "Mentor",
    description: "Vous avez recommandé des livres à 3 autres lecteurs.",
    icon: "🎓",
    color: "yellow-100"
  },
  {
    id: "expert-poesie",
    name: "Expert en Poésie",
    description: "Vous avez lu 5 recueils de poésie.",
    icon: "🎭",
    color: "pink-100"
  },
  {
    id: "lecteur-assidu",
    name: "Lecteur Assidu",
    description: "Lire pendant 30 jours consécutifs",
    icon: "🔥",
    color: "orange-100"
  },
  {
    id: "explorateur-litteraire",
    name: "Explorateur Littéraire",
    description: "Lire des livres dans 5 catégories différentes",
    icon: "🧭",
    color: "blue-100"
  },
  {
    id: "marathonien",
    name: "Marathonien",
    description: "Lire 10 livres en un mois",
    icon: "🏃",
    color: "green-100"
  },
  {
    id: "expert-classiques",
    name: "Expert en Classiques",
    description: "Lire 10 classiques de la littérature",
    icon: "📜",
    color: "coffee-light"
  },
  {
    id: "lecteur-nocturne-v2",
    name: "Lecteur Nocturne Avancé",
    description: "Lire plus de 3 heures après 22h",
    icon: "🌙",
    color: "purple-100"
  },
  {
    id: "badge_test_insertion",
    name: "Badge Test",
    description: "Ce badge est utilisé pour tester l'insertion dans Supabase",
    icon: "🧪",
    color: "amber-100"
  }
];

// Récupérer les badges de l'utilisateur depuis Supabase
export const getUserBadges = async (userId?: string): Promise<Badge[]> => {
  if (!userId) return [];
  
  try {
    const { data, error } = await supabaseExtended
      .from('user_badges')
      .select('badge_key, unlocked_at')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching badges from Supabase:', error);
      return [];
    }

    if (!data || data.length === 0) {
      return [];
    }

    // Transformer les données de Supabase en objets Badge
    const badges = data.map(item => {
      const badgeInfo = availableBadges.find(b => b.id === item.badge_key);
      if (!badgeInfo) return null;
      
      return {
        ...badgeInfo,
        dateEarned: new Date(item.unlocked_at).toLocaleDateString('fr-FR')
      };
    }).filter(Boolean) as Badge[];

    return badges;
  } catch (error) {
    console.error('Unexpected error fetching badges:', error);
    return [];
  }
};

// Vérifier si un badge est déjà débloqué
export const isBadgeUnlocked = async (userId: string, badgeId: string): Promise<boolean> => {
  if (!userId) return false;
  
  try {
    const { data, error } = await supabaseExtended
      .from('user_badges')
      .select('id')
      .eq('user_id', userId)
      .eq('badge_key', badgeId)
      .maybeSingle();

    if (error) {
      console.error('Error checking badge status:', error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error('Unexpected error checking badge status:', error);
    return false;
  }
};

// Réinitialiser tous les badges (pour tests ou réinitialisation en mode DEV)
export const resetAllBadges = async (userId: string): Promise<boolean> => {
  if (!userId || process.env.NODE_ENV !== 'development') {
    return false;
  }

  try {
    const { error } = await supabaseExtended
      .from('user_badges')
      .delete()
      .eq('user_id', userId);

    if (error) {
      console.error('Error resetting badges:', error);
      toast.error("Erreur lors de la réinitialisation des badges");
      return false;
    }

    toast.success("Tous les badges ont été réinitialisés");
    return true;
  } catch (error) {
    console.error('Unexpected error resetting badges:', error);
    toast.error("Erreur lors de la réinitialisation des badges");
    return false;
  }
};

import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export async function earnBadge(userId: string, badgeSlug: string) {
  if (!userId || !badgeSlug) return;

  // 1. Récupérer le badge correspondant
  const { data: badge, error: badgeError } = await supabase
    .from("badges")
    .select("id, label")
    .eq("slug", badgeSlug)
    .single();

  if (badgeError || !badge) {
    console.error("Badge introuvable ou erreur :", badgeError);
    return;
  }

  // 2. Vérifier s’il a déjà été obtenu
  const { data: existing } = await supabase
    .from("user_badges")
    .select("id")
    .eq("user_id", userId)
    .eq("badge_id", badge.id)
    .maybeSingle();

  if (existing) return; // Badge déjà obtenu

  // 3. Insérer dans user_badges
  const { error: insertError } = await supabase.from("user_badges").insert({
    user_id: userId,
    badge_id: badge.id,
  });

  if (insertError) {
    console.error("Erreur en ajoutant le badge :", insertError);
    return;
  }

  // 4. Afficher un toast de succès
  toast.success(`🎉 Badge obtenu : ${badge.label}`);
}

    // Trouver les infos du badge pour l'affichage toast
    const badge = availableBadges.find(b => b.id === badgeId);
    if (badge) {
      // Informer l'utilisateur
      toast.success(`Badge débloqué : ${badge.name}`, {
        description: badge.description
      });
    }

    return true;
  } catch (error) {
    console.error('Unexpected error unlocking badge:', error);
    return false;
  }
};

// Récupérer les sessions de lecture de l'utilisateur
export const getUserReadingSessions = (userId: string): ReadingSession[] => {
  const storedSessions = localStorage.getItem(`reading_sessions_${userId}`);
  if (storedSessions) {
    return JSON.parse(storedSessions);
  }
  return [];
};

// Récupérer les critiques de l'utilisateur
export const getUserReviews = (userId: string): any[] => {
  const storedReviews = localStorage.getItem(`user_reviews_${userId}`);
  if (storedReviews) {
    return JSON.parse(storedReviews);
  }
  return [];
};

// Récupérer les recommandations de l'utilisateur
export const getUserRecommendations = (userId: string): any[] => {
  const storedRecommendations = localStorage.getItem(`user_recommendations_${userId}`);
  if (storedRecommendations) {
    return JSON.parse(storedRecommendations);
  }
  return [];
};

// Vérifier et débloquer les badges en fonction des conditions
export const checkAndUnlockBadges = async (userData: UserBadgeData): Promise<void> => {
  const { id, completedBooks, readingSessions } = userData;
  if (!id) return;
  
  const streak = getUserStreak(id);
  const reviews = userData.reviews || getUserReviews(id);
  const recommendations = userData.recommendations || getUserRecommendations(id);
  const preferredLanguage = userData.preferredLanguage || 'fr';

  // Premier livre terminé
  if (completedBooks.length >= 1) {
    await unlockBadge(id, "premier-livre");
  }

  // Lecteur Classique
  const classics = completedBooks.filter(b => b.categories.includes("classique")).length;
  if (classics >= 3) {
    await unlockBadge(id, "lecteur-classique");
  }

  // Série de 7 jours
  if (streak.current_streak >= 7) {
    await unlockBadge(id, "serie-7-jours");
  }

  // Lecteur Nocturne
  const nocturnes = readingSessions.filter(s => s.startHour >= 22 && s.duration >= 120).length;
  if (nocturnes >= 1) {
    await unlockBadge(id, "lecteur-nocturne");
  }

  // Critique Littéraire
  if (reviews.length >= 5) {
    await unlockBadge(id, "critique-litteraire");
  }

  // Marathon Lecture
  if (readingSessions.some(s => s.duration >= 300)) {
    await unlockBadge(id, "marathon-lecture");
  }

  // Globe-trotter
  const continents = new Set(completedBooks
    .filter(b => b.author) // Vérifier que l'auteur est défini
    .map(b => {
      // Ici on pourrait ajouter une logique pour extraire la nationalité de l'auteur
      // Pour l'instant, on utilise simplement un mapping simplifié
      const nationality = b.author.split(' ').pop()?.toLowerCase() || '';
      return getContinent(nationality);
    }));
  
  if (continents.size >= 3) {
    await unlockBadge(id, "globe-trotter");
  }

  // Polyglotte
  if (completedBooks.some(b => b.language && b.language !== preferredLanguage)) {
    await unlockBadge(id, "polyglotte");
  }

  // Mentor
  if (recommendations.length >= 3) {
    await unlockBadge(id, "mentor");
  }

  // Expert en Poésie
  const poesie = completedBooks.filter(b => b.categories.includes("poésie")).length;
  if (poesie >= 5) {
    await unlockBadge(id, "expert-poesie");
  }

  // Badges à débloquer plus tard (même logique mais seuils plus élevés)
  
  // Lecteur Assidu
  if (streak.current_streak >= 30) {
    await unlockBadge(id, "lecteur-assidu");
  }

  // Explorateur Littéraire
  const categories = new Set(completedBooks.flatMap(b => b.categories));
  if (categories.size >= 5) {
    await unlockBadge(id, "explorateur-litteraire");
  }

  // Marathonien (10 livres en un mois)
  // Pour simplifier, nous vérifions juste si l'utilisateur a terminé 10 livres
  if (completedBooks.length >= 10) {
    await unlockBadge(id, "marathonien");
  }

  // Expert en Classiques
  if (classics >= 10) {
    await unlockBadge(id, "expert-classiques");
  }

  // Lecteur Nocturne (niveau avancé)
  const advancedNocturnes = readingSessions.filter(s => s.startHour >= 22 && s.duration >= 180).length;
  if (advancedNocturnes >= 1) {
    await unlockBadge(id, "lecteur-nocturne-v2");
  }
};

// Enregistrer une session de lecture
export const recordReadingSession = (
  userId: string, 
  startTime: Date, 
  endTime: Date
): void => {
  const duration = (endTime.getTime() - startTime.getTime()) / (1000 * 60); // en minutes
  const startHour = startTime.getHours();
  
  const session: ReadingSession = {
    startTime: startTime.toISOString(),
    endTime: endTime.toISOString(),
    duration,
    startHour
  };
  
  const sessions = getUserReadingSessions(userId);
  sessions.push(session);
  localStorage.setItem(`reading_sessions_${userId}`, JSON.stringify(sessions));
  
  // Vérifier les badges après une session de lecture
  checkBadgesForUser(userId);
};

// Fonction principale pour vérifier les badges d'un utilisateur
// Ne s'exécutera que lors d'actions spécifiques, plus au chargement de la page
export const checkBadgesForUser = async (userId: string): Promise<void> => {
  if (!userId) return;
  
  try {
    // Récupérer les livres terminés
    const completedBooks = localStorage.getItem(`completed_books_${userId}`) 
      ? JSON.parse(localStorage.getItem(`completed_books_${userId}`) || '[]')
      : [];
    
    // Récupérer les sessions de lecture
    const readingSessions = getUserReadingSessions(userId);
    
    // Récupérer les critiques
    const reviews = getUserReviews(userId);
    
    // Récupérer les recommandations
    const recommendations = getUserRecommendations(userId);
    
    // Vérifier et débloquer les badges
    await checkAndUnlockBadges({
      id: userId,
      completedBooks,
      readingSessions,
      reviews,
      recommendations,
      preferredLanguage: 'fr' // Par défaut
    });
  } catch (error) {
    console.error("Erreur lors de la vérification des badges:", error);
  }
};

// Exporter une liste de badges mockés pour la compatibilité
export const mockBadges: Badge[] = [];
