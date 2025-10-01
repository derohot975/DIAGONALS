import { useState, useRef, useEffect, memo, useMemo, useCallback } from 'react';

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
  
  // Generate scores from 0.0 to 10.0 in 0.5 increments
  const scores = useMemo(() => {
    const scoreArray: number[] = [];
    for (let i = 0.0; i <= 10.0; i += 0.5) {
      scoreArray.push(Number(i.toFixed(1)));
    }
    return scoreArray;
  }, []);

  const handleConfirm = useCallback(() => {
    onVote(selectedScore);
    onClose();
  }, [selectedScore, onVote, onClose]);

  const handleScoreClick = useCallback((score: number) => {
    setSelectedScore(score);
    if (scrollRef.current) {
      const index = scores.indexOf(score);
      const itemHeight = 64;
      const containerHeight = 320;
      const scrollTop = index * itemHeight - containerHeight / 2 + itemHeight / 2;
      
      isScrollingRef.current = true;
      scrollRef.current.scrollTo({
        top: Math.max(0, scrollTop),
        behavior: 'smooth'
      });
      
      setTimeout(() => {
        isScrollingRef.current = false;
      }, 300);
    }
  }, [scores]);

  // Body scroll lock when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isOpen]);

  // Auto-scroll to selected value when modal opens
  useEffect(() => {
    if (isOpen && scrollRef.current) {
      const currentIndex = scores.indexOf(selectedScore);
      if (currentIndex !== -1) {
        const itemHeight = 64;
        const containerHeight = 320;
        const scrollTop = currentIndex * itemHeight - containerHeight / 2 + itemHeight / 2;
        
        setTimeout(() => {
          if (scrollRef.current) {
            scrollRef.current.scrollTop = Math.max(0, scrollTop);
          }
        }, 150);
      }
    }
  }, [isOpen, selectedScore, scores]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
      style={{ touchAction: 'none' }}
    >
      <div 
        className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        style={{ 
          position: 'relative',
          transform: 'none',
          isolation: 'isolate'
        }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-red-950 to-red-900 text-white p-6 text-center">
          <div className="text-lg font-medium">Vota il vino di</div>
          <div className="text-xl font-bold mt-1">
            {wineName.replace('Vino di ', '').toUpperCase()}
          </div>
        </div>

        {/* Score Picker */}
        <div className="p-6">
          <div className="relative">
            {/* Selection indicator with high contrast */}
            <div 
              className="absolute left-0 right-0 top-1/2 transform -translate-y-1/2 h-16 bg-red-100 border-2 border-red-800 rounded-xl pointer-events-none z-0"
              style={{
                boxShadow: 'inset 0 0 0 1px rgba(127, 29, 29, 0.2)'
              }}
            ></div>
            
            {/* Scrollable scores */}
            <div 
              ref={scrollRef}
              className="h-80 overflow-y-scroll scrollbar-hide"
              style={{
                scrollSnapType: 'y mandatory',
                touchAction: 'pan-y',
                overscrollBehavior: 'contain',
                WebkitOverflowScrolling: 'touch',
                contain: 'strict',
                isolation: 'isolate'
              }}
            >
              <div className="py-32">
                {scores.map((score) => (
                  <div
                    key={score}
                    className={`h-16 flex items-center justify-center cursor-pointer select-none ${
                      selectedScore === score 
                        ? 'text-3xl font-black text-red-950 scale-110 relative z-10' 
                        : 'text-xl font-medium text-gray-600 hover:text-red-800 relative z-10'
                    }`}
                    style={{ 
                      scrollSnapAlign: 'center',
                      transition: 'all 0.2s ease-out'
                    }}
                    onClick={() => handleScoreClick(score)}
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