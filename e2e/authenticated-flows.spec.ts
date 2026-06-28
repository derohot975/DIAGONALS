import { test, expect } from '@playwright/test';
import { installApiMocks } from './helpers/mockApi';
import { seedUserSession, seedAdminSession } from './helpers/session';

/**
 * Flussi post-login (lista eventi, navigazione interna, admin).
 *
 * Isolamento totale: sessione finta in sessionStorage + tutte le API mockate.
 * Nessuna lettura/scrittura sul DB reale. Questi test OSSERVANO la UI autenticata.
 */

test.describe('Flussi autenticati', () => {
  test.beforeEach(async ({ page }) => {
    await installApiMocks(page);
    await seedUserSession(page, 1);
  });

  test('con sessione attiva l\'app supera la schermata di login', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#root')).toBeVisible();

    // Con sessione valida, il form di login (pulsante "Accedi") non deve comparire.
    await expect(page.getByRole('button', { name: /^Accedi$/i })).toBeHidden({ timeout: 10_000 });
  });

  test('la lista eventi mostra gli eventi mockati', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#root')).toBeVisible();

    // Almeno un evento mockato deve apparire a schermo (nome o badge).
    await expect(page.getByText(/Degustazione Test|Serata Bollicine/i).first()).toBeVisible({
      timeout: 10_000,
    });
  });

  test('nessuna richiesta reale al DB: tutte le /api sono intercettate', async ({ page }) => {
    const unmocked: string[] = [];
    // Se una richiesta /api raggiungesse la rete reale, fallirebbe il mock route:
    // qui registriamo eventuali richieste non gestite.
    page.on('requestfailed', (req) => {
      if (req.url().includes('/api/')) unmocked.push(req.url());
    });

    await page.goto('/');
    await expect(page.locator('#root')).toBeVisible();
    await page.waitForTimeout(1500);

    expect(unmocked, `Richieste /api non mockate: ${unmocked.join(', ')}`).toHaveLength(0);
  });
});

test.describe('Flussi admin', () => {
  test.beforeEach(async ({ page }) => {
    await installApiMocks(page);
    await seedAdminSession(page, 1);
  });

  test('con sessione admin l\'app carica senza errori', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));

    await page.goto('/');
    await expect(page.locator('#root')).toBeVisible();
    await page.waitForTimeout(1000);

    expect(errors, `Errori JS in sessione admin: ${errors.join(' | ')}`).toHaveLength(0);
  });
});
