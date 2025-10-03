import { test, expect } from '@playwright/test';

/**
 * 🛡️ GUARDRAIL TEST - Search Overlay vs Bottom-Nav Z-Index
 * 
 * Verifica che l'overlay di ricerca sia sempre sopra la bottom-nav
 * e che non ci siano conflitti di stacking context.
 * 
 * @version 1.0
 * @date 03/10/2025
 */

test.describe('Search Overlay Z-Index Guardrail', () => {
  
  test.beforeEach(async ({ page }) => {
    // Naviga alla home page (dovrebbe avere bottom-nav)
    await page.goto('/');
    
    // Attendi che la pagina sia completamente caricata
    await page.waitForLoadState('networkidle');
  });

  test('overlay search deve essere sopra bottom-nav e interattivo', async ({ page }) => {
    // 1. Verifica presenza bottom-nav
    const bottomNav = page.locator('[data-testid="bottom-nav"], .fixed.bottom-0, .fixed[style*="bottom"]').first();
    await expect(bottomNav).toBeVisible();
    
    // 2. Verifica presenza pulsante lente
    const searchButton = page.locator('button[title="Cerca vini"], button[aria-label*="Cerca vini"]').first();
    await expect(searchButton).toBeVisible();
    
    // 3. Click su lente → overlay deve aprirsi
    await searchButton.click();
    
    // 4. Verifica overlay visibile
    const overlay = page.locator('[role="dialog"], .fixed.inset-0').first();
    await expect(overlay).toBeVisible();
    
    // 5. Verifica che overlay sia sopra bottom-nav (z-index test)
    const overlayZIndex = await overlay.evaluate(el => {
      return parseInt(window.getComputedStyle(el).zIndex || '0');
    });
    
    const bottomNavZIndex = await bottomNav.evaluate(el => {
      return parseInt(window.getComputedStyle(el).zIndex || '0');
    });
    
    // Assert: overlay z-index > bottom-nav z-index
    expect(overlayZIndex).toBeGreaterThan(bottomNavZIndex);
    expect(overlayZIndex).toBeGreaterThanOrEqual(100); // MODAL_OVERLAY token
    expect(bottomNavZIndex).toBeLessThanOrEqual(50);   // BOTTOM_NAV token
    
    // 6. Verifica che overlay sia cliccabile (non occluso)
    const searchInput = page.locator('input[placeholder*="Nome vino"], input[placeholder*="produttore"]').first();
    await expect(searchInput).toBeVisible();
    await expect(searchInput).toBeEditable();
    
    // 7. Test interazione: digita query
    await searchInput.fill('fer');
    
    // 8. Attendi risultati (loading o empty state)
    await page.waitForTimeout(500); // Debounce + API call
    
    // 9. Verifica che overlay rimanga sopra durante interazione
    const overlayAfterSearch = page.locator('[role="dialog"]').first();
    await expect(overlayAfterSearch).toBeVisible();
    
    // 10. Verifica che bottom-nav non intercetti click
    // Click su area overlay (non backdrop) deve rimanere nell'overlay
    const overlayContent = page.locator('.bg-white.rounded-2xl, .bg-white.rounded-xl').first();
    await overlayContent.click();
    await expect(overlay).toBeVisible(); // Overlay ancora aperto
    
    // 11. Chiudi overlay con ESC
    await page.keyboard.press('Escape');
    await expect(overlay).not.toBeVisible();
  });

  test('overlay deve funzionare su mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Ripeti test base per mobile
    const searchButton = page.locator('button[title="Cerca vini"]').first();
    await expect(searchButton).toBeVisible();
    
    // Touch target deve essere ≥44px
    const buttonBox = await searchButton.boundingBox();
    expect(buttonBox?.width).toBeGreaterThanOrEqual(44);
    expect(buttonBox?.height).toBeGreaterThanOrEqual(44);
    
    // Test apertura overlay
    await searchButton.click();
    const overlay = page.locator('[role="dialog"]').first();
    await expect(overlay).toBeVisible();
    
    // Test scroll su mobile
    const searchInput = page.locator('input[placeholder*="Nome vino"]').first();
    await searchInput.fill('test');
    
    // Verifica che overlay sia scrollabile se necessario
    const overlayContent = page.locator('.max-h-96, .overflow-y-auto').first();
    if (await overlayContent.isVisible()) {
      // Test scroll funzionante
      await overlayContent.evaluate(el => el.scrollTop = 50);
      expect(await overlayContent.evaluate(el => el.scrollTop)).toBeGreaterThan(0);
    }
  });

  test('overlay deve funzionare su desktop viewport', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1280, height: 720 });
    
    const searchButton = page.locator('button[title="Cerca vini"]').first();
    await searchButton.click();
    
    const overlay = page.locator('[role="dialog"]').first();
    await expect(overlay).toBeVisible();
    
    // Su desktop, overlay deve essere centrato e con max-width
    const overlayBox = await overlay.boundingBox();
    const viewportWidth = 1280;
    
    // Overlay deve essere centrato orizzontalmente
    const centerX = viewportWidth / 2;
    const overlayCenterX = (overlayBox?.x || 0) + (overlayBox?.width || 0) / 2;
    
    // Tolleranza ±50px per centratura
    expect(Math.abs(overlayCenterX - centerX)).toBeLessThan(50);
    
    // Overlay non deve occupare tutta la larghezza su desktop
    expect(overlayBox?.width).toBeLessThan(viewportWidth * 0.9);
  });

  test('deve prevenire regressioni z-index in console', async ({ page }) => {
    // Cattura messaggi console
    const consoleMessages: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'warning' && msg.text().includes('Z-Index Guardrail')) {
        consoleMessages.push(msg.text());
      }
    });
    
    // Apri overlay
    const searchButton = page.locator('button[title="Cerca vini"]').first();
    await searchButton.click();
    
    // Attendi possibili warning
    await page.waitForTimeout(100);
    
    // Non dovrebbero esserci warning z-index in development
    expect(consoleMessages).toHaveLength(0);
  });
});
