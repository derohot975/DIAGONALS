import React, { createContext, useContext, useState, useRef } from 'react';

interface SearchOverlayContextType {
  open: boolean;
  openOverlay: () => void;
  closeOverlay: () => void;
}

const SearchOverlayContext = createContext<SearchOverlayContextType | undefined>(undefined);

export function SearchOverlayProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const openRef = useRef(open);
  
  // Sync ref for debugging
  openRef.current = open;

  const openOverlay = () => {
    setOpen(true);
  };

  const closeOverlay = () => {
    setOpen(false);
  };

  const value = {
    open,
    openOverlay,
    closeOverlay,
  };

  return (
    <SearchOverlayContext.Provider value={value}>
      {children}
    </SearchOverlayContext.Provider>
  );
}

export function useSearchOverlay() {
  const context = useContext(SearchOverlayContext);
  if (context === undefined) {
    throw new Error('useSearchOverlay must be used within a SearchOverlayProvider');
  }
  return context;
}
