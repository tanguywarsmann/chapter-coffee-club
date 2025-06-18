
/**
 * UTILITAIRES POUR GESTION D'ERREUR ROBUSTE
 * 
 * Centralise la gestion d'erreur pour éviter les crashes silencieux
 */

export interface ErrorInfo {
  componentStack: string;
  errorBoundary: string;
}

export class ErrorReporter {
  private static errors: Array<{
    error: Error;
    info: ErrorInfo;
    timestamp: number;
    component: string;
  }> = [];

  static reportError(error: Error, info: ErrorInfo, component: string) {
    const errorReport = {
      error,
      info,
      timestamp: Date.now(),
      component
    };
    
    this.errors.push(errorReport);
    
    // Log en développement
    if (process.env.NODE_ENV === 'development') {
      console.group(`🔴 ERREUR CAPTURÉE dans ${component}`);
      console.error('Error:', error);
      console.error('Stack:', info.componentStack);
      console.groupEnd();
    }
    
    // En production, on pourrait envoyer à un service de monitoring
    // comme Sentry, LogRocket, etc.
  }

  static getErrorHistory() {
    return this.errors;
  }

  static clearErrors() {
    this.errors = [];
  }
}

export const withErrorHandling = <T extends (...args: any[]) => any>(
  fn: T,
  componentName: string
): T => {
  return ((...args: any[]) => {
    try {
      return fn(...args);
    } catch (error) {
      ErrorReporter.reportError(
        error as Error,
        { componentStack: componentName, errorBoundary: componentName },
        componentName
      );
      throw error; // Re-throw pour que l'ErrorBoundary puisse capturer
    }
  }) as T;
};
