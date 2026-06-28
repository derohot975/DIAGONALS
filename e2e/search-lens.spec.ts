import { test, expect } from '@playwright/test';
import { installApiMocks } from './helpers/mockApi';
import { seedUserSession } from './helpers/session';

/**
 * Search Lens overlay — versione robusta coi mock.
 *
 * Sostituisce in pratica il vecchio `search-overlay.spec.ts` (rimasto skip
 * perché richiedeva auth reale). Qui la sessione è finta e le API mockate.
 *
 * Verifica il guardrail chiave: l'overlay di ricerca sta SOPRA la bottom-nav.
 */

test.describe('Search Lens overlay', () => {
  test.beforeEach(async ({ page }) => {
    await installApiMocks(page);
    await seedUserSession(page, 1);
    await page.goto('/');
    await expect(page.locator('#root')).toBeVisible();
  });

  test('la lente è presente nella bottom-nav post-login', async ({ page }) => {
    const lens = page.getByTestId('lens-button');
    await expect(lens).toBeVisible({ timeout: 10_000 });

    // Touch target adeguato (≥44px) per usabilità mobile.
    const box = await lens.boundingBox();
    expect(box?.width).toBeGreaterThanOrEqual(44);
    expect(box?.height).toBeGreaterThanOrEqual(44);
  });

  test('cliccando la lente si apre l\'overlay di ricerca sopra la bottom-nav', async ({ page }) => {
    const lens = page.getByTestId('lens-button');
    await expect(lens).toBeVisible({ timeout: 10_000 });
    await lens.click();

    const overlay = page.getByTestId('wine-search-overlay');
    await expect(overlay).toBeVisible({ timeout: 5_000 });

    // GUARDRAIL stacking: nel punto centrale dell'overlay, l'elemento in cima
    // (elementFromPoint) deve appartenere all'overlay, NON alla bottom-nav sotto.
    // Verifica il comportamento reale (chi riceve i click) invece del valore numerico.
    const topIsOverlay = await overlay.evaluate((el) => {
      const r = el.getBoundingClientRect();
      const top = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
      return !!top && el.contains(top);
    });
    expect(topIsOverlay, "L'overlay deve stare sopra la bottom-nav").toBe(true);
  });

  test('l\'overlay si chiude con ESC', async ({ page }) => {
    const lens = page.getByTestId('lens-button');
    await expect(lens).toBeVisible({ timeout: 10_000 });
    await lens.click();

    const overlay = page.getByTestId('wine-search-overlay');
    await expect(overlay).toBeVisible({ timeout: 5_000 });

    await page.keyboard.press('Escape');
    await expect(overlay).toBeHidden({ timeout: 5_000 });
  });
});
