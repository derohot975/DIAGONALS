import { ReactNode } from 'react';
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
  onGoHome?: () => void;
  onGoBack?: () => void;
  onShowAdmin?: () => void;
  centerButtons?: BottomNavButton[];
  layout?: 'sides' | 'center' | 'mixed';
  variant?: 'solid' | 'glass' | 'transparent';
  currentScreen?: string;
}

export default function BottomNavBar({
  onGoHome,
  onGoBack,
  onShowAdmin,
  centerButtons = [],
  layout = 'sides',
  currentScreen
}: BottomNavBarProps) {
  const shouldShowHome = onGoHome && currentScreen !== 'events' && currentScreen !== 'home';
  const shouldShowAdmin = onShowAdmin && currentScreen !== 'admin';

  // Build unified button list based on layout
  const buildButtons = (): BottomNavButton[] => {
    if (layout === 'center' && centerButtons.length > 0) {
      return [
        ...centerButtons,
        ...(shouldShowAdmin ? [{ id: 'admin', icon: <Shield className="w-6 h-6" />, onClick: onShowAdmin!, title: 'Admin', variant: 'admin' as const }] : [])
      ];
    }

    return [
      ...(onGoBack ? [{ id: 'back', icon: <ArrowLeft className="w-6 h-6" />, onClick: onGoBack, title: 'Indietro', variant: 'secondary' as const }] : []),
      ...centerButtons,
      ...(shouldShowHome ? [{ id: 'home', icon: <Home className="w-6 h-6" />, onClick: onGoHome!, title: 'Home', variant: 'primary' as const }] : []),
      ...(shouldShowAdmin ? [{ id: 'admin', icon: <Shield className="w-6 h-6" />, onClick: onShowAdmin!, title: 'Admin', variant: 'admin' as const }] : [])
    ];
  };

  const buttons = buildButtons();

  return (
    <div
      className={`fixed left-0 right-0 bottom-0 bg-[#130202] border-t border-white/10 ${getZIndexClass('BOTTOM_NAV')}`}
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      data-testid="bottom-nav"
    >
      {/* Solid bar — 56px touch area + safe area inset covered by parent bg */}
      <div
        className="flex items-center justify-around px-2"
        style={{ height: '56px' }}
      >
        {buttons.map((button) => (
          <button
            key={button.id}
            onClick={button.onClick}
            title={button.title}
            className={`
              flex-1 h-full flex flex-col items-center justify-center gap-0.5
              transition-all duration-150 active:scale-90 active:opacity-60
              min-w-[48px] max-w-[80px]
              ${button.variant === 'secondary'
                ? 'text-white/40 hover:text-white/70'
                : button.variant === 'admin'
                ? 'text-amber-400/80 hover:text-amber-300'
                : 'text-white/80 hover:text-white'}
            `}
          >
            {button.icon}
          </button>
        ))}

        {/* Search lens sempre visibile come ultimo tab */}
        {FEATURES.ENABLE_WINE_SEARCH && (
          <div className="flex-1 h-full flex items-center justify-center min-w-[48px] max-w-[80px]">
            <SearchLensButton />
          </div>
        )}
      </div>
    </div>
  );
}
