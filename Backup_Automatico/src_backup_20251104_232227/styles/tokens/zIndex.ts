/**
 * 🎨 Z-INDEX DESIGN TOKENS - DIAGONALE
 * Centralizzazione valori z-index per prevenire conflitti stacking context
 * 
 * REGOLE:
 * - Usare SEMPRE questi token, mai valori inline
 * - Ordine crescente: base → navigation → overlay → toast
 * - Gap 50 tra livelli per future estensioni
 * 
 * @version 1.0
 * @date 03/10/2025
 */

export const Z_INDEX = {
  // Base layer - elementi di sfondo
  BASE: 0,
  
  // Navigation layer - bottom-nav, header, sidebar
  BOTTOM_NAV: 50,
  HEADER: 50,
  SIDEBAR: 50,
  
  // Overlay layer - modal, dropdown, tooltip
  MODAL_OVERLAY: 100,
  DROPDOWN: 100,
  TOOLTIP: 100,
  
  // Toast layer - notifiche, alert
  TOAST: 200,
  NOTIFICATION: 200,
  
  // Debug layer - solo development
  DEBUG_OVERLAY: 9999,
} as const;

export type ZIndexToken = keyof typeof Z_INDEX;

/**
 * Utility per ottenere valore z-index con validazione TypeScript
 */
export const getZIndex = (token: ZIndexToken): number => {
  return Z_INDEX[token];
};

/**
 * Utility per generare classe Tailwind z-index
 */
export const getZIndexClass = (token: ZIndexToken): string => {
  const value = Z_INDEX[token];
  
  // Usa classi standard Tailwind quando possibile
  switch (value) {
    case 0: return 'z-0';
    case 50: return 'z-50';
    default: return `z-[${value}]`;
  }
};

/**
 * Guardrail development - verifica ordine z-index
 */
export const validateZIndexOrder = (current: ZIndexToken, expected: ZIndexToken): boolean => {
  const currentValue = Z_INDEX[current];
  const expectedValue = Z_INDEX[expected];
  
  if (process.env.NODE_ENV === 'development' && currentValue <= expectedValue) {
    console.warn(
      `[Z-Index Guardrail] Conflitto rilevato: ${current}(${currentValue}) <= ${expected}(${expectedValue})`
    );
    return false;
  }
  
  return true;
};
