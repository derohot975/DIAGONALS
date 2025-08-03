import { memo } from 'react';

interface ScoreButtonProps {
  score: number;
  wineId?: number;
  currentScore?: number;
  onScore: (score: number) => void;
}

export const ScoreButton = memo(({ score, currentScore, onScore }: ScoreButtonProps) => (
  <button
    onClick={() => onScore(score)}
    className={`score-button px-2 py-1 rounded text-sm font-medium transition-all ${
      currentScore === score 
        ? 'active' 
        : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
    }`}
  >
    {score % 1 === 0 ? score.toString() : score.toFixed(1)}
  </button>
));