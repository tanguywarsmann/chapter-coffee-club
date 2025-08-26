
/**
 * AUDIT DE PERFORMANCE - VREAD APP
 * 
 * Ce fichier centralise les optimisations de performance identifiées
 * lors de l'audit de janvier 2025.
 * 
 * PROBLÈMES IDENTIFIÉS :
 * 1. Re-rendus excessifs dans MainContent et BookDetail
 * 2. Gestion d'état fragmentée entre hooks
 * 3. Calls API redondants 
 * 4. Manque de memoization sur les composants lourds
 * 5. Gestion d'erreur incohérente
 */

export interface PerformanceMetrics {
  renderCount: number;
  lastRenderTime: number;
  apiCallCount: number;
  errorCount: number;
}

export class PerformanceTracker {
  private static instance: PerformanceTracker;
  private metrics: Map<string, PerformanceMetrics> = new Map();

  static getInstance(): PerformanceTracker {
    if (!PerformanceTracker.instance) {
      PerformanceTracker.instance = new PerformanceTracker();
    }
    return PerformanceTracker.instance;
  }

  trackRender(componentName: string) {
    if (process.env.NODE_ENV !== 'development') return;
    
    const current = this.metrics.get(componentName) || {
      renderCount: 0,
      lastRenderTime: Date.now(),
      apiCallCount: 0,
      errorCount: 0
    };
    
    current.renderCount++;
    current.lastRenderTime = Date.now();
    this.metrics.set(componentName, current);
    
    // Alerter si trop de re-rendus
    if (current.renderCount > 10) {
      console.warn(`⚠️ PERFORMANCE: ${componentName} a rendu ${current.renderCount} fois`);
    }
  }

  trackApiCall(componentName: string) {
    if (process.env.NODE_ENV !== 'development') return;
    
    const current = this.metrics.get(componentName) || {
      renderCount: 0,
      lastRenderTime: Date.now(),
      apiCallCount: 0,
      errorCount: 0
    };
    
    current.apiCallCount++;
    this.metrics.set(componentName, current);
  }

  trackError(componentName: string, error: Error) {
    const current = this.metrics.get(componentName) || {
      renderCount: 0,
      lastRenderTime: Date.now(),
      apiCallCount: 0,
      errorCount: 0
    };
    
    current.errorCount++;
    this.metrics.set(componentName, current);
    
    console.error(`🔴 ERREUR dans ${componentName}:`, error);
  }

  getReport(): string {
    let report = "📊 RAPPORT DE PERFORMANCE\n\n";
    
    this.metrics.forEach((metrics, component) => {
      report += `${component}:\n`;
      report += `  - Rendus: ${metrics.renderCount}\n`;
      report += `  - API Calls: ${metrics.apiCallCount}\n`;
      report += `  - Erreurs: ${metrics.errorCount}\n\n`;
    });
    
    return report;
  }

  logReport() {
    if (process.env.NODE_ENV === 'development') {
      console.log(this.getReport());
    }
  }
}

// Hook pour tracker facilement les performances
export const usePerformanceTracker = (componentName: string) => {
  const tracker = PerformanceTracker.getInstance();
  
  const trackRender = () => tracker.trackRender(componentName);
  const trackApiCall = () => tracker.trackApiCall(componentName);
  const trackError = (error: Error) => tracker.trackError(componentName, error);
  
  return { trackRender, trackApiCall, trackError };
};
