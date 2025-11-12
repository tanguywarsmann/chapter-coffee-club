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

  const response = await supabase.functions.invoke('delete-account', {
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      'Content-Type': 'application/json'
    }
  });

  logger.info("Raw Edge Function response:", {
    data: response.data,
    error: response.error,
  });

  if (response.error) {
    logger.error("Edge function error details:", {
      message: response.error.message,
      context: response.error.context,
      name: response.error.name,
    });

    // Provide more specific error messages
    if (response.error.message?.includes('FunctionsRelayError')) {
      throw new Error('Service temporairement indisponible. Réessayez dans quelques instants.');
    } else if (response.error.message?.includes('Unauthorized') || response.error.message?.includes('401')) {
      throw new Error('Session expirée. Reconnectez-vous pour confirmer la suppression.');
    } else if (response.error.message?.includes('404') || response.error.message?.includes('not found')) {
      throw new Error('Fonction de suppression non disponible. Contactez le support.');
    } else if (response.error.message?.includes('non-2xx status code')) {
      // Edge function returned an error - get more details from data
      const errorData = response.data as any;
      const detailedError = errorData?.error || response.error.message;
      logger.error("Edge function returned error:", detailedError);
      throw new Error(`Erreur serveur: ${detailedError}`);
    }

    throw new Error(`Erreur lors de la suppression: ${response.error.message || 'Erreur inconnue'}`);
  }

  const { data, error } = response;

  logger.info("Edge function response data:", data);

  if (!data) {
    logger.error("Edge function returned no data");
    throw new Error('La suppression a échoué: Aucune réponse du serveur');
  }

  // Handle error responses from edge function
  if (typeof data === 'object' && 'success' in data && !data.success) {
    const errorDetails = (data as any).details || (data as any).error || 'Erreur inconnue';
    logger.error("Edge function returned unsuccessful response:", { data, errorDetails });
    throw new Error(`La suppression a échoué: ${errorDetails}`);
  }

  // Verify success flag
  if (typeof data === 'object' && !('success' in data)) {
    logger.warn("Edge function response missing success flag:", data);
  }

  logger.info("✅ Account deletion successful");
  return data;
}