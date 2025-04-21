
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
 * Récupère l’objectif courant de l’utilisateur.
 * Exemple : "Lire 2 livres par mois"
 */
export async function getUserGoal(userId: string): Promise<string> {
  const { data, error } = await supabase
    .from("user_goals")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return "Lire 2 livres par mois";
  if (data.type === "books") return `Lire ${data.target} livre${data.target > 1 ? "s" : ""} par mois`;
  return `Lire ${data.target} pages par mois`;
}

/**
 * Met à jour l’objectif de lecture de l’utilisateur (et crée la ligne si besoin).
 */
export async function setUserGoal(userId: string, goal: string): Promise<void> {
  // Simple détection du type : "livres" ou "pages" & extraction du nombre
  let type: "books" | "pages" = goal.includes("page") ? "pages" : "books";
  const numberMatch = goal.match(/\d+/);
  const target = numberMatch ? parseInt(numberMatch[0], 10) : 2;

  // Upsert (insert or update)
  await supabase
    .from("user_goals")
    .upsert([
      {
        user_id: userId,
        goal,
        type,
        target,
        period: "month",
        updated_at: new Date().toISOString(),
      }
    ], { onConflict: "user_id" });
}

/**
 * Calcule la progression mensuelle de l’objectif (en %) pour l’utilisateur.
 * Si l’objectif est "livres", compare les livres finis ce mois. Si "pages", compare les pages lues ce mois.
 */
export async function getGoalProgress(userId: string): Promise<number> {
  const { data: goalData } = await supabase
    .from("user_goals")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!goalData) return 0;
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
    // Pages validées ce mois-ci : compter les validations dans reading_validations pour l'utilisateur,
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
}

/**
 * Retourne le type d’objectif courant ("books" ou "pages").
 */
export async function getGoalType(userId: string): Promise<"pages" | "books"> {
  const { data } = await supabase
    .from("user_goals")
    .select("type")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (data && data.type === "pages") ? "pages" : "books";
}

/**
 * (Optionnel) Calcule un objectif recommandé (suggéré) selon les stats récentes.
 * Ex : moyenne des livres lus par mois sur les 3 derniers mois, arrondi à l'entier supérieur.
 */
export async function getRecommendedGoal(userId: string): Promise<string> {
  // On regarde les livres terminés sur les 90 derniers jours
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - 2, 1).toISOString();

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
}
