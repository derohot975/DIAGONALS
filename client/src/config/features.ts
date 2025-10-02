/**
 * 🔧 FEATURE FLAGS - DIAGONALE
 * Configurazione centralizzata per funzionalità sperimentali/opzionali
 */

export const FEATURES = {
  // 🔍 Wine Search - Ricerca vini eventi conclusi
  ENABLE_WINE_SEARCH: true, // Default ON - Lente sempre presente in bottom-nav
  
  // 🚀 Future features
  // ENABLE_ADVANCED_FILTERS: false,
  // ENABLE_WINE_RECOMMENDATIONS: false,
} as const;

export type FeatureFlag = keyof typeof FEATURES;
