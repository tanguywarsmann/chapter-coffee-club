/**
 * GESTIONNAIRE D'ERREURS SUPABASE CENTRALISÉ
 * 
 * Objectif: Détecter et gérer proprement les erreurs Supabase pour éviter :
 * - Les erreurs silencieuses qui laissent l'app dans un état invalide
 * - Les sessions expirées non détectées
 * - Les erreurs réseau non propagées
 */

import { PostgrestError } from "@supabase/supabase-js";

export interface SupabaseErrorInfo {
  context: string;
  type: "auth" | "network" | "postgres" | "unknown";
  isAuthExpired: boolean;
  shouldRetry: boolean;
  userMessage: string;
  originalError: any;
}

/**
 * Détecte si une erreur Supabase correspond à un token JWT expiré ou invalide
 */
function isAuthExpiredError(error: any): boolean {
  if (!error) return false;

  const errorMessage = error.message?.toLowerCase() || "";
  const errorCode = error.code?.toLowerCase() || "";

  // Patterns courants pour JWT expiré
  return (
    errorMessage.includes("jwt expired") ||
    errorMessage.includes("invalid token") ||
    errorMessage.includes("invalid jwt") ||
    errorMessage.includes("jwt malformed") ||
    errorCode === "pgrst301" || // JWT expired (PostgREST)
    errorCode === "invalid_grant" ||
    error.status === 401
  );
}

/**
 * Détecte si l'erreur est réseau (timeout, connexion perdue, etc.)
 */
function isNetworkError(error: any): boolean {
  if (!error) return false;

  const errorMessage = error.message?.toLowerCase() || "";

  return (
    errorMessage.includes("network") ||
    errorMessage.includes("timeout") ||
    errorMessage.includes("fetch failed") ||
    errorMessage.includes("econnrefused") ||
    errorMessage.includes("failed to fetch") ||
    error.name === "TypeError" && errorMessage.includes("fetch")
  );
}

/**
 * Détecte si c'est une erreur Postgres (contraintes, RLS, etc.)
 */
function isPostgresError(error: any): boolean {
  return error && (error.code?.startsWith("23") || error.code?.startsWith("42"));
}

/**
 * Détermine si l'opération devrait être retentée
 */
function shouldRetry(errorType: string, isAuthExpired: boolean): boolean {
  // Ne jamais retry si auth expirée (il faut re-login)
  if (isAuthExpired) return false;

  // Retry pour erreurs réseau
  if (errorType === "network") return true;

  // Pas de retry pour erreurs Postgres (contraintes, etc.)
  if (errorType === "postgres") return false;

  // Par défaut, pas de retry
  return false;
}

/**
 * Génère un message utilisateur clair selon le type d'erreur
 */
function getUserMessage(errorType: string, isAuthExpired: boolean): string {
  if (isAuthExpired) {
    return "Votre session a expiré. Veuillez vous reconnecter.";
  }

  switch (errorType) {
    case "network":
      return "Problème de connexion réseau. Vérifiez votre connexion.";
    case "postgres":
      return "Erreur lors de l'opération. Veuillez réessayer.";
    case "auth":
      return "Erreur d'authentification. Veuillez vous reconnecter.";
    default:
      return "Une erreur inattendue est survenue.";
  }
}

/**
 * FONCTION PRINCIPALE: Gère une erreur Supabase et retourne des infos structurées
 * 
 * @param context - Contexte de l'erreur (ex: "useBookDetailProgress", "getCompanion")
 * @param error - L'erreur Supabase brute
 * @returns SupabaseErrorInfo - Informations structurées sur l'erreur
 * 
 * Usage:
 * ```ts
 * try {
 *   const { data, error } = await supabase.from('books').select();
 *   if (error) {
 *     const errorInfo = handleSupabaseError('loadBooks', error);
 *     if (errorInfo.isAuthExpired) {
 *       // Rediriger vers login
 *     }
 *     if (errorInfo.shouldRetry) {
 *       // Retry l'opération
 *     }
 *     toast.error(errorInfo.userMessage);
 *   }
 * } catch (err) {
 *   const errorInfo = handleSupabaseError('loadBooks', err);
 *   // ...
 * }
 * ```
 */
export function handleSupabaseError(context: string, error: any): SupabaseErrorInfo {
  // Log structuré pour debug
  console.error(`[Supabase][${context}]`, {
    message: error?.message,
    code: error?.code,
    status: error?.status,
    details: error?.details,
    hint: error?.hint,
  });

  // Détection du type d'erreur
  const isAuthExpired = isAuthExpiredError(error);
  const isNetwork = isNetworkError(error);
  const isPostgres = isPostgresError(error);

  let errorType: "auth" | "network" | "postgres" | "unknown";

  if (isAuthExpired) {
    errorType = "auth";
  } else if (isNetwork) {
    errorType = "network";
  } else if (isPostgres) {
    errorType = "postgres";
  } else {
    errorType = "unknown";
  }

  const shouldRetryOp = shouldRetry(errorType, isAuthExpired);
  const userMessage = getUserMessage(errorType, isAuthExpired);

  return {
    context,
    type: errorType,
    isAuthExpired,
    shouldRetry: shouldRetryOp,
    userMessage,
    originalError: error,
  };
}

/**
 * Wrapper pour appels Supabase avec gestion d'erreur automatique
 * 
 * Usage:
 * ```ts
 * const data = await withSupabaseErrorHandling(
 *   'loadBooks',
 *   async () => {
 *     const { data, error } = await supabase.from('books').select();
 *     if (error) throw error;
 *     return data;
 *   }
 * );
 * ```
 */
export async function withSupabaseErrorHandling<T>(
  context: string,
  operation: () => Promise<T>
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    const errorInfo = handleSupabaseError(context, error);
    
    // Re-throw avec errorInfo attaché pour que le caller puisse gérer
    const enrichedError = new Error(errorInfo.userMessage);
    (enrichedError as any).supabaseErrorInfo = errorInfo;
    throw enrichedError;
  }
}
