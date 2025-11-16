/**
 * Hook réutilisable pour la gestion d'erreurs dans les listes de livres
 * Évite la duplication de code de gestion d'erreur
 */

import { useState, useCallback } from "react";
import { handleSupabaseError } from "@/services/supabaseErrorHandler";
import { toast } from "sonner";

export function useBookListErrorHandling() {
  const [error, setError] = useState<string | null>(null);

  const handleError = useCallback((context: string, err: any) => {
    const errorInfo = handleSupabaseError(context, err);
    setError(errorInfo.userMessage);

    // Si auth expirée, pas de toast (géré par AuthContext)
    if (!errorInfo.isAuthExpired) {
      toast.error(errorInfo.userMessage);
    }

    return errorInfo;
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    error,
    handleError,
    clearError,
  };
}
