import { ReactNode, useState } from 'react';
import { Home, ArrowLeft, Shield } from '@/components/icons';
import { FEATURES } from '@/config/features';
import SearchLensButton from '@/components/search/SearchLensButton';
import { getZIndexClass } from '@/styles/tokens/zIndex';

export interface BottomNavButton {
  id: string;
  icon: ReactNode;
  onClick: () => void;
  title?: string;
  variant?: 'primary' | 'secondary' | 'glass' | 'admin';
}

interface BottomNavBarProps {
  // Standard navigation
  onGoHome?: () => void;
  onGoBack?: () => void;
  onShowAdmin?: () => void;
  
  // Custom center buttons (max 3 recommended)
  centerButtons?: BottomNavButton[];
  
  // Layout variants
  layout?: 'sides' | 'center' | 'mixed';
  
  // Style variants
  variant?: 'solid' | 'glass' | 'transparent';
  
  // Current screen for conditional display
  currentScreen?: string;
}

export default function BottomNavBar({
  onGoHome,
  onGoBack,
  onShowAdmin,
  centerButtons = [],
  layout = 'sides',
  variant = 'solid',
  currentScreen
}: BottomNavBarProps) {
  // 🔍 Wine Search State (Global)
  // Search overlay now managed globally via SearchOverlayContext
  
  // Button style variants - icone trasparenti senza sfondo
  const getButtonStyles = (buttonVariant: BottomNavButton['variant'] = 'primary') => {
    const baseStyles = "p-3 transition-all duration-200 flex items-center justify-center";
    
    switch (buttonVariant) {
      case 'primary':
        return `${baseStyles} text-white hover:text-white/80`;
      case 'secondary':
        return `${baseStyles} text-white/70 hover:text-white`;
      case 'glass':
        return `${baseStyles} text-white/80 hover:text-white`;
      case 'admin':
        return `${baseStyles} text-white hover:text-white/80`;
      default:
        return `${baseStyles} text-white hover:text-white/80`;
    }
  };

  // NEW RULE: Back left, everything else centered
  const shouldShowHome = onGoHome && currentScreen !== 'events' && currentScreen !== 'home';
  const shouldShowAdmin = onShowAdmin && currentScreen !== 'admin';

  // Layout: sides (Balanced three-region layout for optical centering)
  if (layout === 'sides') {
    // Collect center buttons (Home, Admin, custom buttons)
    const allCenterButtons = [
      ...centerButtons,
      ...(shouldShowHome ? [{ id: 'home', icon: <Home className="w-6 h-6" />, onClick: onGoHome, title: 'Home', variant: 'primary' as const }] : []),
      ...(shouldShowAdmin ? [{ id: 'admin', icon: <Shield className="w-6 h-6" />, onClick: onShowAdmin, title: 'Admin', variant: 'admin' as const }] : [])
    ];

    return (
      <div 
        className={`fixed left-0 right-0 ${getZIndexClass('BOTTOM_NAV')} flex items-center px-4`}
        style={{ bottom: 'var(--bottom-nav-offset)' }}
      >
        {/* Left Region - Back button with fixed width for optical balance */}
        <div className="flex items-center justify-start w-16">
          {onGoBack && (
            <button
              onClick={onGoBack}
              className={getButtonStyles('primary')}
              title="Indietro"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Center Region - Optically centered buttons */}
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center space-x-4">
            {allCenterButtons.map((button) => (
              <button
                key={button.id}
                onClick={button.onClick}
                className={getButtonStyles(button.variant)}
                title={button.title}
              >
                {button.icon}
              </button>
            ))}
          </div>
        </div>

        {/* Right Region - Search lens with fixed width matching left */}
        <div className="flex items-center justify-end w-16">
          {FEATURES.ENABLE_WINE_SEARCH && (
            <SearchLensButton />
          )}
        </div>
      </div>
    );
  }

  // Layout: center (all buttons centered with search lens)
  if (layout === 'center') {
    const allButtons = [
      ...(onGoBack ? [{ id: 'back', icon: <ArrowLeft className="w-6 h-6" />, onClick: onGoBack, title: 'Indietro', variant: 'glass' as const }] : []),
      ...centerButtons,
      ...(shouldShowHome ? [{ id: 'home', icon: <Home className="w-6 h-6" />, onClick: onGoHome, title: 'Home', variant: 'glass' as const }] : []),
      ...(shouldShowAdmin ? [{ id: 'admin', icon: <Shield className="w-6 h-6" />, onClick: onShowAdmin, title: 'Admin', variant: 'admin' as const }] : [])
    ];

    return (
      <div 
        className={`fixed left-0 right-0 ${getZIndexClass('BOTTOM_NAV')} flex justify-center px-4`}
        style={{ bottom: 'var(--bottom-nav-offset)' }}
      >
        <div className="flex items-center space-x-4">
          {allButtons.map((button) => (
            <button
              key={button.id}
              onClick={button.onClick}
              className={getButtonStyles(button.variant)}
              title={button.title}
            >
              {button.icon}
            </button>
          ))}
          
          {/* Wine Search Lens - Integrated in center cluster */}
          {FEATURES.ENABLE_WINE_SEARCH && (
            <SearchLensButton />
          )}
        </div>
      </div>
    );
  }

  // Layout: mixed (custom positioning)
  return (
    <>
      <div 
        className={`fixed left-0 right-0 ${getZIndexClass('BOTTOM_NAV')}`}
        style={{ bottom: 'var(--bottom-nav-offset)' }}
      >
        {/* Custom layout - render center buttons only */}
        {centerButtons.length > 0 && (
          <div className="flex justify-center">
            <div className="flex items-center space-x-4">
              {centerButtons.map((button) => (
                <button
                  key={button.id}
                  onClick={button.onClick}
                  className={getButtonStyles(button.variant)}
                  title={button.title}
                >
                  {button.icon}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {/* Individual positioned buttons */}
        {onGoBack && (
          <div className="absolute left-4">
            <button
              onClick={onGoBack}
              className={getButtonStyles('primary')}
              title="Indietro"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          </div>
        )}
        
        {onGoHome && (
          <div className="absolute right-20">
            <button
              onClick={onGoHome}
              className={getButtonStyles('primary')}
              title="Home"
            >
              <Home className="w-5 h-5" />
            </button>
          </div>
        )}
        
        {/* Wine Search Lens - Always visible in mixed layout (extreme right) */}
        {FEATURES.ENABLE_WINE_SEARCH && (
          <div className="absolute right-4">
            <SearchLensButton />
          </div>
        )}
        
        {onShowAdmin && (
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <button
              onClick={onShowAdmin}
              className={getButtonStyles('admin')}
              title="Admin"
            >
              <Shield className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
      
      {/* Wine Search Overlay now managed globally via Portal */}
    </>
  );
}
