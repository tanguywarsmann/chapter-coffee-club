/**
 * COMPOSANT DE FALLBACK POUR ERREURS DE CHARGEMENT
 * 
 * Affiche un message d'erreur clair avec bouton "Réessayer"
 * au lieu de laisser une zone vide qui fait croire que l'app est cassée.
 */

import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface ErrorFallbackProps {
  error?: string | Error;
  message?: string;
  onRetry?: () => void;
  variant?: "default" | "compact" | "inline";
}

export function ErrorFallback({
  error,
  message,
  onRetry,
  variant = "default",
}: ErrorFallbackProps) {
  const errorMessage =
    message ||
    (error instanceof Error ? error.message : error) ||
    "Une erreur est survenue lors du chargement.";

  if (variant === "inline") {
    return (
      <div className="flex items-center gap-2 text-sm text-destructive p-2 rounded bg-destructive/10">
        <AlertCircle className="h-4 w-4 flex-shrink-0" />
        <span className="flex-1">{errorMessage}</span>
        {onRetry && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRetry}
            className="h-7 px-2"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Réessayer
          </Button>
        )}
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <Card className="border-destructive/20">
        <CardContent className="flex items-center gap-3 p-4">
          <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-foreground">{errorMessage}</p>
          </div>
          {onRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="flex-shrink-0"
            >
              <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
              Réessayer
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  // variant === "default"
  return (
    <Card className="border-destructive/20">
      <CardContent className="flex flex-col items-center justify-center gap-4 p-8 text-center">
        <div className="rounded-full bg-destructive/10 p-3">
          <AlertCircle className="h-8 w-8 text-destructive" />
        </div>
        <div className="space-y-2">
          <h3 className="font-semibold text-foreground">
            Impossible de charger les données
          </h3>
          <p className="text-sm text-muted-foreground max-w-md">
            {errorMessage}
          </p>
        </div>
        {onRetry && (
          <Button onClick={onRetry} variant="default" className="mt-2">
            <RefreshCw className="h-4 w-4 mr-2" />
            Réessayer
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
