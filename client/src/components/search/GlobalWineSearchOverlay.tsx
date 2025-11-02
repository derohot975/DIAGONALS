import { createPortal } from 'react-dom';
import { useSearchOverlay } from '@/contexts/SearchOverlayContext';
import WineSearchOverlay from './WineSearchOverlay';

/**
 * Global Wine Search Overlay - Always mounted with Portal
 * Manages the search overlay state via SearchOverlayContext
 */
export default function GlobalWineSearchOverlay() {
  const { open, closeOverlay } = useSearchOverlay();

  // Always render via Portal to avoid stacking context issues
  return createPortal(
    <WineSearchOverlay 
      open={open} 
      onOpenChange={closeOverlay} 
    />,
    document.body
  );
}
