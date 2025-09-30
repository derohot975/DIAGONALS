import { ArrowLeft, Home } from '@/components/icons';

interface NavButtonsProps {
  onGoBack?: () => void;
  onGoHome?: () => void;
}

export default function NavButtons({ onGoBack, onGoHome }: NavButtonsProps) {
  return (
    <>
      {/* Navigation Buttons */}
      {onGoBack && (
        <div className="fixed left-4 z-50" style={{bottom: 'var(--bottom-nav-offset)'}}>
          <button
            onClick={onGoBack}
            className="bg-[hsl(229,73%,69%)] hover:bg-[hsl(270,50%,65%)] text-white p-3 rounded-full shadow-lg transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>
      )}
      
      {onGoHome && (
        <div className="fixed right-4 z-50" style={{bottom: 'var(--bottom-nav-offset)'}}>
          <button
            onClick={onGoHome}
            className="bg-[hsl(229,73%,69%)] hover:bg-[hsl(270,50%,65%)] text-white p-3 rounded-full shadow-lg transition-all"
            title="Torna alla Home"
          >
            <Home className="w-5 h-5" />
          </button>
        </div>
      )}
    </>
  );
}
