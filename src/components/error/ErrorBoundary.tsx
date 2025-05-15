
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCcw, AlertTriangle } from "lucide-react";

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Mettre à jour l'état pour que le prochain rendu affiche l'UI de secours
    console.error("ErrorBoundary a capturé une erreur:", error.message);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Vous pouvez aussi enregistrer l'erreur dans un service de rapport
    console.error("Détails de l'erreur capturée:", error);
    console.error("Où l'erreur s'est produite:", errorInfo.componentStack);
    this.setState({ errorInfo });
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    // Tentative de redémarrage de l'application
    window.location.href = '/home';
  };

  render(): React.ReactNode {
    if (this.state.hasError) {
      // Vous pouvez rendre n'importe quelle UI de secours
      return (
        <div className="min-h-screen bg-logo-background flex items-center justify-center p-4">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-coffee-darker">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                Oups ! Une erreur est survenue
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                L'application a rencontré un problème inattendu.
              </p>
              
              {this.state.error && (
                <div className="bg-muted p-2 rounded-md text-sm overflow-auto max-h-40">
                  <p className="font-medium text-coffee-dark">Erreur: {this.state.error.message}</p>
                </div>
              )}
              
              {this.state.errorInfo && (
                <div className="bg-muted p-2 rounded-md text-xs overflow-auto max-h-40">
                  <p className="font-medium text-coffee-dark mb-1">Stack Trace:</p>
                  <pre className="whitespace-pre-wrap break-words text-muted-foreground">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </div>
              )}
              
              <div className="flex justify-end">
                <Button 
                  onClick={this.handleReset} 
                  className="bg-coffee-dark hover:bg-coffee-darker flex items-center gap-2"
                >
                  <RefreshCcw className="h-4 w-4" />
                  Réessayer
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
