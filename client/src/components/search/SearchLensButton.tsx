import { Search } from '@/components/icons';
import { useSearchOverlay } from '@/contexts/SearchOverlayContext';

interface SearchLensButtonProps {
  className?: string;
}

export default function SearchLensButton({ className = '' }: SearchLensButtonProps) {
  const { openOverlay } = useSearchOverlay();
  const handleClick = (e: React.MouseEvent) => {
    console.info('[LENS] press', Date.now(), e.type);
    openOverlay();
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    console.info('[LENS] pointerUp', Date.now(), e.type);
    openOverlay();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      console.info('[LENS] keydown Enter', Date.now());
      openOverlay();
    }
  };

  return (
    <button
      type="button"
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onPointerUp={handlePointerUp}
      onKeyDown={handleKeyDown}
      className={`
        flex items-center justify-center w-12 h-12 
        bg-white/90 backdrop-blur-sm rounded-full shadow-lg 
        border border-gray-200 hover:bg-white hover:shadow-xl 
        transition-all duration-200 active:scale-95
        pointer-events-auto outline-2 outline-red-500
        ${className}
      `}
      title="Cerca vini"
      aria-label="Cerca vini negli eventi conclusi"
    >
      <Search className="w-6 h-6 text-[#300505]" />
    </button>
  );
}
