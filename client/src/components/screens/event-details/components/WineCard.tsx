import { Star } from '@/components/icons';
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
    <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 border border-white/10 wine-card-hover">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-base text-white leading-tight flex-1 mr-2">
          {wine.name}
        </h3>
        <span className="bg-amber-400/20 text-amber-200 px-2.5 py-1 rounded-full text-xs font-medium border border-amber-400/20 shrink-0">
          {formatPrice(parseFloat(wine.price))}
        </span>
      </div>

      <p className="text-white/50 text-sm mb-4">
        Portato da: <span className="font-medium text-white/75">{contributor}</span>
      </p>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-white/70">Il tuo voto:</span>
          {userVote ? (
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-semibold text-white">
                {parseFloat(userVote.score.toString()).toFixed(1)}
              </span>
            </div>
          ) : (
            <span className="text-sm text-white/30">Non votato</span>
          )}
        </div>

        <VotingGrid
          currentScore={parseFloat(userVote?.score?.toString() || '0')}
          onScore={onScore}
        />

        <div className="text-center text-xs text-white/25 mt-1">
          Voti da 1 a 10 · step 0.5
        </div>
      </div>
    </div>
  );
}
