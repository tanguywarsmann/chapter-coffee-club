
import { supabase } from "@/integrations/supabase/client";

/**
 * Définit le format d'un objectif utilisateur.
 */
export interface UserGoal {
  user_id: string;
  goal: string;
  type: "books" | "pages";
  target: number; // Nombre de livres ou pages visé pour la période (par défaut mensuelle)
  period: "month";
  updated_at?: string;
}

/**
 * Récupère l'objectif courant de l'utilisateur.
 * Exemple : "Lire 2 livres par mois"
 */
export async function getUserGoal(userId: string): Promise<string> {
  try {
    // Essaie de récupérer depuis localStorage d'abord
    const storedGoal = localStorage.getItem(`goal_${userId}`);
    if (storedGoal) {
      const parsedGoal = JSON.parse(storedGoal);
      return parsedGoal.goal;
    }
    
    // Valeur par défaut
    return "Lire 2 livres par mois";
  } catch (error) {
    console.error("Error fetching user goal:", error);
    return "Lire 2 livres par mois";
  }
}

/**
 * Met à jour l'objectif de lecture de l'utilisateur (et crée la ligne si besoin).
 */
export async function setUserGoal(userId: string, goal: string): Promise<void> {
  // Simple détection du type : "livres" ou "pages" & extraction du nombre
  let type: "books" | "pages" = goal.includes("page") ? "pages" : "books";
  const numberMatch = goal.match(/\d+/);
  const target = numberMatch ? parseInt(numberMatch[0], 10) : 2;

  // Stocke dans localStorage
  const userGoal: UserGoal = {
    user_id: userId,
    goal,
    type,
    target,
    period: "month",
    updated_at: new Date().toISOString(),
  };
  
  localStorage.setItem(`goal_${userId}`, JSON.stringify(userGoal));
}

/**
 * Calcule la progression mensuelle de l'objectif (en %) pour l'utilisateur.
 * Si l'objectif est "livres", compare les livres finis ce mois. Si "pages", compare les pages lues ce mois.
 */
export async function getGoalProgress(userId: string): Promise<number> {
  try {
    // Récupère l'objectif stocké localement
    const storedGoal = localStorage.getItem(`goal_${userId}`);
    if (!storedGoal) return 0;

    const goalData: UserGoal = JSON.parse(storedGoal);
    const { type, target } = goalData;

    // Calcul de la période courante (mois)
    const now = new Date();
    const startMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

    let progress = 0;
    if (type === "books") {
      // Comptage des livres terminés ce mois-ci
      const { data, error } = await supabase
        .from("reading_progress")
        .select("id, current_page, total_pages, updated_at")
        .eq("user_id", userId)
        .gte("updated_at", startMonth);
      
      if (data && data.length > 0) {
        progress = data.filter(item => item.current_page >= item.total_pages).length;
      }
    } else {
      // Pages validées ce mois-ci : compter les validations dans reading_validations pour l'utilisateur,
      // filtrées sur la période, chaque segment = 30 pages
      const { data, error } = await supabase
        .from("reading_validations")
        .select("id, validated_at")
        .eq("user_id", userId)
        .gte("validated_at", startMonth);

      if (data && data.length > 0) {
        progress = data.length * 30;
      }
    }

    // Calcul du pourcentage
    return Math.min(100, Math.round((progress / target) * 100));
  } catch (error) {
    console.error("Error calculating goal progress:", error);
    return 0;
  }
}

/**
 * Retourne le type d'objectif courant ("books" ou "pages").
 */
export async function getGoalType(userId: string): Promise<"pages" | "books"> {
  try {
    const storedGoal = localStorage.getItem(`goal_${userId}`);
    const goalData = storedGoal ? JSON.parse(storedGoal) as UserGoal : null;
    return (goalData && goalData.type === "pages") ? "pages" : "books";
  } catch (error) {
    console.error("Error fetching goal type:", error);
    return "books";
  }
}

/**
 * (Optionnel) Calcule un objectif recommandé (suggéré) selon les stats récentes.
 * Ex : moyenne des livres lus par mois sur les 3 derniers mois, arrondi à l'entier supérieur.
 */
export async function getRecommendedGoal(userId: string): Promise<string> {
  // On regarde les livres terminés sur les 90 derniers jours
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - 2, 1).toISOString();

  try {
    const { data, error } = await supabase
      .from("reading_progress")
      .select("id, current_page, total_pages, updated_at")
      .eq("user_id", userId)
      .gte("updated_at", start);

    let books = 0;
    if (data && data.length > 0) {
      books = data.filter(item => item.current_page >= item.total_pages).length;
    }
    // Trois mois => moyenne mensuelle
    const rec = Math.max(1, Math.ceil(books / 3));
    return `Lire ${rec} livre${rec > 1 ? "s" : ""} par mois`;
  } catch (error) {
    console.error("Error calculating recommended goal:", error);
    return "Lire 1 livre par mois";
  }
}
