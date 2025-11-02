import { createRoot } from "react-dom/client";
import { AppProvider } from "./providers/AppProvider";
import App from "./App";
import "./index.css";
// BEGIN DIAGONALE APP SHELL - Service Worker Registration
import { registerServiceWorker } from "./lib/serviceWorker";
// END DIAGONALE APP SHELL

// BEGIN DIAGONALE SAFE-MODE iOS - iOS Detection and Shell Gating
const IS_IOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
const SHELL_ENABLED = import.meta.env.VITE_ENABLE_APP_SHELL !== 'false' && !IS_IOS;
const INTRO_ENABLED = import.meta.env.VITE_ENABLE_APP_SHELL_ON_INTRO !== 'false' && !IS_IOS;
const SW_ENABLED = import.meta.env.VITE_ENABLE_SW !== 'false' && !IS_IOS;

// Expose globals for App.tsx
(window as any).__DIAGONALE_SAFE_MODE__ = {
  IS_IOS,
  SHELL_ENABLED,
  INTRO_ENABLED,
  SW_ENABLED
};

console.log(`📱 Safe Mode iOS: ${IS_IOS ? 'ATTIVO' : 'INATTIVO'} - Shell: ${SHELL_ENABLED}, Intro: ${INTRO_ENABLED}, SW: ${SW_ENABLED}`);
// END DIAGONALE SAFE-MODE iOS

// Force rebuild v2.1

createRoot(document.getElementById("root")!).render(
  <AppProvider>
    <App />
  </AppProvider>
);

// BEGIN DIAGONALE APP SHELL - Deferred Service Worker registration (iOS Safe)
// Registra Service Worker DOPO il first paint per evitare interferenze con intro
if (typeof window !== 'undefined' && SW_ENABLED) {
  // Defer SW registration per non interferire con intro
  const deferredSWRegistration = () => {
    // Usa requestIdleCallback se disponibile, altrimenti setTimeout
    const scheduleRegistration = (callback: () => void) => {
      if ('requestIdleCallback' in window) {
        requestIdleCallback(callback, { timeout: 2000 });
      } else {
        setTimeout(callback, 100); // Breve delay per permettere first paint
      }
    };

    scheduleRegistration(() => {
      registerServiceWorker().then(success => {
        if (success) {
          console.log('✅ Service Worker registrato con successo (deferred)');
        } else {
          console.log('ℹ️ Service Worker non registrato (normale in sviluppo o iOS)');
        }
      });
    });
  };

  // Attendi load event, poi defer ulteriormente
  window.addEventListener('load', deferredSWRegistration);
} else if (IS_IOS) {
  console.log('📱 Service Worker: Disabilitato su iOS per sicurezza');
}
// END DIAGONALE APP SHELL
