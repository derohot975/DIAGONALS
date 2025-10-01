import { useState, useEffect, useRef, memo, useCallback } from 'react';

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
  const [useScrollMode, setUseScrollMode] = useState<boolean>(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isScrollingRef = useRef<boolean>(false);

  // Generate scores from 0.0 to 10.0 in 0.5 increments
  const scores: number[] = [];
  for (let i = 0.0; i <= 10.0; i += 0.5) {
    scores.push(Number(i.toFixed(1)));
  }

  // Reset selected score when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedScore(currentVote || 5.0);
    }
  }, [isOpen, currentVote]);

  // Body scroll lock
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isOpen]);

  // Auto-scroll to selected value in scroll mode
  useEffect(() => {
    if (isOpen && useScrollMode && scrollRef.current) {
      const currentIndex = scores.indexOf(selectedScore);
      if (currentIndex !== -1) {
        const itemHeight = 64; // h-16 = 64px
        const containerHeight = 320; // h-80 = 320px
        const paddingTop = 128; // py-32 = 128px
        const scrollTop = currentIndex * itemHeight + paddingTop - containerHeight / 2 + itemHeight / 2;
        
        setTimeout(() => {
          if (scrollRef.current) {
            isScrollingRef.current = true;
            scrollRef.current.scrollTop = Math.max(0, scrollTop);
            setTimeout(() => {
              isScrollingRef.current = false;
            }, 200);
          }
        }, 100);
      }
    }
  }, [isOpen, selectedScore, scores, useScrollMode]);

  // Scroll handler for scroll mode
  const handleScroll = useCallback(() => {
    if (!scrollRef.current || isScrollingRef.current || !useScrollMode) return;
    
    const container = scrollRef.current;
    const itemHeight = 64; // h-16 = 64px
    const containerHeight = 320; // h-80 = 320px
    const scrollTop = container.scrollTop;
    const paddingTop = 128; // py-32 = 128px top padding
    
    // Calculate which item is in the center of the selection box
    const centerPosition = scrollTop + containerHeight / 2;
    const adjustedPosition = centerPosition - paddingTop;
    const selectedIndex = Math.round(adjustedPosition / itemHeight);
    
    if (selectedIndex >= 0 && selectedIndex < scores.length) {
      const newScore = scores[selectedIndex];
      if (typeof newScore === 'number' && newScore !== selectedScore) {
        setSelectedScore(newScore);
      }
    }
  }, [scores, selectedScore, useScrollMode]);

  const handleConfirm = () => {
    onVote(selectedScore);
    onClose();
  };

  const handleScoreSelect = (score: number) => {
    setSelectedScore(score);
    
    // In scroll mode, scroll to selected item
    if (useScrollMode && scrollRef.current) {
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


  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
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
          {useScrollMode ? (
            /* Scroll Mode */
            <div className="relative">
              {/* Selection indicator */}
              <div className="absolute left-0 right-0 top-1/2 transform -translate-y-1/2 h-16 bg-red-100 border-2 border-red-800 rounded-xl pointer-events-none z-10"></div>
              
              {/* Scrollable scores */}
              <div 
                ref={scrollRef}
                className="h-80 overflow-y-scroll scrollbar-hide"
                onScroll={handleScroll}
                style={{
                  scrollSnapType: 'y mandatory',
                  touchAction: 'pan-y',
                  overscrollBehavior: 'contain',
                  WebkitOverflowScrolling: 'touch'
                }}
              >
                <div className="py-32">
                  {scores.map((score) => (
                    <div
                      key={score}
                      className={`h-16 flex items-center justify-center cursor-pointer transition-all duration-200 ${
                        selectedScore === score 
                          ? 'text-2xl font-black text-red-950 relative z-20' 
                          : 'text-lg font-medium text-gray-600 hover:text-red-800 relative z-20'
                      }`}
                      style={{ scrollSnapAlign: 'center' }}
                      onClick={() => handleScoreSelect(score)}
                    >
                      {score % 1 === 0 ? score.toString() : score.toFixed(1)}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Grid Mode (Fallback) */
            <div className="grid grid-cols-4 gap-3 max-h-80 overflow-y-auto">
              {scores.map((score) => (
                <button
                  key={score}
                  onClick={() => handleScoreSelect(score)}
                  className={`
                    h-12 rounded-xl font-semibold transition-all duration-200
                    ${selectedScore === score 
                      ? 'bg-red-100 border-2 border-red-800 text-red-950 scale-105 shadow-lg' 
                      : 'bg-gray-100 border border-gray-300 text-gray-700 hover:bg-gray-200 hover:border-gray-400'
                    }
                  `}
                >
                  {score % 1 === 0 ? score.toString() : score.toFixed(1)}
                </button>
              ))}
            </div>
          )}
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
