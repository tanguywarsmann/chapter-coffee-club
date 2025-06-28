
/**
 * Hook pour mesurer les Core Web Vitals et métriques de performance
 * READ APP v0.15
 */

import { useEffect, useState } from 'react';
import { useLogger } from '@/utils/logger';

interface PerformanceMetrics {
  lcp: number | null; // Largest Contentful Paint
  fid: number | null; // First Input Delay
  cls: number | null; // Cumulative Layout Shift
  fcp: number | null; // First Contentful Paint
  ttfb: number | null; // Time to First Byte
}

export const usePerformanceMetrics = () => {
  const logger = useLogger('PerformanceMetrics');
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    lcp: null,
    fid: null,
    cls: null,
    fcp: null,
    ttfb: null
  });

  useEffect(() => {
    // Mesurer les Core Web Vitals
    const measureWebVitals = () => {
      // LCP - Largest Contentful Paint
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as PerformanceEntry & { renderTime: number, loadTime: number };
        const value = lastEntry.renderTime || lastEntry.loadTime;
        
        setMetrics(prev => ({ ...prev, lcp: value }));
        logger.debug('LCP measured', { value: value.toFixed(2) + 'ms' });
      }).observe({ entryTypes: ['largest-contentful-paint'] });

      // FCP - First Contentful Paint
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const entry = entries[0];
        
        setMetrics(prev => ({ ...prev, fcp: entry.startTime }));
        logger.debug('FCP measured', { value: entry.startTime.toFixed(2) + 'ms' });
      }).observe({ entryTypes: ['paint'] });

      // CLS - Cumulative Layout Shift
      let clsValue = 0;
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const layoutShiftEntry = entry as PerformanceEntry & { value: number, hadRecentInput: boolean };
          if (!layoutShiftEntry.hadRecentInput) {
            clsValue += layoutShiftEntry.value;
          }
        }
        
        setMetrics(prev => ({ ...prev, cls: clsValue }));
        logger.debug('CLS measured', { value: clsValue.toFixed(4) });
      }).observe({ entryTypes: ['layout-shift'] });

      // TTFB - Time to First Byte
      const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigationEntry) {
        const ttfb = navigationEntry.responseStart - navigationEntry.requestStart;
        setMetrics(prev => ({ ...prev, ttfb }));
        logger.debug('TTFB measured', { value: ttfb.toFixed(2) + 'ms' });
      }
    };

    // Délai pour laisser la page se charger
    const timer = setTimeout(measureWebVitals, 1000);
    
    return () => clearTimeout(timer);
  }, [logger]);

  // Fonction pour évaluer les métriques
  const evaluateMetrics = () => {
    const scores = {
      lcp: metrics.lcp ? (metrics.lcp <= 2500 ? 'good' : metrics.lcp <= 4000 ? 'needs-improvement' : 'poor') : 'unknown',
      fcp: metrics.fcp ? (metrics.fcp <= 1800 ? 'good' : metrics.fcp <= 3000 ? 'needs-improvement' : 'poor') : 'unknown',
      cls: metrics.cls !== null ? (metrics.cls <= 0.1 ? 'good' : metrics.cls <= 0.25 ? 'needs-improvement' : 'poor') : 'unknown',
      ttfb: metrics.ttfb ? (metrics.ttfb <= 800 ? 'good' : metrics.ttfb <= 1800 ? 'needs-improvement' : 'poor') : 'unknown'
    };

    return scores;
  };

  return {
    metrics,
    scores: evaluateMetrics(),
    isReady: Object.values(metrics).some(value => value !== null)
  };
};
