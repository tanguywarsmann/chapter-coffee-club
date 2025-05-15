
console.log("Import de ErrorBoundary.tsx OK");

import React from "react";
import { isInIframe, isPreview } from "@/utils/environment";

console.log("Chargement de ErrorBoundary.tsx", {
  isPreview: isPreview(),
  isInIframe: isInIframe(),
});

class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: Error | null, errorInfo: React.ErrorInfo | null}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null 
    };
  }
  
  static getDerivedStateFromError(error: Error) {
    console.error("ErrorBoundary - getDerivedStateFromError:", error);
    return { hasError: true };
  }
  
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary - Erreur capturée:", error);
    console.error("ErrorBoundary - Informations composant:", errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 border border-red-300 bg-red-50 rounded-md">
          <h1 className="text-xl text-red-700 font-bold mb-2">Une erreur est survenue</h1>
          {this.state.error && (
            <div className="mb-3">
              <p className="text-red-600 font-medium">Message: {this.state.error.toString()}</p>
            </div>
          )}
          {this.state.errorInfo && (
            <div className="mt-2">
              <p className="text-sm font-medium mb-1 text-red-800">Trace de l'erreur:</p>
              <pre className="text-xs overflow-auto bg-red-100 p-2 rounded border border-red-200 max-h-40">
                {this.state.errorInfo.componentStack}
              </pre>
            </div>
          )}
        </div>
      );
    }
    
    return this.props.children;
  }
}

export default ErrorBoundary;
