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

  // Auto-scroll to selected value when modal opens
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
  
  // Add scroll event listener for auto-snap
  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (!scrollElement || !isOpen) return;
    
    let scrollTimeout: NodeJS.Timeout;
    
    const handleScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const itemHeight = 48;
        const scrollTop = scrollElement.scrollTop;
        const centerPosition = scrollTop + 116;
        const nearestIndex = Math.round(centerPosition / itemHeight);
        const targetScrollTop = nearestIndex * itemHeight;
        
        // Validate index bounds
        if (nearestIndex >= 0 && nearestIndex < scores.length) {
          scrollElement.scrollTo({
            top: targetScrollTop,
            behavior: 'smooth'
          });
          
          const newScore = scores[nearestIndex];
          if (typeof newScore === 'number') {
            setSelectedScore(newScore);
          }
        }
      }, 150);
    };
    
    scrollElement.addEventListener('scroll', handleScroll);
    return () => {
      scrollElement.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, [isOpen, scores, setSelectedScore]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden" style={{background: '#300505'}}>
        
        {/* Header */}
        <div className="p-6 border-b border-gray-200" style={{background: '#300505'}}>
          <h3 className="text-xl font-bold text-center text-white">Vota il vino di</h3>
          <p className="text-lg font-bold text-center text-yellow-400 mt-1">
            {wineName.replace('Vino di ', '').toUpperCase()}
          </p>
        </div>

        {/* iOS-Style Scroll Picker */}
        <div className="relative h-64 overflow-hidden" style={{background: '#8d0303'}}>
          {/* Gradient overlays for iOS effect */}
          <div className="absolute top-0 left-0 right-0 h-12 z-10 pointer-events-none" style={{background: 'linear-gradient(to bottom, #8d0303, transparent)'}}></div>
          <div className="absolute bottom-0 left-0 right-0 h-12 z-10 pointer-events-none" style={{background: 'linear-gradient(to top, #8d0303, transparent)'}}></div>
          
          {/* Selection highlight */}
          <div className="absolute left-0 right-0 top-1/2 transform -translate-y-1/2 h-12 bg-yellow-400 bg-opacity-20 border-t-2 border-b-2 border-yellow-400 z-5"></div>
          
          {/* Scrollable content */}
          <div 
            ref={scrollRef}
            className="h-full overflow-y-scroll scrollbar-hide px-4"
            style={{
              paddingTop: '116px',
              paddingBottom: '116px'
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
                {typeof score === 'number' ? score.toFixed(1) : '0.0'}
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 flex gap-3" style={{background: '#300505'}}>
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 bg-gray-500 text-white rounded-xl font-semibold hover:bg-gray-600"
          >
            Annulla
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 py-3 px-4 text-black rounded-xl font-semibold hover:bg-yellow-300"
            style={{background: '#FFD700'}}
          >
            Conferma {typeof selectedScore === 'number' ? selectedScore.toFixed(1) : '0.0'}
          </button>
        </div>
      </div>
    </div>
  );
}