import { test, expect } from '@playwright/test';
import { installApiMocks } from './helpers/mockApi';

/**
 * Navigazione e boot dell'app.
 * Verifica che l'app si avvii, superi lo splash e mostri la schermata di auth.
 * Rete mockata: nessuna chiamata reale al DB.
 */

test.describe('Boot & Navigazione', () => {
  test.beforeEach(async ({ page }) => {
    await installApiMocks(page);
  });

  test("l'app si carica senza errori e mostra il root", async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));

    await page.goto('/');
    await expect(page.locator('#root')).toBeVisible();

    // Nessun errore JS fatale al boot.
    expect(errors, `Errori JS al boot: ${errors.join(' | ')}`).toHaveLength(0);
  });

  test('dopo lo splash compare la schermata di autenticazione', async ({ page }) => {
    await page.goto('/');

    // Lo splash transita verso Auth: attendo un elemento stabile della schermata auth.
    // Il pulsante di submit mostra "Accedi" (login mode di default).
    await expect(page.getByRole('button', { name: /Accedi/i })).toBeVisible({ timeout: 10_000 });
  });

  test('il toggle login/registrazione cambia la schermata', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('button', { name: /Accedi/i })).toBeVisible({ timeout: 10_000 });

    // Passa a registrazione
    await page.getByRole('button', { name: /Non hai un account\? Registrati/i }).click();
    await expect(page.getByRole('button', { name: /Registrati/i })).toBeVisible();

    // Torna a login
    await page.getByRole('button', { name: /Hai già un account\? Accedi/i }).click();
    await expect(page.getByRole('button', { name: /Accedi/i })).toBeVisible();
  });
});
