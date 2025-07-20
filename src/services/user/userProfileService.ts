
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Database } from "@/integrations/supabase/types";

type ProfileRecord = Database['public']['Tables']['profiles']['Row'];

/**
 * Récupère le profil utilisateur par ID
 * @param userId L'ID de l'utilisateur
 * @returns Le profil de l'utilisateur ou null
 */
export async function getUserProfile(userId: string): Promise<ProfileRecord | null> {
  if (!userId) {
    console.error("ID utilisateur non fourni");
    return null;
  }
  
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    
    if (error) {
      console.error("Error fetching user profile:", error);
      toast({
        title: "Erreur : Impossible de charger les informations du profil",
        variant: "destructive",
      });
      return null;
    }
    
    return data;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    toast({
      title: "Erreur inattendue lors du chargement du profil",
      variant: "destructive",
    });
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
 * Génère les initiales pour l'avatar à partir du nom d'affichage
 * @param displayName Nom d'affichage de l'utilisateur
 * @returns Une ou deux initiales en majuscules
 */
export function getUserInitials(displayName: string): string {
  if (!displayName) return "U";
  
  const words = displayName.trim().split(/\s+/);
  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase();
  } else {
    return (words[0].charAt(0) + words[1].charAt(0)).toUpperCase();
  }
}

/**
 * Crée ou met à jour le profil utilisateur avec l'email actuel
 * @param userId ID de l'utilisateur
 * @param email Email de l'utilisateur
 */
export async function syncUserProfile(userId: string, email: string | undefined): Promise<boolean> {
  if (!userId) {
    console.error("ID utilisateur non fourni");
    return false;
  }

  try {
    // Vérifier si un profil existe déjà
    const { data: existingProfile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .maybeSingle();
      
    if (profileError) {
      console.error("Error checking existing profile:", profileError);
      toast({
        title: "Erreur de synchronisation : Impossible de vérifier le profil existant",
        variant: "destructive",
      });
      return false;
    }
      
    if (existingProfile) {
      // Mise à jour de l'email si le profil existe déjà
      if (email) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ email })
          .eq('id', userId);
          
        if (updateError) {
          console.error("Error updating profile:", updateError);
          toast({
            title: "Erreur de mise à jour : Impossible de mettre à jour l'email du profil",
            variant: "destructive",
          });
          return false;
        }
      }
    } else {
      // Création d'un nouveau profil si aucun n'existe
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          email,
          username: null,
          is_admin: false
        });
        
      if (insertError) {
        console.error("Error creating profile:", insertError);
        toast({
          title: "Erreur de création : Impossible de créer le profil utilisateur",
          variant: "destructive",
        });
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error("Error syncing user profile:", error);
    toast({
      title: "Erreur inattendue lors de la synchronisation du profil",
      variant: "destructive",
    });
    return false;
  }
}
