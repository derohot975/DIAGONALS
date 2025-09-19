import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import App from "./App";
import "./index.css";
// BEGIN DIAGONALE APP SHELL - Service Worker Registration
import { registerServiceWorker } from "./lib/serviceWorker";
// END DIAGONALE APP SHELL
// Force rebuild v2.1

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
);

// BEGIN DIAGONALE APP SHELL - Deferred Service Worker registration
// Registra Service Worker DOPO il first paint per evitare interferenze con intro
if (typeof window !== 'undefined') {
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
          console.log('ℹ️ Service Worker non registrato (normale in sviluppo)');
        }
      });
    });
  };

  // Attendi load event, poi defer ulteriormente
  window.addEventListener('load', deferredSWRegistration);
}
// END DIAGONALE APP SHELL
