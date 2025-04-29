
import { toast } from "sonner";
import { Book } from "@/types/book";
import { Badge } from "@/types/badge";
import { ReadingStreak, ReadingActivity } from "@/types/reading";
import { getUserStreak } from "./streakService";
import { mockBadges } from "@/mock/badges";

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

// Récupérer les badges de l'utilisateur depuis le localStorage
export const getUserBadges = (): Badge[] => {
  const storedBadges = localStorage.getItem('user_badges');
  if (storedBadges) {
    return JSON.parse(storedBadges);
  }
  // Retourner par défaut les badges déjà obtenus (pour compatibilité avec le code existant)
  return mockBadges;
};

// Sauvegarder les badges de l'utilisateur dans le localStorage
export const saveUserBadges = (badges: Badge[]): void => {
  localStorage.setItem('user_badges', JSON.stringify(badges));
};

// Vérifier si un badge est déjà débloqué
export const isBadgeUnlocked = (badgeId: string): boolean => {
  const badges = getUserBadges();
  return badges.some(badge => badge.id === badgeId);
};

// Débloquer un badge
export const unlockBadge = (badgeId: string): boolean => {
  if (isBadgeUnlocked(badgeId)) {
    return false; // Badge déjà débloqué
  }

  // Trouver le badge dans la liste des badges verrouillés
  const lockedBadges: Omit<Badge, "dateEarned">[] = [
    {
      id: "locked1",
      name: "Lecteur Assidu",
      description: "Lire pendant 30 jours consécutifs",
      icon: "🔥",
      color: "orange-100"
    },
    {
      id: "locked2",
      name: "Explorateur Littéraire",
      description: "Lire des livres dans 5 catégories différentes",
      icon: "🧭",
      color: "blue-100"
    },
    {
      id: "locked3",
      name: "Marathonien",
      description: "Lire 10 livres en un mois",
      icon: "🏃",
      color: "green-100"
    },
    {
      id: "locked4",
      name: "Expert en Classiques",
      description: "Lire 10 classiques de la littérature",
      icon: "📜",
      color: "coffee-light"
    },
    {
      id: "locked5",
      name: "Lecteur Nocturne",
      description: "Lire plus de 3 heures après 22h",
      icon: "🌙",
      color: "purple-100"
    },
    // Ajouter tous les badges possibles ici
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
    }
  ];

  const badgeToUnlock = lockedBadges.find(badge => badge.id === badgeId);
  if (!badgeToUnlock) {
    console.error(`Badge with id ${badgeId} not found`);
    return false;
  }

  // Créer un nouveau badge avec la date actuelle
  const newBadge: Badge = {
    ...badgeToUnlock,
    dateEarned: new Date().toLocaleDateString('fr-FR')
  };

  // Ajouter le badge à la liste des badges débloqués
  const userBadges = getUserBadges();
  userBadges.push(newBadge);
  saveUserBadges(userBadges);

  // Informer l'utilisateur
  toast.success(`Badge débloqué : ${newBadge.name}`, {
    description: newBadge.description
  });

  return true;
};

// Récupérer les sessions de lecture de l'utilisateur (fonction temporaire)
export const getUserReadingSessions = (userId: string): ReadingSession[] => {
  const storedSessions = localStorage.getItem(`reading_sessions_${userId}`);
  if (storedSessions) {
    return JSON.parse(storedSessions);
  }
  return [];
};

// Récupérer les critiques de l'utilisateur (fonction temporaire)
export const getUserReviews = (userId: string): any[] => {
  const storedReviews = localStorage.getItem(`user_reviews_${userId}`);
  if (storedReviews) {
    return JSON.parse(storedReviews);
  }
  return [];
};

// Récupérer les recommandations de l'utilisateur (fonction temporaire)
export const getUserRecommendations = (userId: string): any[] => {
  const storedRecommendations = localStorage.getItem(`user_recommendations_${userId}`);
  if (storedRecommendations) {
    return JSON.parse(storedRecommendations);
  }
  return [];
};

// Vérifier et débloquer les badges en fonction des conditions
export const checkAndUnlockBadges = (userData: UserBadgeData): void => {
  const { id, completedBooks, readingSessions } = userData;
  const streak = getUserStreak(id);
  const reviews = userData.reviews || getUserReviews(id);
  const recommendations = userData.recommendations || getUserRecommendations(id);
  const preferredLanguage = userData.preferredLanguage || 'fr';

  // Premier livre terminé
  if (completedBooks.length >= 1) {
    unlockBadge("premier-livre");
  }

  // Lecteur Classique
  const classics = completedBooks.filter(b => b.categories.includes("classique")).length;
  if (classics >= 3) {
    unlockBadge("lecteur-classique");
  }

  // Série de 7 jours
  if (streak.current_streak >= 7) {
    unlockBadge("serie-7-jours");
  }

  // Lecteur Nocturne
  const nocturnes = readingSessions.filter(s => s.startHour >= 22 && s.duration >= 120).length;
  if (nocturnes >= 1) {
    unlockBadge("lecteur-nocturne");
  }

  // Critique Littéraire
  if (reviews.length >= 5) {
    unlockBadge("critique-litteraire");
  }

  // Marathon Lecture
  if (readingSessions.some(s => s.duration >= 300)) {
    unlockBadge("marathon-lecture");
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
    unlockBadge("globe-trotter");
  }

  // Polyglotte
  if (completedBooks.some(b => b.language && b.language !== preferredLanguage)) {
    unlockBadge("polyglotte");
  }

  // Mentor
  if (recommendations.length >= 3) {
    unlockBadge("mentor");
  }

  // Expert en Poésie
  const poesie = completedBooks.filter(b => b.categories.includes("poésie")).length;
  if (poesie >= 5) {
    unlockBadge("expert-poesie");
  }

  // Badges à débloquer plus tard (même logique mais seuils plus élevés)
  
  // Lecteur Assidu
  if (streak.current_streak >= 30) {
    unlockBadge("locked1");
  }

  // Explorateur Littéraire
  const categories = new Set(completedBooks.flatMap(b => b.categories));
  if (categories.size >= 5) {
    unlockBadge("locked2");
  }

  // Marathonien (10 livres en un mois)
  // Pour simplifier, nous vérifions juste si l'utilisateur a terminé 10 livres
  if (completedBooks.length >= 10) {
    unlockBadge("locked3");
  }

  // Expert en Classiques
  if (classics >= 10) {
    unlockBadge("locked4");
  }

  // Lecteur Nocturne (niveau avancé)
  const advancedNocturnes = readingSessions.filter(s => s.startHour >= 22 && s.duration >= 180).length;
  if (advancedNocturnes >= 1) {
    unlockBadge("locked5");
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
export const checkBadgesForUser = async (userId: string): Promise<void> => {
  if (!userId) return;
  
  try {
    // Dans un vrai système, ces données viendraient d'une API ou d'une base de données
    // Pour cet exemple, nous utilisons des données mockes ou stockées dans localStorage

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
    checkAndUnlockBadges({
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

// Exporter les fonctions mockées pour remplacer celles dans mock/badges.ts
export { mockBadges };
