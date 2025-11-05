import { Download, Home } from '@/components/icons';

interface ShareButtonBarProps {
  onExport: () => void;
  onGoHome?: () => void;
}

export default function ShareButtonBar({ onExport, onGoHome }: ShareButtonBarProps) {
  return (
    <div className="fixed left-0 right-0 z-[9999] flex justify-center" style={{bottom: 'var(--bottom-nav-offset)'}}>
      <div className="flex items-center space-x-4">
        <button 
          onClick={onExport}
          className="text-white p-3 rounded-full shadow-lg transition-all hover:bg-white hover:bg-opacity-10"
          style={{background: 'rgba(255, 255, 255, 0.1)'}}
          title="Condividi"
        >
          <Download className="w-5 h-5" />
        </button>
        {onGoHome && (
          <button
            onClick={onGoHome}
            className="text-white p-3 rounded-full shadow-lg transition-all hover:bg-white hover:bg-opacity-10"
            style={{background: 'rgba(255, 255, 255, 0.1)'}}
            title="Home"
          >
          <Home className="w-5 h-5" />
        </button>
        )}
      </div>
    </div>
  );
}
