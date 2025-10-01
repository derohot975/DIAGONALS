import { useState, useRef, useEffect, memo, useMemo } from 'react';

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
  
  // Generate scores from 0.0 to 10.0 in 0.5 increments
  const scores = useMemo(() => {
    const scoreArray: number[] = [];
    for (let i = 0.0; i <= 10.0; i += 0.5) {
      scoreArray.push(Number(i.toFixed(1)));
    }
    return scoreArray;
  }, []);

  const handleConfirm = () => {
    onVote(selectedScore);
    onClose();
  };

  const handleScoreClick = (score: number) => {
    setSelectedScore(score);
  };

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
        const itemHeight = 60;
        const containerHeight = 300;
        const scrollTop = currentIndex * itemHeight - containerHeight / 2 + itemHeight / 2;
        
        setTimeout(() => {
          if (scrollRef.current) {
            scrollRef.current.scrollTop = Math.max(0, scrollTop);
          }
        }, 100);
      }
    }
  }, [isOpen, selectedScore, scores]);

  // Handle scroll to update selection
  const handleScroll = () => {
    if (!scrollRef.current) return;
    
    const container = scrollRef.current;
    const itemHeight = 60;
    const containerHeight = 300;
    const scrollTop = container.scrollTop;
    const centerPosition = scrollTop + containerHeight / 2;
    const selectedIndex = Math.round(centerPosition / itemHeight);
    
    if (selectedIndex >= 0 && selectedIndex < scores.length) {
      const newScore = scores[selectedIndex];
      if (typeof newScore === 'number' && newScore !== selectedScore) {
        setSelectedScore(newScore);
      }
    }
  };

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
          transform: 'none'
        }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 to-yellow-600 text-white p-6 text-center">
          <div className="text-lg font-medium">Vota il vino di</div>
          <div className="text-xl font-bold mt-1">
            {wineName.replace('Vino di ', '').toUpperCase()}
          </div>
        </div>

        {/* Score Picker */}
        <div className="p-6">
          <div className="relative">
            {/* Selection indicator */}
            <div className="absolute left-0 right-0 top-1/2 transform -translate-y-1/2 h-16 bg-amber-100 border-2 border-amber-400 rounded-xl pointer-events-none z-10"></div>
            
            {/* Scrollable scores */}
            <div 
              ref={scrollRef}
              className="h-80 overflow-y-auto scrollbar-hide"
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
                        ? 'text-3xl font-bold text-amber-700' 
                        : 'text-xl font-medium text-gray-600 hover:text-amber-600'
                    }`}
                    style={{ scrollSnapAlign: 'center' }}
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
            className="flex-1 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white py-3 px-4 rounded-xl font-bold transition-colors"
          >
            Conferma {selectedScore}
          </button>
        </div>
      </div>
    </div>
  );
});