import { useState, useRef, useEffect, memo, useMemo } from 'react';
import BaseModal from './ui/BaseModal';

interface VoteScrollPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onVote: (score: number) => void;
  currentVote?: number;
  wineName: string;
}

export const VoteScrollPicker = memo(function VoteScrollPicker({ isOpen, onClose, onVote, currentVote, wineName }: VoteScrollPickerProps) {
  const [selectedScore, setSelectedScore] = useState<number>(currentVote || 5.0);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Generate scores from 0.0 to 10.0 in 0.5 increments - memoized
  const scores = useMemo(() => {
    const scoreArray: number[] = [];
    for (let i = 0.0; i <= 10.0; i += 0.5) {
      scoreArray.push(Number(i.toFixed(1)));
    }
    return scoreArray;
  }, []);

  const handleScoreSelect = (score: number) => {
    setSelectedScore(score);
  };

  const handleConfirm = () => {
    onVote(selectedScore);
    onClose();
  };

  // Auto-scroll to selected value when modal opens - ONLY ONCE
  useEffect(() => {
    if (isOpen && scrollRef.current) {
      const currentIndex = scores.indexOf(selectedScore);
      if (currentIndex !== -1) {
        const itemHeight = 48;
        const scrollTop = currentIndex * itemHeight;
        
        setTimeout(() => {
          if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollTop;
          }
        }, 100);
      }
    }
  }, [isOpen]);

  // Auto-snap to nearest value when scrolling stops - Mobile optimized
  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (!scrollElement || !isOpen) return;
    
    let scrollTimeout: NodeJS.Timeout;
    let isUserScrolling = false;
    
    const handleScrollEnd = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        if (!isUserScrolling) return;
        
        const itemHeight = 48;
        const scrollTop = scrollElement.scrollTop;
        const nearestIndex = Math.round(scrollTop / itemHeight);
        const targetScrollTop = nearestIndex * itemHeight;
        
        if (nearestIndex >= 0 && nearestIndex < scores.length) {
          isUserScrolling = false;
          scrollElement.scrollTo({
            top: targetScrollTop,
            behavior: 'smooth'
          });
          // Update selected score
          setSelectedScore(scores[nearestIndex]);
        }
      }, 150);
    };
    
    const handleScrollStart = () => {
      isUserScrolling = true;
      clearTimeout(scrollTimeout);
    };
    
    // Mobile-first: prioritize touch events
    scrollElement.addEventListener('touchstart', handleScrollStart, { passive: true });
    scrollElement.addEventListener('touchmove', handleScrollStart, { passive: true });
    scrollElement.addEventListener('touchend', handleScrollEnd, { passive: true });
    
    // Fallback for desktop
    scrollElement.addEventListener('scroll', handleScrollEnd, { passive: true });
    
    return () => {
      scrollElement.removeEventListener('touchstart', handleScrollStart);
      scrollElement.removeEventListener('touchmove', handleScrollStart);
      scrollElement.removeEventListener('touchend', handleScrollEnd);
      scrollElement.removeEventListener('scroll', handleScrollEnd);
      clearTimeout(scrollTimeout);
    };
  }, [isOpen, scores]);

  const title = (
    <div className="text-center">
      <div className="text-xl font-normal text-white">Vota il vino di</div>
      <div className="text-lg font-bold text-yellow-400 mt-1">
        {wineName.replace('Vino di ', '').toUpperCase()}
      </div>
    </div>
  );

  const footer = (
    <div className="flex space-x-3">
      <button
        onClick={onClose}
        className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 px-4 rounded-xl font-medium transition-colors"
      >
        Annulla
      </button>
      <button
        onClick={handleConfirm}
        className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black py-3 px-4 rounded-xl font-bold transition-colors"
      >
        Conferma {selectedScore}
      </button>
    </div>
  );

  return (
    <BaseModal
      open={isOpen}
      onOpenChange={onClose}
      title={title}
      size="sm"
      footer={footer}
      headerClassName="bg-[#300505] text-center"
      className="rounded-3xl overflow-hidden bg-[#300505]"
    >

        {/* iOS-Style Scroll Picker */}
        <div className="relative h-64 overflow-hidden" style={{background: '#300505'}}>
          {/* Gradient overlays for iOS effect */}
          <div className="absolute top-0 left-0 right-0 h-12 z-10 pointer-events-none" style={{background: 'linear-gradient(to bottom, #300505, transparent)'}}></div>
          <div className="absolute bottom-0 left-0 right-0 h-12 z-10 pointer-events-none" style={{background: 'linear-gradient(to top, #300505, transparent)'}}></div>
          
          {/* Selection highlight - posizionato al centro esatto */}
          <div className="absolute left-0 right-0 h-12 bg-yellow-400 bg-opacity-20 border-t-2 border-b-2 border-yellow-400 z-5" style={{top: '126px'}}></div>
          
          {/* Scrollable content */}
          <div 
            ref={scrollRef}
            className="h-full overflow-y-scroll scrollbar-hide px-4"
            style={{
              paddingTop: '126px',
              paddingBottom: '78px',
              touchAction: 'pan-y',
              overscrollBehavior: 'contain',
              WebkitOverflowScrolling: 'touch'
            }}
            onScroll={(e) => {
              const container = e.target as HTMLDivElement;
              const itemHeight = 48;
              const scrollTop = container.scrollTop;
              // Centro del picker: padding + metà altezza visibile = 126 + (264-252)/2 = 126 + 6 = 132
              const selectedIndex = Math.round(scrollTop / itemHeight);
              
              if (selectedIndex >= 0 && selectedIndex < scores.length) {
                const newScore = scores[selectedIndex];
                if (typeof newScore === 'number') {
                  setSelectedScore(newScore);
                }
              }
            }}
          >
            {scores.map((score, index) => (
              <div
                key={score}
                className={`h-12 flex items-center justify-center transition-all duration-200 cursor-pointer ${
                  selectedScore === score 
                    ? 'font-black scale-125 text-2xl' 
                    : 'font-normal scale-100 text-lg'
                }`}
                style={{
                  color: selectedScore === score ? '#FFD700' : '#FFFFFF'
                }}
                onClick={() => {
                  setSelectedScore(score);
                  // Smooth scroll to position
                  if (scrollRef.current) {
                    const itemHeight = 48;
                    const targetScrollTop = index * itemHeight;
                    scrollRef.current.scrollTo({
                      top: targetScrollTop,
                      behavior: 'smooth'
                    });
                  }
                }}
              >
                {typeof score === 'number' ? (score % 1 === 0 ? score.toString() : score.toFixed(1)) : '0'}
              </div>
            ))}
          </div>
        </div>
    </BaseModal>
  );
});