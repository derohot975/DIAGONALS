import { Wine, Vote, User } from "@shared/schema";
import WineListItem from "./WineListItem";

interface WineListProps {
  wines: Wine[];
  users: User[];
  votes: Vote[];
  currentUser: User;
  onWineClick: (wineId: number) => void;
}

export default function WineList({ wines, users, votes, currentUser, onWineClick }: WineListProps) {
  const getWineContributor = (userId: number) => {
    return users.find(u => u.id === userId)?.name || 'Sconosciuto';
  };

  const getUserVoteForWine = (wineId: number) => {
    return votes.find(vote => vote.wineId === wineId && vote.userId === currentUser.id);
  };

  const sortedWines = wines.sort((a, b) => {
    // Ordine: Bollicina < Bianco < Rosso < Altro
    const typeOrder = { 'Bollicina': 1, 'Bianco': 2, 'Rosso': 3, 'Altro': 4 };
    const aOrder = typeOrder[a.type as keyof typeof typeOrder] || 5;
    const bOrder = typeOrder[b.type as keyof typeof typeOrder] || 5;
    
    if (aOrder !== bOrder) {
      return aOrder - bOrder;
    }
    
    // Stesso tipo: ordina per gradazione crescente
    const aAlcohol = typeof a.alcohol === 'number' ? a.alcohol : parseFloat(a.alcohol || '0');
    const bAlcohol = typeof b.alcohol === 'number' ? b.alcohol : parseFloat(b.alcohol || '0');
    return aAlcohol - bAlcohol;
  });

  return (
    <div 
      className="overflow-y-auto px-4" 
      style={{
        height: 'calc(100dvh - 180px - var(--bottom-nav-total, 88px) - env(safe-area-inset-top, 0px))',
        paddingBottom: 'var(--bottom-nav-total, 88px)'
      }}
    >
      <div className="max-w-sm mx-auto">
        <div className="space-y-3">
          {sortedWines.map((wine) => {
            const contributor = getWineContributor(wine.userId);
            const userVote = getUserVoteForWine(wine.id);

            return (
              <WineListItem
                key={wine.id}
                wine={wine}
                contributor={contributor}
                userVote={userVote}
                onWineClick={onWineClick}
              />
            );
          })}
        </div>

        {/* No wines message */}
        {wines.length === 0 && (
          <div className="text-center py-8">
            <p className="text-white text-lg">Nessun vino registrato per questo evento</p>
          </div>
        )}

      </div>
    </div>
  );
}
