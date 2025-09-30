import { ReactNode } from 'react';
import { Home, ArrowLeft, Shield } from '@/components/icons';

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
        return `${baseStyles} text-red-400 hover:text-red-300`;
      default:
        return `${baseStyles} text-white hover:text-white/80`;
    }
  };

  // Apply definitive rule: Home always left, Admin always right
  const shouldShowHome = onGoHome && currentScreen !== 'events' && currentScreen !== 'home';
  const shouldShowAdmin = onShowAdmin && currentScreen !== 'admin';

  // Layout: sides (Home left, Admin right, center buttons in middle)
  if (layout === 'sides') {
    return (
      <div 
        className="fixed left-0 right-0 z-50 flex items-center justify-between px-4"
        style={{ bottom: 'var(--bottom-nav-offset)' }}
      >
        {/* Left side - Reserved for Home (or Back if present) */}
        <div className="flex items-center space-x-3 min-w-[48px]">
          {onGoBack && (
            <button
              onClick={onGoBack}
              className={getButtonStyles('primary')}
              title="Indietro"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
          )}
          {shouldShowHome && !onGoBack && (
            <button
              onClick={onGoHome}
              className={getButtonStyles('primary')}
              title="Home"
            >
              <Home className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Center - Custom buttons */}
        {centerButtons.length > 0 && (
          <div className="flex items-center space-x-3">
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
        )}

        {/* Right side - Reserved for Admin */}
        <div className="flex items-center space-x-3 min-w-[48px] justify-end">
          {shouldShowHome && onGoBack && (
            <button
              onClick={onGoHome}
              className={getButtonStyles('primary')}
              title="Home"
            >
              <Home className="w-6 h-6" />
            </button>
          )}
          {shouldShowAdmin && (
            <button
              onClick={onShowAdmin}
              className={getButtonStyles('admin')}
              title="Admin"
            >
              <Shield className="w-6 h-6" />
            </button>
          )}
        </div>
      </div>
    );
  }

  // Layout: center (all buttons centered)
  if (layout === 'center') {
    const allButtons = [
      ...(onGoBack ? [{ id: 'back', icon: <ArrowLeft className="w-6 h-6" />, onClick: onGoBack, title: 'Indietro', variant: 'glass' as const }] : []),
      ...centerButtons,
      ...(shouldShowHome ? [{ id: 'home', icon: <Home className="w-6 h-6" />, onClick: onGoHome, title: 'Home', variant: 'glass' as const }] : []),
      ...(shouldShowAdmin ? [{ id: 'admin', icon: <Shield className="w-6 h-6" />, onClick: onShowAdmin, title: 'Admin', variant: 'admin' as const }] : [])
    ];

    return (
      <div 
        className="fixed left-0 right-0 z-50 flex justify-center"
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
        </div>
      </div>
    );
  }

  // Layout: mixed (custom positioning)
  return (
    <div 
      className="fixed left-0 right-0 z-50"
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
        <div className="absolute right-4">
          <button
            onClick={onGoHome}
            className={getButtonStyles('primary')}
            title="Home"
          >
            <Home className="w-5 h-5" />
          </button>
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
  );
}
