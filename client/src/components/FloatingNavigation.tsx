import { Home } from 'lucide-react';

interface FloatingNavigationProps {
  onShowHome: () => void;
}

export default function FloatingNavigation({ onShowHome }: FloatingNavigationProps) {
  return (
    <div className="floating-nav">
      <button
        onClick={onShowHome}
        className="bg-[hsl(229,73%,69%)] hover:bg-[hsl(270,50%,65%)] text-white p-3 rounded-full shadow-lg transition-all"
      >
        <Home className="w-5 h-5" />
      </button>
    </div>
  );
}
