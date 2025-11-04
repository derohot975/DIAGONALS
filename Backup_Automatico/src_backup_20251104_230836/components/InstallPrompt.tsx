import { useState, useEffect } from 'react';
import { Download, X, Smartphone } from '@/components/icons';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Check for iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(isIOSDevice);

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Show prompt after a short delay
      setTimeout(() => {
        setShowInstallPrompt(true);
      }, 3000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // For iOS, show manual instructions after delay
    if (isIOSDevice && !(window.navigator as any).standalone) {
      setTimeout(() => {
        setShowInstallPrompt(true);
      }, 5000);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setShowInstallPrompt(false);
      }
    }
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    // Don't show again for this session
    sessionStorage.setItem('diagonale_install_dismissed', 'true');
  };

  // Don't show if already installed or dismissed in this session
  if (isInstalled || sessionStorage.getItem('diagonale_install_dismissed')) {
    return null;
  }

  if (!showInstallPrompt) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 z-40 max-w-sm mx-auto">
      <div className="bg-gradient-to-r from-[#300505] to-[#8d0303] text-white rounded-2xl p-4 shadow-2xl animate-slide-up border border-white/20">
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 p-1 hover:bg-white/20 rounded-full transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
        
        <div className="flex items-start space-x-3">
          <div className="bg-white/20 p-2 rounded-xl flex-shrink-0">
            <Smartphone className="w-6 h-6" />
          </div>
          
          <div className="flex-1">
            <h3 className="font-bold text-sm mb-1">Installa DIAGONALE</h3>
            
            {isIOS ? (
              <div>
                <p className="text-xs text-white/90 mb-2">
                  Aggiungi alla schermata Home per un'esperienza migliore
                </p>
                <div className="flex items-center space-x-1 text-xs text-white/80">
                  <span>Tocca</span>
                  <span className="bg-white/20 px-1 rounded">⬆️</span>
                  <span>poi "Aggiungi alla schermata Home"</span>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-xs text-white/90 mb-3">
                  Installa l'app per accesso rapido e notifiche
                </p>
                <button
                  onClick={handleInstallClick}
                  className="bg-white text-[#300505] hover:bg-white/90 px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Installa App</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}