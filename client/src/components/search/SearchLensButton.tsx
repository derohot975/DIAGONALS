import { Search } from '@/components/icons';

interface SearchLensButtonProps {
  onClick: () => void;
  className?: string;
}

export default function SearchLensButton({ onClick, className = '' }: SearchLensButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`p-3 transition-all duration-200 flex items-center justify-center text-white hover:text-white/80 ${className}`}
      title="Cerca vini"
      aria-label="Cerca vini negli eventi conclusi"
    >
      <Search className="w-6 h-6" />
    </button>
  );
}
