
import { supabase } from "@/integrations/supabase/client";

/**
 * Récupère le profil utilisateur par ID
 * @param userId L'ID de l'utilisateur
 * @returns Le profil de l'utilisateur ou null
 */
export async function getUserProfile(userId: string) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, is_admin, email')
      .eq('id', userId)
      .maybeSingle();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return null;
  }
}

/**
 * Formate un email pour l'afficher partiellement 
 * @param email Email complet
 * @returns Email formaté (ex: john.do...)
 */
export function formatEmail(email: string): string {
  if (!email) return "";
  
  const atIndex = email.indexOf('@');
  
  if (atIndex > 8) {
    // Pour les emails longs, on prend les 8 premiers caractères
    return `${email.substring(0, 8)}...`;
  } else if (atIndex > 0) {
    // Pour les emails courts, on prend tout jusqu'au @
    return `${email.substring(0, atIndex)}...`;
  }
  
  return email;
}

/**
 * Génère un nom d'affichage pour l'utilisateur
 * @param username Nom d'utilisateur s'il existe
 * @param email Email de l'utilisateur
 * @param id ID de l'utilisateur
 * @returns Nom à afficher
 */
export function getDisplayName(username: string | null | undefined, email: string | null | undefined, id: string): string {
  if (username) return username;
  if (email) return formatEmail(email);
  return `Lecteur ${id.substring(0, 4)}`;
}

/**
 * Crée ou met à jour le profil utilisateur avec l'email actuel
 * @param userId ID de l'utilisateur
 * @param email Email de l'utilisateur
 */
export async function syncUserProfile(userId: string, email: string | undefined) {
  try {
    // Vérifier si un profil existe déjà
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .maybeSingle();
      
    if (existingProfile) {
      // Mise à jour de l'email si le profil existe déjà
      if (email) {
        await supabase
          .from('profiles')
          .update({ email })
          .eq('id', userId);
      }
    } else {
      // Création d'un nouveau profil si aucun n'existe
      await supabase
        .from('profiles')
        .insert({
          id: userId,
          email,
          username: null,
          is_admin: false
        });
    }
    
    return true;
  } catch (error) {
    console.error("Error syncing user profile:", error);
    return false;
  }
}
