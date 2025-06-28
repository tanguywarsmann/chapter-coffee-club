import React from 'react';

/**
 * TRACKER DE PERFORMANCE - READ APP v0.15
 * 
 * Surveille les re-rendus, temps de réponse API et métriques Core Web Vitals
 */

interface RenderMetrics {
  componentName: string;
  renderCount: number;
  lastRenderTime: number;
  averageRenderTime: number;
  propsChanged: string[];
}

interface APIMetrics {
  endpoint: string;
  callCount: number;
  averageResponseTime: number;
  errorCount: number;
}

class PerformanceTracker {
  private static instance: PerformanceTracker;
  private renderMetrics = new Map<string, RenderMetrics>();
  private apiMetrics = new Map<string, APIMetrics>();
  private enabled = process.env.NODE_ENV === 'development';

  static getInstance(): PerformanceTracker {
    if (!PerformanceTracker.instance) {
      PerformanceTracker.instance = new PerformanceTracker();
    }
    return PerformanceTracker.instance;
  }

  trackComponentRender(
    componentName: string, 
    renderStartTime: number,
    propsChanged: string[] = []
  ) {
    if (!this.enabled) return;

    const renderTime = performance.now() - renderStartTime;
    const existing = this.renderMetrics.get(componentName);

    if (existing) {
      existing.renderCount++;
      existing.lastRenderTime = Date.now();
      existing.averageRenderTime = (existing.averageRenderTime + renderTime) / 2;
      existing.propsChanged = propsChanged;
    } else {
      this.renderMetrics.set(componentName, {
        componentName,
        renderCount: 1,
        lastRenderTime: Date.now(),
        averageRenderTime: renderTime,
        propsChanged
      });
    }

    // Alerter si trop de re-rendus
    const metrics = this.renderMetrics.get(componentName)!;
    if (metrics.renderCount > 10) {
      console.warn(
        `🚨 PERFORMANCE: ${componentName} a rendu ${metrics.renderCount} fois`,
        { propsChanged, averageRenderTime: metrics.averageRenderTime.toFixed(2) + 'ms' }
      );
    }
  }

  trackAPICall(endpoint: string, responseTime: number, isError: boolean = false) {
    if (!this.enabled) return;

    const existing = this.apiMetrics.get(endpoint);

    if (existing) {
      existing.callCount++;
      existing.averageResponseTime = (existing.averageResponseTime + responseTime) / 2;
      if (isError) existing.errorCount++;
    } else {
      this.apiMetrics.set(endpoint, {
        endpoint,
        callCount: 1,
        averageResponseTime: responseTime,
        errorCount: isError ? 1 : 0
      });
    }
  }

  getPerformanceReport(): string {
    let report = "📊 RAPPORT DE PERFORMANCE v0.15\n\n";
    
    report += "🔄 COMPOSANTS (Re-rendus):\n";
    this.renderMetrics.forEach((metrics) => {
      report += `  ${metrics.componentName}: ${metrics.renderCount} rendus (${metrics.averageRenderTime.toFixed(1)}ms moy.)\n`;
    });

    report += "\n🌐 API (Réponses):\n";
    this.apiMetrics.forEach((metrics) => {
      const errorRate = ((metrics.errorCount / metrics.callCount) * 100).toFixed(1);
      report += `  ${metrics.endpoint}: ${metrics.callCount} calls (${metrics.averageResponseTime.toFixed(0)}ms moy., ${errorRate}% erreurs)\n`;
    });

    return report;
  }

  logReport() {
    if (this.enabled) {
      console.log(this.getPerformanceReport());
    }
  }

  reset() {
    this.renderMetrics.clear();
    this.apiMetrics.clear();
  }
}

export const performanceTracker = PerformanceTracker.getInstance();

// Hook pour tracker les re-rendus des composants
export const useRenderTracker = (componentName: string, props?: Record<string, any>) => {
  const startTime = performance.now();
  const previousProps = React.useRef(props);
  
  React.useEffect(() => {
    const propsChanged: string[] = [];
    
    if (props && previousProps.current) {
      Object.keys(props).forEach(key => {
        if (props[key] !== previousProps.current![key]) {
          propsChanged.push(key);
        }
      });
    }
    
    performanceTracker.trackComponentRender(componentName, startTime, propsChanged);
    previousProps.current = props;
  });
};
