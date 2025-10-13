import { supabase } from "@/integrations/supabase/client";

/**
 * Service de récupération de mot de passe
 */

/**
 * Envoie un email de réinitialisation de mot de passe
 * @param email - Email de l'utilisateur
 * @throws Error si l'envoi échoue
 */
export async function requestPasswordReset(email: string): Promise<void> {
  const origin = import.meta.env.VITE_SITE_URL || window.location.origin;
  const redirectTo = `${origin.replace(/\/$/, "")}/reset-password`;
  
  const { error } = await supabase.auth.resetPasswordForEmail(email, { 
    redirectTo 
  });
  
  if (error) {
    throw error;
  }
}

/**
 * Met à jour le mot de passe de l'utilisateur
 * @param newPassword - Nouveau mot de passe
 * @throws Error si la mise à jour échoue
 */
export async function updatePassword(newPassword: string): Promise<void> {
  const { error } = await supabase.auth.updateUser({
    password: newPassword
  });
  
  if (error) {
    throw error;
  }
}

/**
 * Vérifie si une session de récupération est active
 * @returns true si l'utilisateur est dans un flux de récupération
 */
export async function isPasswordRecoverySession(): Promise<boolean> {
  const { data: { session } } = await supabase.auth.getSession();
  return !!session;
}
