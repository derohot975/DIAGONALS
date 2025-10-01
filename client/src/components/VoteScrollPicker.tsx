import { useState, useEffect, memo } from 'react';

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

  const handleConfirm = () => {
    onVote(selectedScore);
    onClose();
  };

  const handleScoreSelect = (score: number) => {
    setSelectedScore(score);
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

        {/* Score Grid */}
        <div className="p-6">
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
