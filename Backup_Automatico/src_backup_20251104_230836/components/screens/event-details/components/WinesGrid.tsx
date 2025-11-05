import { Plus } from '@/components/icons';
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
      <div className="text-center py-12">
        <Plus className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500 text-lg">Nessun vino registrato</p>
        <p className="text-gray-400 text-sm">Aggiungi il primo vino per iniziare la degustazione</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
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
