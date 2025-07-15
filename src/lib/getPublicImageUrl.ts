import { supabase } from "@/integrations/supabase/client";

/**
 * Retourne l'URL publique (non transformée) d'une image.
 * Utilise l'URL publique directe de Supabase sans transformation.
 */
export function getPublicImageUrl(src: string): string {
  // Si la colonne contient déjà une URL absolue, on la renvoie telle quelle
  if (src.startsWith('http')) {
    return src;
  }

  // Sinon on construit l'URL via le SDK Supabase
  const { data } = supabase.storage.from('blog-images').getPublicUrl(src);
  return data.publicUrl;
}