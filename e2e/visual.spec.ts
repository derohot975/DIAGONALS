import { test, expect } from '@playwright/test';
import { installApiMocks } from './helpers/mockApi';

/**
 * Resa visiva e regressioni.
 * Verifica la schermata di auth su viewport mobile e desktop e cattura
 * snapshot per individuare regressioni visive evidenti.
 *
 * Nota: gli snapshot di riferimento vengono creati al primo run
 * (`--update-snapshots`). I run successivi confrontano contro quelli.
 */

test.describe('Resa visiva', () => {
  test.beforeEach(async ({ page }) => {
    await installApiMocks(page);
  });

  test('layout mobile: la schermata auth è leggibile e centrata', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 }); // iPhone 12
    await page.goto('/');
    await expect(page.getByRole('button', { name: /Accedi/i })).toBeVisible({ timeout: 10_000 });

    // Il logo è presente e visibile.
    await expect(page.getByAltText(/DIAGO/i).first()).toBeVisible();

    // Nessuna scrollbar orizzontale (layout non sfora la viewport mobile).
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
    );
    expect(overflow, 'Overflow orizzontale su mobile').toBe(false);
  });

  test('layout desktop: la schermata auth si rende correttamente', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');
    await expect(page.getByRole('button', { name: /Accedi/i })).toBeVisible({ timeout: 10_000 });
    await expect(page.getByAltText(/DIAGO/i).first()).toBeVisible();
  });

  test('regressione visiva: snapshot schermata auth (mobile)', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await expect(page.getByRole('button', { name: /Accedi/i })).toBeVisible({ timeout: 10_000 });

    // maxDiffPixelRatio tollera micro-differenze di rendering tra ambienti.
    await expect(page).toHaveScreenshot('auth-mobile.png', {
      maxDiffPixelRatio: 0.02,
      animations: 'disabled',
    });
  });

  test('regressione visiva: snapshot schermata auth (desktop)', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');
    await expect(page.getByRole('button', { name: /Accedi/i })).toBeVisible({ timeout: 10_000 });

    await expect(page).toHaveScreenshot('auth-desktop.png', {
      maxDiffPixelRatio: 0.02,
      animations: 'disabled',
    });
  });
});
