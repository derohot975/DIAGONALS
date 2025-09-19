// BEGIN DIAGONALE APP SHELL - Performance Telemetry
/**
 * Performance Telemetry per DIAGONALE
 * Solo log in console, nessun tracking PII o invio dati esterni
 * REVERSIBILE: Rimuovere questo file per disabilitare telemetria
 */

interface PerformanceMetrics {
  appStart: number;
  firstPaintAppShell?: number;
  firstDataReceived?: number;
  ready?: number;
  serviceWorkerReady?: number;
}

class PerformanceTelemetry {
  private metrics: PerformanceMetrics;
  private startTime: number;

  constructor() {
    this.startTime = performance.now();
    this.metrics = {
      appStart: this.startTime
    };
    
    console.log('📊 Performance: Telemetria avviata');
  }

  /**
   * Marca il momento in cui l'App Shell è visibile
   */
  markAppShellReady(): void {
    this.metrics.firstPaintAppShell = performance.now();
    const elapsed = this.metrics.firstPaintAppShell - this.startTime;
    console.log(`🎨 Performance: App Shell visibile in ${elapsed.toFixed(2)}ms`);
  }

  /**
   * Marca il momento in cui i primi dati API sono arrivati
   */
  markFirstDataReceived(): void {
    this.metrics.firstDataReceived = performance.now();
    const elapsed = this.metrics.firstDataReceived - this.startTime;
    console.log(`📡 Performance: Primi dati ricevuti in ${elapsed.toFixed(2)}ms`);
  }

  /**
   * Marca il momento in cui l'app è completamente pronta
   */
  markAppReady(): void {
    this.metrics.ready = performance.now();
    const elapsed = this.metrics.ready - this.startTime;
    console.log(`✅ Performance: App pronta in ${elapsed.toFixed(2)}ms`);
    
    // Log riassuntivo
    this.logSummary();
  }

  /**
   * Marca il momento in cui il Service Worker è pronto
   */
  markServiceWorkerReady(): void {
    this.metrics.serviceWorkerReady = performance.now();
    const elapsed = this.metrics.serviceWorkerReady - this.startTime;
    console.log(`⚙️ Performance: Service Worker pronto in ${elapsed.toFixed(2)}ms`);
  }

  /**
   * Log delle metriche Web Vitals se disponibili
   */
  logWebVitals(): void {
    if ('PerformanceObserver' in window) {
      // First Contentful Paint
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            console.log(`🎯 Performance: FCP = ${entry.startTime.toFixed(2)}ms`);
          }
        }
      }).observe({ entryTypes: ['paint'] });

      // Largest Contentful Paint
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        console.log(`🎯 Performance: LCP = ${lastEntry.startTime.toFixed(2)}ms`);
      }).observe({ entryTypes: ['largest-contentful-paint'] });
    }
  }

  /**
   * Log riassuntivo delle performance
   */
  private logSummary(): void {
    console.group('📊 Performance Summary');
    console.log(`App Start: 0ms (baseline)`);
    
    if (this.metrics.firstPaintAppShell) {
      console.log(`App Shell: ${(this.metrics.firstPaintAppShell - this.startTime).toFixed(2)}ms`);
    }
    
    if (this.metrics.firstDataReceived) {
      console.log(`First Data: ${(this.metrics.firstDataReceived - this.startTime).toFixed(2)}ms`);
    }
    
    if (this.metrics.serviceWorkerReady) {
      console.log(`Service Worker: ${(this.metrics.serviceWorkerReady - this.startTime).toFixed(2)}ms`);
    }
    
    if (this.metrics.ready) {
      console.log(`App Ready: ${(this.metrics.ready - this.startTime).toFixed(2)}ms`);
    }
    
    console.groupEnd();
  }

  /**
   * Ottieni le metriche correnti (per debug)
   */
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }
}

// Istanza globale
export const performanceTelemetry = new PerformanceTelemetry();

// BEGIN DIAGONALE APP SHELL - Deferred Web Vitals logging
// Auto-start Web Vitals logging DOPO il first paint per non interferire con intro
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    // Defer Web Vitals logging per non interferire con intro
    const scheduleWebVitals = () => {
      if ('requestIdleCallback' in window) {
        requestIdleCallback(() => performanceTelemetry.logWebVitals(), { timeout: 3000 });
      } else {
        setTimeout(() => performanceTelemetry.logWebVitals(), 200);
      }
    };
    
    scheduleWebVitals();
  });
}
// END DIAGONALE APP SHELL
// END DIAGONALE APP SHELL - Performance Telemetry
