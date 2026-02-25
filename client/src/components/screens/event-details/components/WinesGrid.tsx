import { Wine as WineIcon } from '@/components/icons';
import { Wine, Vote } from '@shared/schema';
import WineCard from './WineCard';

interface WinesGridProps {
  eventWines: Wine[];
  getUserVoteForWine: (wineId: number) => Vote | undefined;
  getWineContributor: (userId: number) => string;
  onVoteForWine: (wineId: number, score: number, hasLode: boolean) => void;
}

export default function WinesGrid({
  eventWines,
  getUserVoteForWine,
  getWineContributor,
  onVoteForWine
}: WinesGridProps) {
  if (eventWines.length === 0) {
    return (
      <div className="text-center py-14">
        <WineIcon className="w-14 h-14 text-white/20 mx-auto mb-4" />
        <p className="text-white/50 text-base">Nessun vino registrato</p>
        <p className="text-white/30 text-sm mt-1">Aggiungi il primo vino per iniziare</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 mb-6">
      {eventWines.map(wine => {
        const userVote = getUserVoteForWine(wine.id);
        const contributor = getWineContributor(wine.userId);

        return (
          <WineCard
            key={wine.id}
            wine={wine}
            userVote={userVote}
            contributor={contributor}
            onScore={(score) => onVoteForWine(wine.id, score, false)}
          />
        );
      })}
    </div>
  );
}
