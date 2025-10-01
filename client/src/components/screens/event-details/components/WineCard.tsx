import { Star, Eye } from '@/components/icons';
import { Wine, Vote } from '@shared/schema';
import { formatPrice } from '@/lib/utils';
import { VotingGrid } from '@/components/optimized/VotingGrid';

interface WineCardProps {
  wine: Wine;
  userVote: Vote | undefined;
  contributor: string;
  onScore: (score: number) => void;
}

export default function WineCard({ wine, userVote, contributor, onScore }: WineCardProps) {
  return (
    <div className="bg-white rounded-xl p-4 border-2 border-[hsl(229,73%,69%)]/20 wine-card-hover">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-lg text-gray-800">
          {wine.name}
        </h3>
        <div className="flex items-center space-x-2">
          <span className="bg-[hsl(43,96%,56%)] text-white px-2 py-1 rounded-full text-xs">
            {formatPrice(parseFloat(wine.price))}
          </span>
          <Eye className="w-4 h-4 text-gray-600" />
        </div>
      </div>
      <p className="text-gray-600 text-sm mb-4">
        Portato da: <span className="font-medium">{contributor}</span>
      </p>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Il tuo voto:</span>
          {userVote ? (
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 text-[hsl(43,96%,56%)]" />
              <span className="text-sm font-medium">{parseFloat(userVote.score.toString()).toFixed(1)}</span>
            </div>
          ) : (
            <span className="text-sm text-gray-500">Non votato</span>
          )}
        </div>
        
        <VotingGrid
          currentScore={parseFloat(userVote?.score?.toString() || '0')}
          onScore={onScore}
        />
        
        <div className="text-center text-xs text-gray-500 mt-2">
          Voti da 1 a 10 con step 0.5
        </div>
      </div>
    </div>
  );
}
