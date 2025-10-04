import { Search } from '@/components/icons';
import { useSearchOverlay } from '@/contexts/SearchOverlayContext';

interface SearchLensButtonProps {
  className?: string;
}

export default function SearchLensButton({ className = '' }: SearchLensButtonProps) {
  const { openOverlay } = useSearchOverlay();
  const handleClick = (e: React.MouseEvent) => {
    openOverlay();
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    openOverlay();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      openOverlay();
    }
  };

  return (
    <button
      type="button"
      role="button"
      tabIndex={0}
      data-testid="lens-button"
      onClick={handleClick}
      onPointerUp={handlePointerUp}
      onKeyDown={handleKeyDown}
      className={`
        flex items-center justify-center w-12 h-12 
        text-white hover:text-white/80 
        transition-all duration-200 
        pointer-events-auto
        ${className}
      `}
      title="Cerca vini"
      aria-label="Cerca vini negli eventi conclusi"
    >
      <Search className="w-6 h-6" />
    </button>
  );
}
