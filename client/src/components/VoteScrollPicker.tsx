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

  const scores = useMemo(() => {
    const scoresArray: number[] = [];
    for (let i = 0.0; i <= 10.0; i += 0.5) {
      scoresArray.push(Number(i.toFixed(1)));
    }
    return scoresArray;
  }, []);

  useEffect(() => {
    if (isOpen) {
      setSelectedScore(currentVote || 5.0);
    }
  }, [isOpen, currentVote]);

  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && scrollRef.current) {
      const currentIndex = scores.indexOf(selectedScore);
      if (currentIndex !== -1) {
        const itemHeight = 64; 
        const containerHeight = 320; 
        const paddingTop = 128; 
        const scrollTop = currentIndex * itemHeight + paddingTop - containerHeight / 2 + itemHeight / 2;
        
        requestAnimationFrame(() => {
          if (scrollRef.current) {
            isScrollingRef.current = true;
            scrollRef.current.scrollTop = Math.max(0, scrollTop);
            
            const handleScrollEnd = () => {
              isScrollingRef.current = false;
              scrollRef.current?.removeEventListener('scrollend', handleScrollEnd);
            };
            
            scrollRef.current.addEventListener('scrollend', handleScrollEnd);
            setTimeout(() => {
              isScrollingRef.current = false;
              scrollRef.current?.removeEventListener('scrollend', handleScrollEnd);
            }, 300);
          }
        });
      }
    }
  }, [isOpen, selectedScore, scores]);

  const handleScroll = useCallback(() => {
    if (!scrollRef.current || isScrollingRef.current) return;
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    animationFrameRef.current = requestAnimationFrame(() => {
      if (!scrollRef.current) return;
      
      const container = scrollRef.current;
      const itemHeight = 64; 
      const containerHeight = 320; 
      const scrollTop = container.scrollTop;
      const paddingTop = 128; 
      
      const centerPosition = scrollTop + containerHeight / 2;
      const adjustedPosition = centerPosition - paddingTop;
      const selectedIndex = Math.round((adjustedPosition - itemHeight / 2) / itemHeight);
      
      if (selectedIndex >= 0 && selectedIndex < scores.length) {
        const newScore = scores[selectedIndex];
        if (typeof newScore === 'number' && newScore !== selectedScore) {
          setSelectedScore(newScore);
          if (window.navigator.vibrate) window.navigator.vibrate(5);
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
    
    if (scrollRef.current) {
      const index = scores.indexOf(score);
      const itemHeight = 64;
      const containerHeight = 320;
      const paddingTop = 128;
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

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      onKeyDown={handleKeyDown}
    >
      <div 
        className="bg-white/90 backdrop-blur-xl rounded-[2.5rem] shadow-2xl w-full max-w-sm overflow-hidden border border-white/20 animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-8 text-center">
          <div className="text-xs font-semibold text-red-900/40 uppercase tracking-widest mb-1">Vota il vino di</div>
          <div className="text-2xl font-bold text-red-950 tracking-tight">
            {wineName.replace('Vino di ', '').toUpperCase()}
          </div>
        </div>

        <div className="px-8 pb-4">
          <div className="relative">
            <div className="absolute left-4 right-4 top-1/2 transform -translate-y-1/2 h-16 bg-red-50/50 rounded-2xl pointer-events-none z-0 border border-red-100/50 shadow-inner"></div>
            
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
                    className={`h-16 flex items-center justify-center cursor-pointer relative z-20 transition-all duration-300 ${
                      selectedScore === score 
                        ? 'text-4xl font-bold text-red-950 scale-110' 
                        : 'text-xl font-medium text-gray-300'
                    }`}
                    style={{ 
                      scrollSnapAlign: 'center',
                      fontVariantNumeric: 'tabular-nums',
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

        <div className="p-8 pt-4 flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-100 text-gray-500 py-4 px-6 rounded-2xl font-semibold active:scale-95 transition-all"
          >
            Annulla
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 bg-red-950 text-white py-4 px-6 rounded-2xl font-bold shadow-lg shadow-red-950/20 active:scale-95 transition-all"
          >
            Conferma
          </button>
        </div>
      </div>
    </div>
  );
});
