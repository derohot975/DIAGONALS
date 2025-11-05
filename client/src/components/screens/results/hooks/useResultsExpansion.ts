import { useState } from 'react';

export function useResultsExpansion() {
  const [expandedWines, setExpandedWines] = useState<Set<number>>(new Set());

  const toggleExpandWine = (wineId: number) => {
    const newExpanded = new Set(expandedWines);
    if (newExpanded.has(wineId)) {
      newExpanded.delete(wineId);
    } else {
      newExpanded.add(wineId);
    }
    setExpandedWines(newExpanded);
  };

  return {
    expandedWines,
    toggleExpandWine,
  };
}
