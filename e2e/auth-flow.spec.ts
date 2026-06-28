import { test, expect } from '@playwright/test';
import { installApiMocks } from './helpers/mockApi';

/**
 * Flusso di autenticazione.
 * Verifica il keypad PIN e il login (mockato: nessuna scrittura reale).
 */

test.describe('Flusso autenticazione', () => {
  test.beforeEach(async ({ page }) => {
    await installApiMocks(page);
    await page.goto('/');
    await expect(page.getByRole('button', { name: /Accedi/i })).toBeVisible({ timeout: 10_000 });
  });

  test('il keypad inserisce 4 cifre e abilita il submit', async ({ page }) => {
    const submit = page.getByRole('button', { name: /Accedi/i });

    // All'inizio il submit è disabilitato (PIN incompleto).
    await expect(submit).toBeDisabled();

    // Digita 4 cifre col keypad (bottoni con testo numerico).
    for (const digit of ['0', '1', '0', '1']) {
      await page.getByRole('button', { name: digit, exact: true }).first().click();
    }

    // Con 4 cifre il submit diventa attivo.
    await expect(submit).toBeEnabled();
  });

  test('il tasto C cancella una cifra del PIN', async ({ page }) => {
    const submit = page.getByRole('button', { name: /Accedi/i });

    for (const digit of ['0', '1', '0', '1']) {
      await page.getByRole('button', { name: digit, exact: true }).first().click();
    }
    await expect(submit).toBeEnabled();

    // Cancella una cifra → submit di nuovo disabilitato.
    await page.getByRole('button', { name: 'C', exact: true }).click();
    await expect(submit).toBeDisabled();
  });

  test('login con PIN valido procede oltre la schermata auth', async ({ page }) => {
    for (const digit of ['0', '1', '0', '1']) {
      await page.getByRole('button', { name: digit, exact: true }).first().click();
    }
    await page.getByRole('button', { name: /Accedi/i }).click();

    // Dopo il login mockato la schermata auth non deve più essere quella iniziale:
    // il pulsante "Accedi" del form di login sparisce.
    await expect(page.getByRole('button', { name: /^Accedi$/i })).toBeHidden({ timeout: 10_000 });
  });
});
