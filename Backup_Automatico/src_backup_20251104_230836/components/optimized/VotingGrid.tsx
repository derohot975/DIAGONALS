import { memo } from 'react';
import { ScoreButton } from './ScoreButton';

interface VotingGridProps {
  currentScore?: number;
  onScore: (score: number) => void;
}

const scoreRanges = [
  [1, 1.5, 2, 2.5, 3],
  [3.5, 4, 4.5, 5, 5.5],
  [6, 6.5, 7, 7.5, 8],
  [8.5, 9, 9.5, 10]
];

export const VotingGrid = memo(({ currentScore, onScore }: VotingGridProps) => (
  <div className="space-y-2">
    {scoreRanges.map((range, index) => (
      <div 
        key={index} 
        className={`grid gap-1 ${index === 3 ? 'grid-cols-4' : 'grid-cols-5'}`}
      >
        {range.map(score => (
          <ScoreButton
            key={score}
            score={score}
            currentScore={currentScore}
            onScore={onScore}
          />
        ))}
      </div>
    ))}
  </div>
));