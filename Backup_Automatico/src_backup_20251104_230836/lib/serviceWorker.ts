// BEGIN DIAGONALE APP SHELL - Service Worker Registration
/**
 * Service Worker Registration con feature flag e fail-safe
 * REVERSIBILE: Impostare VITE_ENABLE_SW=false per disattivare
 */

// Feature flag per Service Worker
const ENABLE_SW = import.meta.env.VITE_ENABLE_SW !== 'false'; // Default: true in prod, configurabile
const IS_PRODUCTION = import.meta.env.PROD;

/**
 * Registra il Service Worker se supportato e abilitato
 * Fail-safe: Se la registrazione fallisce, l'app continua normalmente
 */
export async function registerServiceWorker(): Promise<boolean> {
  // Skip in development se non esplicitamente abilitato
  if (!IS_PRODUCTION && import.meta.env.VITE_ENABLE_SW !== 'true') {
    console.log('🔧 Service Worker: Disabilitato in sviluppo');
    return false;
  }

  // Skip se feature flag disabilitato
  if (!ENABLE_SW) {
    console.log('🔧 Service Worker: Disabilitato via feature flag');
    return false;
  }

  // Skip se non supportato dal browser
  if (!('serviceWorker' in navigator)) {
    console.log('⚠️ Service Worker: Non supportato da questo browser');
    return false;
  }

  try {
    console.log('🚀 Service Worker: Avvio registrazione...');
    
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
      updateViaCache: 'imports' // Cache strategy per aggiornamenti
    });

    // Log stato registrazione
    if (registration.installing) {
      console.log('📦 Service Worker: Installazione in corso...');
    } else if (registration.waiting) {
      console.log('⏳ Service Worker: In attesa di attivazione...');
    } else if (registration.active) {
      console.log('✅ Service Worker: Attivo e funzionante');
    }

    // Listener per aggiornamenti
    registration.addEventListener('updatefound', () => {
      console.log('🔄 Service Worker: Nuovo aggiornamento disponibile');
      const newWorker = registration.installing;
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            console.log('🆕 Service Worker: Aggiornamento pronto, ricarica la pagina');
          }
        });
      }
    });

    return true;
  } catch (error) {
    // Fail-safe: Log errore ma non bloccare l'app
    console.warn('❌ Service Worker: Registrazione fallita, continuando senza cache', error);
    return false;
  }
}

/**
 * Deregistra il Service Worker (per debug/rollback)
 */
export async function unregisterServiceWorker(): Promise<boolean> {
  if (!('serviceWorker' in navigator)) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      const result = await registration.unregister();
      console.log('🗑️ Service Worker: Deregistrato con successo');
      return result;
    }
    return false;
  } catch (error) {
    console.warn('❌ Service Worker: Errore durante deregistrazione', error);
    return false;
  }
}

/**
 * Controlla lo stato del Service Worker
 */
export function getServiceWorkerStatus(): string {
  if (!('serviceWorker' in navigator)) {
    return 'non-supportato';
  }

  if (!navigator.serviceWorker.controller) {
    return 'non-attivo';
  }

  return 'attivo';
}
// END DIAGONALE APP SHELL - Service Worker Registration
