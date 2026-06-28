import type { Page } from '@playwright/test';

/**
 * Imposta una sessione utente FINTA prima del caricamento dell'app.
 *
 * Scrive solo in `sessionStorage` del browser di test (effimero, per-contesto).
 * NON tocca il database né alcun servizio reale: combinato con i mock di rete,
 * l'app crede di essere loggata ma ogni dato proviene dai mock.
 *
 * Forma attesa da App.tsx: { userId, ts } con ts recente (< 24h).
 */
export async function seedUserSession(page: Page, userId = 1) {
  await page.addInitScript(
    ([id]) => {
      try {
        window.sessionStorage.setItem(
          'dg_user_session',
          JSON.stringify({ userId: id, ts: Date.now() }),
        );
      } catch {
        /* ignora storage non disponibile */
      }
    },
    [userId],
  );
}

/** Come sopra ma anche con sessione admin attiva. */
export async function seedAdminSession(page: Page, userId = 1) {
  await seedUserSession(page, userId);
  await page.addInitScript(() => {
    try {
      window.sessionStorage.setItem('dg_admin_session', 'true');
    } catch {
      /* ignora */
    }
  });
}
