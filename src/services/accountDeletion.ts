import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";

export async function requestAccountDeletion() {
  logger.info("🗑️ Starting account deletion request");

  const { data: { session }, error: sessionError } = await supabase.auth.getSession();

  if (sessionError || !session?.access_token) {
    logger.error("No valid session found:", sessionError);
    throw new Error('Aucune session valide trouvée. Veuillez vous reconnecter.');
  }

  logger.info("Session found, calling delete-account edge function");

  const { data, error } = await supabase.functions.invoke('delete-account', {
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      'Content-Type': 'application/json'
    }
  });

  if (error) {
    logger.error("Edge function error:", error);

    // Provide more specific error messages
    if (error.message?.includes('FunctionsRelayError')) {
      throw new Error('Service temporairement indisponible. Réessayez dans quelques instants.');
    } else if (error.message?.includes('Unauthorized')) {
      throw new Error('Session expirée. Reconnectez-vous pour confirmer la suppression.');
    } else if (error.message?.includes('404')) {
      throw new Error('Fonction de suppression non disponible. Contactez le support.');
    }

    throw new Error(`Erreur lors de la suppression: ${error.message || 'Erreur inconnue'}`);
  }

  logger.info("Edge function response:", data);

  if (!data || (data && !data.success)) {
    logger.error("Edge function returned unsuccessful response:", data);
    throw new Error('La suppression a échoué. Veuillez réessayer.');
  }

  logger.info("✅ Account deletion successful");
  return data;
}