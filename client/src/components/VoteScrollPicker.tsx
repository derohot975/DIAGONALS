import { useState, useRef, useEffect } from 'react';

interface VoteScrollPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onVote: (score: number) => void;
  currentVote?: number;
  wineName: string;
}

export function VoteScrollPicker({ isOpen, onClose, onVote, currentVote, wineName }: VoteScrollPickerProps) {
  const [selectedScore, setSelectedScore] = useState<number>(currentVote || 5.0);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Generate scores from 0.0 to 10.0 in 0.5 increments
  const scores: number[] = [];
  for (let i = 0.0; i <= 10.0; i += 0.5) {
    scores.push(Number(i.toFixed(1)));
  }

  const handleScoreSelect = (score: number) => {
    setSelectedScore(score);
  };

  const handleConfirm = () => {
    onVote(selectedScore);
    onClose();
  };

  useEffect(() => {
    if (isOpen && scrollRef.current) {
      // Center the current score in view
      const currentIndex = scores.indexOf(selectedScore);
      if (currentIndex !== -1) {
        const itemHeight = 48; // Height of each item
        const containerHeight = 320; // Total height of picker
        const visibleItems = Math.floor(containerHeight / itemHeight);
        const centerOffset = Math.floor(visibleItems / 2);
        const scrollTop = (currentIndex - centerOffset) * itemHeight;
        
        setTimeout(() => {
          if (scrollRef.current) {
            scrollRef.current.scrollTop = Math.max(0, scrollTop);
          }
        }, 100);
      }
    }
  }, [isOpen, selectedScore, scores]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50">
      <div className="bg-white rounded-t-3xl w-full max-w-md mx-4 mb-0 overflow-hidden" style={{background: '#F5F5F5'}}>
        
        {/* Header */}
        <div className="p-6 border-b border-gray-200" style={{background: '#300505'}}>
          <h3 className="text-xl font-bold text-center text-white">Vota il vino di</h3>
          <p className="text-lg font-bold text-center text-yellow-400 mt-1">
            {wineName.replace('Vino di ', '').toUpperCase()}
          </p>
        </div>

        {/* iOS-Style Scroll Picker */}
        <div className="relative h-80 overflow-hidden">
          {/* Gradient overlays for iOS effect */}
          <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-gray-100 to-transparent z-10 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-gray-100 to-transparent z-10 pointer-events-none"></div>
          
          {/* Selection highlight */}
          <div className="absolute left-0 right-0 top-1/2 transform -translate-y-1/2 h-12 bg-gray-200 bg-opacity-50 border-t border-b border-gray-300 z-5"></div>
          
          {/* Scrollable content */}
          <div 
            ref={scrollRef}
            className="h-full overflow-y-auto scrollbar-hide px-4"
            style={{
              scrollSnapType: 'y proximity',
              scrollBehavior: 'smooth',
              paddingTop: '140px',
              paddingBottom: '140px'
            }}
            onScroll={(e) => {
              const container = e.target as HTMLDivElement;
              const itemHeight = 48;
              const scrollTop = container.scrollTop;
              const centerPosition = scrollTop + 140; // Half of container height
              const selectedIndex = Math.round(centerPosition / itemHeight);
              const newScore = scores[selectedIndex];
              if (newScore !== undefined && newScore !== selectedScore) {
                setSelectedScore(newScore);
              }
            }}

          >
            {scores.map((score, index) => (
              <div
                key={score}
                className={`h-12 flex items-center justify-center text-2xl transition-all duration-200 cursor-pointer ${
                  selectedScore === score 
                    ? 'font-black scale-110' 
                    : 'font-normal text-gray-400 scale-100'
                }`}
                style={{
                  color: selectedScore === score ? '#300505' : undefined,
                  scrollSnapAlign: 'center'
                }}
                onClick={() => {
                  handleScoreSelect(score);
                  // Scroll to center this item
                  if (scrollRef.current) {
                    const itemHeight = 48;
                    const scrollTop = index * itemHeight;
                    scrollRef.current.scrollTo({
                      top: scrollTop,
                      behavior: 'smooth'
                    });
                  }
                }}
              >
                {score.toFixed(1)}
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 bg-gray-100 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 bg-gray-300 text-gray-700 rounded-xl font-semibold"
          >
            Annulla
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 py-3 px-4 text-white rounded-xl font-semibold"
            style={{background: '#300505'}}
          >
            Conferma {selectedScore.toFixed(1)}
          </button>
        </div>
      </div>
    </div>
  );
}