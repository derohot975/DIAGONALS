import { useState, useEffect, useRef, memo, useCallback, useMemo } from 'react';

interface VoteScrollPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onVote: (score: number) => void;
  currentVote?: number;
  wineName: string;
}

export const VoteScrollPicker = memo(function VoteScrollPicker({ 
  isOpen, 
  onClose, 
  onVote, 
  currentVote, 
  wineName 
}: VoteScrollPickerProps) {
  const [selectedScore, setSelectedScore] = useState<number>(currentVote || 5.0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isScrollingRef = useRef<boolean>(false);
  const animationFrameRef = useRef<number | null>(null);

  // 1) Stabilizzazione dati di lista - array scores in memoria referenziale stabile
  const scores = useMemo(() => {
    const scoresArray: number[] = [];
    for (let i = 0.0; i <= 10.0; i += 0.5) {
      scoresArray.push(Number(i.toFixed(1)));
    }
    return scoresArray;
  }, []);

  // Reset selected score when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedScore(currentVote || 5.0);
    }
  }, [isOpen, currentVote]);

  // 7) Lock/Unlock scroll del body - standardizzato con BaseModal
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // 2) Autoscroll robusto all'apertura - requestAnimationFrame + scrollend
  useEffect(() => {
    if (isOpen && scrollRef.current) {
      const currentIndex = scores.indexOf(selectedScore);
      if (currentIndex !== -1) {
        const itemHeight = 64; // h-16 = 64px
        const containerHeight = 320; // h-80 = 320px
        const paddingTop = 128; // py-32 = 128px
        const scrollTop = currentIndex * itemHeight + paddingTop - containerHeight / 2 + itemHeight / 2;
        
        // Usa requestAnimationFrame per sincronizzazione robusta
        requestAnimationFrame(() => {
          if (scrollRef.current) {
            isScrollingRef.current = true;
            scrollRef.current.scrollTop = Math.max(0, scrollTop);
            
            // Listener per scrollend (fallback timeout)
            const handleScrollEnd = () => {
              isScrollingRef.current = false;
              scrollRef.current?.removeEventListener('scrollend', handleScrollEnd);
            };
            
            scrollRef.current.addEventListener('scrollend', handleScrollEnd);
            
            // Fallback timeout di sicurezza
            setTimeout(() => {
              isScrollingRef.current = false;
              scrollRef.current?.removeEventListener('scrollend', handleScrollEnd);
            }, 300);
          }
        });
      }
    }
  }, [isOpen, selectedScore, scores]);

  // 5) onScroll più leggero - debounce via requestAnimationFrame
  const handleScroll = useCallback(() => {
    if (!scrollRef.current || isScrollingRef.current) return;
    
    // Cancella frame precedente se pendente
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    // Calcola indice una volta per frame
    animationFrameRef.current = requestAnimationFrame(() => {
      if (!scrollRef.current) return;
      
      const container = scrollRef.current;
      const itemHeight = 64; // h-16 = 64px
      const containerHeight = 320; // h-80 = 320px
      const scrollTop = container.scrollTop;
      const paddingTop = 128; // py-32 = 128px top padding
      
      // Calculate which item is in the center of the selection box - correzione precisione
      const centerPosition = scrollTop + containerHeight / 2;
      const adjustedPosition = centerPosition - paddingTop;
      // Aggiunge offset di metà item per centratura precisa
      const selectedIndex = Math.round((adjustedPosition - itemHeight / 2) / itemHeight);
      
      if (selectedIndex >= 0 && selectedIndex < scores.length) {
        const newScore = scores[selectedIndex];
        if (typeof newScore === 'number' && newScore !== selectedScore) {
          setSelectedScore(newScore);
        }
      }
    });
  }, [scores, selectedScore]);

  const handleConfirm = () => {
    onVote(selectedScore);
    onClose();
  };

  const handleScoreSelect = (score: number) => {
    setSelectedScore(score);
    
    // In scroll mode, scroll to selected item
    if (scrollRef.current) {
      const index = scores.indexOf(score);
      const itemHeight = 64; // h-16 = 64px
      const containerHeight = 320; // h-80 = 320px
      const paddingTop = 128; // py-32 = 128px
      const scrollTop = index * itemHeight + paddingTop - containerHeight / 2 + itemHeight / 2;
      
      isScrollingRef.current = true;
      scrollRef.current.scrollTo({
        top: Math.max(0, scrollTop),
        behavior: 'smooth'
      });
      
      setTimeout(() => {
        isScrollingRef.current = false;
      }, 300);
    }
  };


  // Cleanup animation frame on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // 6) Accessibilità e focus deterministici
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      onKeyDown={handleKeyDown}
    >
      <div 
        className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-red-950 to-red-900 text-white p-6 text-center">
          <div className="text-lg font-medium">Vota il vino di</div>
          <div className="text-xl font-bold mt-1">
            {wineName.replace('Vino di ', '').toUpperCase()}
          </div>
        </div>

        {/* Score Selection */}
        <div className="p-6">
          {/* Scroll Mode */}
          <div className="relative">
            {/* Selection indicator */}
            <div className="absolute left-0 right-0 top-1/2 transform -translate-y-1/2 h-16 bg-red-100 border-2 border-red-800 rounded-xl pointer-events-none z-0"></div>
            
            {/* Scrollable scores */}
            {/* 3) Snap fermo e 4) Transizioni safe per selezione */}
            <div 
              ref={scrollRef}
              className="h-80 overflow-y-scroll scrollbar-hide"
              onScroll={handleScroll}
              style={{
                scrollSnapType: 'y mandatory',
                scrollSnapStop: 'always',
                touchAction: 'pan-y',
                overscrollBehavior: 'contain',
                WebkitOverflowScrolling: 'touch'
              }}
            >
              <div className="py-32">
                {scores.map((score) => (
                  <div
                    key={score}
                    className={`h-16 flex items-center justify-center cursor-pointer relative z-20 ${
                      selectedScore === score 
                        ? 'text-2xl font-black text-red-950' 
                        : 'text-lg font-medium text-gray-600 hover:text-red-800'
                    }`}
                    style={{ 
                      scrollSnapAlign: 'center',
                      fontVariantNumeric: 'tabular-nums',
                      transition: 'color 0.15s ease-out, opacity 0.15s ease-out',
                      opacity: selectedScore === score ? 1 : 0.7
                    }}
                    onClick={() => handleScoreSelect(score)}
                  >
                    {score % 1 === 0 ? score.toString() : score.toFixed(1)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 px-4 rounded-xl font-medium transition-colors"
          >
            Annulla
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 bg-gradient-to-r from-red-900 to-red-800 hover:from-red-950 hover:to-red-900 text-white py-3 px-4 rounded-xl font-bold transition-colors"
          >
            Conferma {selectedScore}
          </button>
        </div>
      </div>
    </div>
  );
});
