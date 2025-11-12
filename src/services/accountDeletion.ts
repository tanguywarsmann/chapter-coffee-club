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

  // Log EVERYTHING for debugging
  logger.info("Raw Edge Function response:", {
    data: response.data,
    error: response.error,
    dataType: typeof response.data,
    errorType: typeof response.error,
  });

  // Log response.data in detail if it exists
  if (response.data) {
    logger.info("Response data details:", JSON.stringify(response.data, null, 2));
  }

  if (response.error) {
    logger.error("Edge function error details:", {
      message: response.error.message,
      context: response.error.context,
      name: response.error.name,
      fullError: JSON.stringify(response.error, null, 2),
    });

    // Extract detailed error from response.data if available
    const errorData = response.data as any;
    const detailedError =
      errorData?.details ||
      errorData?.error ||
      errorData?.message ||
      (typeof errorData === 'string' ? errorData : null);

    logger.error("Extracted error details:", {
      detailedError,
      errorDataKeys: errorData ? Object.keys(errorData) : null,
    });

    // Provide more specific error messages
    if (response.error.message?.includes('FunctionsRelayError')) {
      throw new Error('Service temporairement indisponible. Réessayez dans quelques instants.');
    } else if (response.error.message?.includes('Unauthorized') || response.error.message?.includes('401')) {
      throw new Error('Session expirée. Reconnectez-vous pour confirmer la suppression.');
    } else if (response.error.message?.includes('404') || response.error.message?.includes('not found')) {
      throw new Error('Fonction de suppression non disponible. Contactez le support.');
    } else if (response.error.message?.includes('non-2xx status code')) {
      // Edge function returned an error - show the ACTUAL error details
      if (detailedError) {
        logger.error("Actual server error:", detailedError);
        throw new Error(`Erreur serveur: ${detailedError}`);
      } else {
        // Show full response.data if we couldn't extract error
        const dataStr = JSON.stringify(response.data);
        logger.error("Could not extract error, full data:", dataStr);
        throw new Error(`Erreur serveur (détails): ${dataStr}`);
      }
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
