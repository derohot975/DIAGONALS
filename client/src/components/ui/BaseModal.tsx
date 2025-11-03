import { ReactNode, useEffect } from 'react';
import { X } from '@/components/icons';
import { getZIndexClass } from '@/styles/tokens/zIndex';

// 🛡️ Contract Lock - Modal Visibility Props (ONLY open allowed)
export interface ModalVisibilityProps {
  open: boolean;
  onOpenChange?: (open: boolean) => void;
}

export interface BaseModalProps extends ModalVisibilityProps {
  onOpenChange: (open: boolean) => void; // Required for contract lock
  title?: ReactNode;
  description?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  dismissible?: boolean;
  preventCloseWhileSubmitting?: boolean;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  showCloseButton?: boolean;
  'data-testid'?: string; // For E2E tests
}

export default function BaseModal({
  open,
  onOpenChange,
  title,
  description,
  footer,
  children,
  size = 'md',
  dismissible = true,
  preventCloseWhileSubmitting = false,
  className = '',
  headerClassName = '',
  contentClassName = '',
  showCloseButton = true,
  'data-testid': testId
}: BaseModalProps) {
  
  // Size variants
  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'max-w-sm';
      case 'md':
        return 'max-w-md';
      case 'lg':
        return 'max-w-2xl';
      case 'xl':
        return 'max-w-4xl';
      default:
        return 'max-w-md';
    }
  };

  // Handle close
  const handleClose = () => {
    if (!preventCloseWhileSubmitting && dismissible) {
      onOpenChange(false);
    }
  };

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  // Handle ESC key
  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open && dismissible && !preventCloseWhileSubmitting) {
        onOpenChange(false);
      }
    };

    if (open) {
      document.addEventListener('keydown', handleEscKey);
      // Body scroll lock
      document.body.style.overflow = 'hidden';
      
      return () => {
        document.removeEventListener('keydown', handleEscKey);
        document.body.style.overflow = 'unset';
      };
    }
  }, [open, dismissible, preventCloseWhileSubmitting, onOpenChange]);

  // Focus trap (simplified)
  useEffect(() => {
    if (open) {
      const focusableElements = document.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      const handleTabKey = (e: KeyboardEvent) => {
        if (e.key === 'Tab') {
          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              lastElement?.focus();
              e.preventDefault();
            }
          } else {
            if (document.activeElement === lastElement) {
              firstElement?.focus();
              e.preventDefault();
            }
          }
        }
      };

      document.addEventListener('keydown', handleTabKey);
      firstElement?.focus();

      return () => {
        document.removeEventListener('keydown', handleTabKey);
      };
    }
  }, [open]);

  if (!open) return null;

  return (
    <div 
      className={`fixed inset-0 bg-black/50 flex items-center justify-center ${getZIndexClass('MODAL_OVERLAY')} p-4`}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      data-testid={testId}
      style={{ touchAction: 'none' }}
      aria-labelledby={title ? 'modal-title' : undefined}
      aria-describedby={description ? 'modal-description' : undefined}
    >
      <div 
        className={`
          bg-white rounded-2xl shadow-2xl w-full max-h-[75vh] overflow-hidden
          ${getSizeStyles()}
          ${className}
        `}
        onClick={(e) => e.stopPropagation()}
        style={{ 
          position: 'relative',
          transform: 'none',
          touchAction: 'manipulation',
          marginBottom: 'var(--bottom-nav-total, 88px)'
        }}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className={`
            ${showCloseButton ? 'flex items-center justify-between' : 'flex items-center justify-center'} p-4 border-b border-gray-200
            ${headerClassName}
          `}>
            <div className={showCloseButton ? "flex-1 min-w-0" : "text-center"}>
              {title && (
                <h2 
                  id="modal-title"
                  className="text-xl font-bold truncate"
                >
                  {title}
                </h2>
              )}
              {description && (
                <p 
                  id="modal-description"
                  className="mt-1 text-sm text-gray-600"
                >
                  {description}
                </p>
              )}
            </div>
            
            {showCloseButton && dismissible && (
              <button
                onClick={handleClose}
                className="ml-4 p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-100"
                aria-label="Chiudi"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className={`
          overflow-y-auto flex-1
          ${title || showCloseButton ? 'p-4' : 'p-4'}
          ${contentClassName}
        `}>
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="border-t border-gray-200 px-4 py-3 bg-gray-50">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
