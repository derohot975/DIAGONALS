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
  const getWineContributor = (userId: number) => users.find(u => u.id === userId)?.name || 'Sconosciuto';
  const getUserVoteForWine = (wineId: number) => votes.find(v => v.wineId === wineId && v.userId === currentUser.id);

  const TYPE_ORDER: Record<string, number> = { 'Bollicina': 1, 'Bianco': 2, 'Rosso': 3, 'Altro': 4 };
  const sortedWines = [...wines].sort((a, b) => {
    const aO = TYPE_ORDER[a.type as string] || 5;
    const bO = TYPE_ORDER[b.type as string] || 5;
    if (aO !== bO) return aO - bO;
    const aAlc = typeof a.alcohol === 'number' ? a.alcohol : parseFloat(a.alcohol || '0');
    const bAlc = typeof b.alcohol === 'number' ? b.alcohol : parseFloat(b.alcohol || '0');
    return aAlc - bAlc;
  });

  return (
    <div
      className="overflow-y-auto px-6 scrollbar-hide"
      style={{ height: 'calc(100dvh - 220px - var(--bottom-nav-total, 88px) - env(safe-area-inset-top, 0px))' }}
    >
      <div className="max-w-md mx-auto space-y-3">
        {sortedWines.map(wine => (
          <WineListItem
            key={wine.id}
            wine={wine}
            contributor={getWineContributor(wine.userId)}
            userVote={getUserVoteForWine(wine.id)}
            onWineClick={onWineClick}
          />
        ))}
        {wines.length === 0 && (
          <div className="text-center py-16">
            <p className="text-white/30 font-medium">Nessun vino registrato per questo evento</p>
          </div>
        )}
      </div>
    </div>
  );
}
